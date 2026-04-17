import express from "express";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";
import db from "../db.js";

const router = express.Router();

router.get("/", authMiddleware, requireAdmin, (req, res) => {
  const users = db.prepare("SELECT id, name, email, role, createdAt FROM users ORDER BY createdAt DESC").all();
  res.json(users);
});

export default router;
