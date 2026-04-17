import express from "express";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";
import db from "../db.js";

const router = express.Router();

// Get all publishers
router.get("/", async(req, res) => {
    try {
        const publishers = await db.allAsync("SELECT * FROM publishers ORDER BY name");
        res.json(publishers);
    } catch (err) {
        console.error("Error fetching publishers:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get publisher by ID
router.get("/:id", async(req, res) => {
    try {
        const publisher = await db.getAsync("SELECT * FROM publishers WHERE id = ?", req.params.id);
        if (!publisher) return res.status(404).json({ error: "Publisher not found" });
        res.json(publisher);
    } catch (err) {
        console.error("Error fetching publisher:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Create publisher (admin only)
router.post("/", authMiddleware, requireAdmin, async(req, res) => {
    try {
        const { name, address, phone, email, website } = req.body;
        if (!name) return res.status(400).json({ error: "Name is required" });

        const id = `p${Date.now()}`;
        await db.runAsync("INSERT INTO publishers (id, name, address, phone, email, website) VALUES (?, ?, ?, ?, ?, ?)", id, name, address, phone, email, website);
        const publisher = await db.getAsync("SELECT * FROM publishers WHERE id = ?", id);
        res.status(201).json(publisher);
    } catch (err) {
        console.error("Error creating publisher:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update publisher (admin only)
router.put("/:id", authMiddleware, requireAdmin, async(req, res) => {
    try {
        const { name, address, phone, email, website } = req.body;
        const result = await db.runAsync("UPDATE publishers SET name = ?, address = ?, phone = ?, email = ?, website = ? WHERE id = ?", name, address, phone, email, website, req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: "Publisher not found" });
        const publisher = await db.getAsync("SELECT * FROM publishers WHERE id = ?", req.params.id);
        res.json(publisher);
    } catch (err) {
        console.error("Error updating publisher:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete publisher (admin only)
router.delete("/:id", authMiddleware, requireAdmin, async(req, res) => {
    try {
        const result = await db.runAsync("DELETE FROM publishers WHERE id = ?", req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: "Publisher not found" });
        res.status(204).end();
    } catch (err) {
        console.error("Error deleting publisher:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;