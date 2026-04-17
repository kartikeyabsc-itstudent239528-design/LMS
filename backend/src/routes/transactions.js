import express from "express";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";
import db from "../db.js";

const router = express.Router();

router.get("/", authMiddleware, requireAdmin, async(req, res) => {
    const transactions = await db.allAsync("SELECT * FROM transactions ORDER BY issueDate DESC");
    res.json(transactions);
});

router.get("/user/:userId", authMiddleware, async(req, res) => {
    const { userId } = req.params;
    if (req.user.userId !== userId && req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
    }
    const transactions = await db.allAsync("SELECT * FROM transactions WHERE userId = ? ORDER BY issueDate DESC", userId);
    res.json(transactions);
});

router.post("/borrow", authMiddleware, async(req, res) => {
    try {
        const { userId, bookId } = req.body;
        if (!userId || !bookId) return res.status(400).json({ error: "userId and bookId are required" });
        if (req.user.userId !== userId && req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied" });
        }

        const user = await db.getAsync("SELECT * FROM users WHERE id = ?", userId);
        const book = await db.getAsync("SELECT * FROM books WHERE id = ?", bookId);
        if (!user || !book) return res.status(404).json({ error: "User or book not found" });
        if (book.available <= 0) return res.status(400).json({ error: "Book not available" });

        const issueDate = new Date().toISOString().split("T")[0];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        await db.runAsync("UPDATE books SET available = available - 1 WHERE id = ?", bookId);
        const id = `t${Date.now()}`;
        await db.runAsync(`
        INSERT INTO transactions (id, userId, bookId, bookTitle, userName, issueDate, dueDate, returnDate, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, id, user.id, book.id, book.title, user.name, issueDate, dueDate.toISOString().split("T")[0], null, "issued");

        const transaction = await db.getAsync("SELECT * FROM transactions WHERE id = ?", id);
        res.status(201).json(transaction);
    } catch (err) {
        console.error("Error in borrow:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/issue", authMiddleware, requireAdmin, async(req, res) => {
    try {
        const { userId, bookId } = req.body;
        if (!userId || !bookId) return res.status(400).json({ error: "userId and bookId are required" });

        const user = await db.getAsync("SELECT * FROM users WHERE id = ?", userId);
        const book = await db.getAsync("SELECT * FROM books WHERE id = ?", bookId);
        if (!user || !book) return res.status(404).json({ error: "User or book not found" });
        if (book.available <= 0) return res.status(400).json({ error: "Book not available" });

        const issueDate = new Date().toISOString().split("T")[0];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        await db.runAsync("UPDATE books SET available = available - 1 WHERE id = ?", bookId);
        const id = `t${Date.now()}`;
        await db.runAsync(`
        INSERT INTO transactions (id, userId, bookId, bookTitle, userName, issueDate, dueDate, returnDate, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, id, user.id, book.id, book.title, user.name, issueDate, dueDate.toISOString().split("T")[0], null, "issued");

        const transaction = await db.getAsync("SELECT * FROM transactions WHERE id = ?", id);
        res.status(201).json(transaction);
    } catch (err) {
        console.error("Error in issue:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/return/:transactionId", authMiddleware, async(req, res) => {
    try {
        const { transactionId } = req.params;
        const transaction = await db.getAsync("SELECT * FROM transactions WHERE id = ?", transactionId);
        if (!transaction) return res.status(404).json({ error: "Transaction not found" });
        if (req.user.userId !== transaction.userId && req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied" });
        }
        if (transaction.status === "returned") {
            return res.status(400).json({ error: "Already returned" });
        }

        const returnDate = new Date().toISOString().split("T")[0];
        const status = "returned";

        await db.runAsync("UPDATE transactions SET returnDate = ?, status = ? WHERE id = ?", returnDate, status, transactionId);
        await db.runAsync("UPDATE books SET available = available + 1 WHERE id = ?", transaction.bookId);

        const updated = await db.getAsync("SELECT * FROM transactions WHERE id = ?", transactionId);
        res.json(updated);
    } catch (err) {
        console.error("Error in return:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;