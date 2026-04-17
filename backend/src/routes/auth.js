import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import db from "../db.js";
import { signToken, authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken({ userId: user.id, role: user.role });
  return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }, token });
});

router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Name, email, and password are required" });

  const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const id = uuidv4();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const createdAt = new Date().toISOString().split("T")[0];

  db.prepare("INSERT INTO users (id, name, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)").run(id, name, email, hashedPassword, "user", createdAt);

  const token = signToken({ userId: id, role: "user" });
  return res.status(201).json({ user: { id, name, email, role: "user", createdAt }, token });
});

router.get("/me", authMiddleware, (req, res) => {
  const user = db.prepare("SELECT id, name, email, role, createdAt FROM users WHERE id = ?").get(req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user });
});

export default router;
