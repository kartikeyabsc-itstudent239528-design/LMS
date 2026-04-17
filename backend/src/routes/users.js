import express from "express";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";
import db from "../db.js";

const router = express.Router();



router.get("/", authMiddleware, requireAdmin, async(req, res) => {
    const users = await db.allAsync("SELECT id, name, email, role, createdAt FROM users ORDER BY createdAt DESC");
    res.json(users);
});

export default router;