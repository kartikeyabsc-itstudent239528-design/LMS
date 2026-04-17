import express from "express";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";
import db from "../db.js";

const router = express.Router();

// Get all categories
router.get("/", async(req, res) => {
    try {
        const categories = await db.allAsync("SELECT * FROM categories ORDER BY name");
        res.json(categories);
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get category by ID
router.get("/:id", async(req, res) => {
    try {
        const category = await db.getAsync("SELECT * FROM categories WHERE id = ?", req.params.id);
        if (!category) return res.status(404).json({ error: "Category not found" });
        res.json(category);
    } catch (err) {
        console.error("Error fetching category:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Create category (admin only)
router.post("/", authMiddleware, requireAdmin, async(req, res) => {
    try {
        const { name, parentId } = req.body;
        if (!name) return res.status(400).json({ error: "Name is required" });

        const id = `c${Date.now()}`;
        await db.runAsync("INSERT INTO categories (id, name, parentId) VALUES (?, ?, ?)", id, name, parentId);
        const category = await db.getAsync("SELECT * FROM categories WHERE id = ?", id);
        res.status(201).json(category);
    } catch (err) {
        console.error("Error creating category:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update category (admin only)
router.put("/:id", authMiddleware, requireAdmin, async(req, res) => {
    try {
        const { name, parentId } = req.body;
        const result = await db.runAsync("UPDATE categories SET name = ?, parentId = ? WHERE id = ?", name, parentId, req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: "Category not found" });
        const category = await db.getAsync("SELECT * FROM categories WHERE id = ?", req.params.id);
        res.json(category);
    } catch (err) {
        console.error("Error updating category:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete category (admin only)
router.delete("/:id", authMiddleware, requireAdmin, async(req, res) => {
    try {
        const result = await db.runAsync("DELETE FROM categories WHERE id = ?", req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: "Category not found" });
        res.status(204).end();
    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;