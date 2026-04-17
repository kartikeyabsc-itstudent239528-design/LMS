import express from "express";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";
import db from "../db.js";

const router = express.Router();

// Get all authors
router.get("/", async(req, res) => {
    try {
        const authors = await db.allAsync("SELECT * FROM authors ORDER BY name");
        res.json(authors);
    } catch (err) {
        console.error("Error fetching authors:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get author by ID
router.get("/:id", async(req, res) => {
    try {
        const author = await db.getAsync("SELECT * FROM authors WHERE id = ?", req.params.id);
        if (!author) return res.status(404).json({ error: "Author not found" });
        res.json(author);
    } catch (err) {
        console.error("Error fetching author:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Create author (admin only)
router.post("/", authMiddleware, requireAdmin, async(req, res) => {
    try {
        const { name, bio, nationality, birthDate, deathDate } = req.body;
        if (!name) return res.status(400).json({ error: "Name is required" });

        const id = `a${Date.now()}`;
        await db.runAsync("INSERT INTO authors (id, name, bio, nationality, birthDate, deathDate) VALUES (?, ?, ?, ?, ?, ?)", id, name, bio, nationality, birthDate, deathDate);
        const author = await db.getAsync("SELECT * FROM authors WHERE id = ?", id);
        res.status(201).json(author);
    } catch (err) {
        console.error("Error creating author:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update author (admin only)
router.put("/:id", authMiddleware, requireAdmin, async(req, res) => {
    try {
        const { name, bio, nationality, birthDate, deathDate } = req.body;
        const result = await db.runAsync("UPDATE authors SET name = ?, bio = ?, nationality = ?, birthDate = ?, deathDate = ? WHERE id = ?", name, bio, nationality, birthDate, deathDate, req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: "Author not found" });
        const author = await db.getAsync("SELECT * FROM authors WHERE id = ?", req.params.id);
        res.json(author);
    } catch (err) {
        console.error("Error updating author:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete author (admin only)
router.delete("/:id", authMiddleware, requireAdmin, async(req, res) => {
    try {
        const result = await db.runAsync("DELETE FROM authors WHERE id = ?", req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: "Author not found" });
        res.status(204).end();
    } catch (err) {
        console.error("Error deleting author:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;