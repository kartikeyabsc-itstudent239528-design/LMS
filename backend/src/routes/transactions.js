import express from "express";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";
import db from "../db.js";

const router = express.Router();

router.get("/", authMiddleware, requireAdmin, (req, res) => {
    const transactions = db.prepare("SELECT * FROM transactions ORDER BY issueDate DESC").all();
    res.json(transactions);
});

router.get("/user/:userId", authMiddleware, (req, res) => {
    const { userId } = req.params;
    if (req.user.userId !== userId && req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
    }
    const transactions = db.prepare("SELECT * FROM transactions WHERE userId = ? ORDER BY issueDate DESC").all(userId);
    res.json(transactions);
});

router.post("/borrow", authMiddleware, (req, res) => {
    const { userId, bookId } = req.body;
    if (!userId || !bookId) return res.status(400).json({ error: "userId and bookId are required" });
    if (req.user.userId !== userId && req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
    }

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    const book = db.prepare("SELECT * FROM books WHERE id = ?").get(bookId);
    if (!user || !book) return res.status(404).json({ error: "User or book not found" });
    if (book.available <= 0) return res.status(400).json({ error: "Book not available" });

    const issueDate = new Date().toISOString().split("T")[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    db.prepare("UPDATE books SET available = available - 1 WHERE id = ?").run(bookId);
    const id = `t${Date.now()}`;
    db.prepare(`
    INSERT INTO transactions (id, userId, bookId, bookTitle, userName, issueDate, dueDate, returnDate, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, user.id, book.id, book.title, user.name, issueDate, dueDate.toISOString().split("T")[0], null, "issued");

    const transaction = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id);
    res.status(201).json(transaction);
});

router.post("/issue", authMiddleware, requireAdmin, (req, res) => {
    const { userId, bookId } = req.body;
    if (!userId || !bookId) return res.status(400).json({ error: "userId and bookId are required" });

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    const book = db.prepare("SELECT * FROM books WHERE id = ?").get(bookId);
    if (!user || !book) return res.status(404).json({ error: "User or book not found" });
    if (book.available <= 0) return res.status(400).json({ error: "Book not available" });

    const issueDate = new Date().toISOString().split("T")[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    db.prepare("UPDATE books SET available = available - 1 WHERE id = ?").run(bookId);
    const id = `t${Date.now()}`;
    db.prepare(`
    INSERT INTO transactions (id, userId, bookId, bookTitle, userName, issueDate, dueDate, returnDate, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, user.id, book.id, book.title, user.name, issueDate, dueDate.toISOString().split("T")[0], null, "issued");

    const transaction = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id);
    res.status(201).json(transaction);
});

router.post("/return/:transactionId", authMiddleware, (req, res) => {
    const { transactionId } = req.params;
    const transaction = db.prepare("SELECT * FROM transactions WHERE id = ?").get(transactionId);
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });
    if (req.user.userId !== transaction.userId && req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
    }
    if (transaction.status === "returned") {
        return res.status(400).json({ error: "Already returned" });
    }

    const returnDate = new Date().toISOString().split("T")[0];
    const status = "returned";

    db.prepare("UPDATE transactions SET returnDate = ?, status = ? WHERE id = ?").run(returnDate, status, transactionId);
    db.prepare("UPDATE books SET available = available + 1 WHERE id = ?").run(transaction.bookId);

    const updated = db.prepare("SELECT * FROM transactions WHERE id = ?").get(transactionId);
    res.json(updated);
});

export default router;