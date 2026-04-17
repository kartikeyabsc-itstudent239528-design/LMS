import express from "express";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";
import db from "../db.js";

const router = express.Router();

router.get("/", async(req, res) => {
    const books = await db.allAsync(`
        SELECT b.*, a.name as authorName, p.name as publisherName, c.name as categoryName
        FROM books b
        LEFT JOIN authors a ON b.authorId = a.id
        LEFT JOIN publishers p ON b.publisherId = p.id
        LEFT JOIN categories c ON b.categoryId = c.id
        ORDER BY b.title
    `);
    res.json(books);
});

router.get("/:id", async(req, res) => {
    const book = await db.getAsync(`
        SELECT b.*, a.name as authorName, p.name as publisherName, c.name as categoryName
        FROM books b
        LEFT JOIN authors a ON b.authorId = a.id
        LEFT JOIN publishers p ON b.publisherId = p.id
        LEFT JOIN categories c ON b.categoryId = c.id
        WHERE b.id = ?
    `, req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
});

router.post("/", authMiddleware, requireAdmin, async(req, res) => {
    const { title, authorId, publisherId, categoryId, isbn, quantity, available, coverImage = "", description = "", publishedYear } = req.body;
    if (!title || !authorId || !categoryId || !isbn || quantity == null || available == null || publishedYear == null) {
        return res.status(400).json({ error: "Missing required book data" });
    }
    const id = `b${Date.now()}`;

    console.log(`Adding book: ${title} by ${authorId} (ISBN: ${isbn}) with quantity ${quantity} and available ${available}`);
    await db.runAsync("INSERT INTO books (id, title, authorId, publisherId, categoryId, isbn, quantity, available, coverImage, description, publishedYear) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        id, title, authorId, publisherId, categoryId, isbn, quantity, available, coverImage, description, publishedYear);
    const book = await db.getAsync(`
        SELECT b.*, a.name as authorName, p.name as publisherName, c.name as categoryName
        FROM books b
        LEFT JOIN authors a ON b.authorId = a.id
        LEFT JOIN publishers p ON b.publisherId = p.id
        LEFT JOIN categories c ON b.categoryId = c.id
        WHERE b.id = ?
    `, id);
    res.status(201).json(book);
});

router.put("/:id", authMiddleware, requireAdmin, async(req, res) => {
    const { id } = req.params;
    const existing = await db.getAsync("SELECT * FROM books WHERE id = ?", id);
    if (!existing) return res.status(404).json({ error: "Book not found" });

    const updates = {
        title: req.body.title ?? existing.title,
        authorId: req.body.authorId ?? existing.authorId,
        publisherId: req.body.publisherId ?? existing.publisherId,
        categoryId: req.body.categoryId ?? existing.categoryId,
        isbn: req.body.isbn ?? existing.isbn,
        quantity: req.body.quantity ?? existing.quantity,
        available: req.body.available ?? existing.available,
        coverImage: req.body.coverImage ?? existing.coverImage,
        description: req.body.description ?? existing.description,
        publishedYear: req.body.publishedYear ?? existing.publishedYear,
    };

    await db.runAsync(`
    UPDATE books SET title = ?, authorId = ?, publisherId = ?, categoryId = ?, isbn = ?, quantity = ?, available = ?, coverImage = ?, description = ?, publishedYear = ? WHERE id = ?
  `, updates.title, updates.authorId, updates.publisherId, updates.categoryId, updates.isbn, updates.quantity, updates.available, updates.coverImage, updates.description, updates.publishedYear, id);

    const updatedBook = await db.getAsync(`
        SELECT b.*, a.name as authorName, p.name as publisherName, c.name as categoryName
        FROM books b
        LEFT JOIN authors a ON b.authorId = a.id
        LEFT JOIN publishers p ON b.publisherId = p.id
        LEFT JOIN categories c ON b.categoryId = c.id
        WHERE b.id = ?
    `, id);
    res.json(updatedBook);
});

router.delete("/:id", authMiddleware, requireAdmin, async(req, res) => {
    const result = await db.runAsync("DELETE FROM books WHERE id = ?", req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: "Book not found" });
    res.status(204).end();
});

export default router;