import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import db from "../db.js";
import { signToken, authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", async(req, res) => {
    const { email, password } = req.body;

    console.log(`Login attempt for email: ${email} at ${new Date().toISOString()}`);
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const emailNormalized = email.toLowerCase();

    const user = await db.getAsync(
        "SELECT * FROM users WHERE email = ?",
        emailNormalized
    );
    console.log(`User lookup for email: ${email} - Found: ${!!user} at ${new Date().toISOString()}`);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken({ userId: user.id, role: user.role });

    console.log(`
                    User $ { user.email }
                    logged in at $ { new Date().toISOString() }
                    `);
    return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }, token });
});

router.post("/signup", async(req, res) => {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
    }

    email = email.toLowerCase(); // ✅ normalize

    const existing = await db.getAsync(
        "SELECT * FROM users WHERE email = ?",
        email
    );

    if (existing) {
        return res.status(409).json({ error: "Email already registered" });
    }

    const id = uuidv4();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const createdAt = new Date().toISOString().split("T")[0];

    await db.runAsync(
        "INSERT INTO users (id, name, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
        id,
        name,
        email,
        hashedPassword,
        "user",
        createdAt
    );

    const token = signToken({ userId: id, role: "user" });

    return res.status(201).json({
        user: { id, name, email, role: "user", createdAt },
        token
    });
});

router.get("/me", authMiddleware, async(req, res) => {
    const user = await db.getAsync("SELECT id, name, email, role, createdAt FROM users WHERE id = ?", req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ user });
});

export default router;