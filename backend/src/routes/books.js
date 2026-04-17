import express from "express";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";
import db from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  const books = db.prepare("SELECT * FROM books ORDER BY title").all();
  res.json(books);
});

router.get("/:id", (req, res) => {
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json(book);
});

router.post("/", authMiddleware, requireAdmin, (req, res) => {
  const { title, author, category, isbn, quantity, available, coverImage = "", description = "", publishedYear } = req.body;
  if (!title || !author || !category || !isbn || quantity == null || available == null || publishedYear == null) {
    return res.status(400).json({ error: "Missing required book data" });
  }
  const id = `b${Date.now()}`;
  db.prepare("INSERT INTO books (id, title, author, category, isbn, quantity, available, coverImage, description, publishedYear) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, title, author, category, isbn, quantity, available, coverImage, description, publishedYear);
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(id);
  res.status(201).json(book);
});

router.put("/:id", authMiddleware, requireAdmin, (req, res) => {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM books WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Book not found" });

  const updates = {
    title: req.body.title ?? existing.title,
    author: req.body.author ?? existing.author,
    category: req.body.category ?? existing.category,
    isbn: req.body.isbn ?? existing.isbn,
    quantity: req.body.quantity ?? existing.quantity,
    available: req.body.available ?? existing.available,
    coverImage: req.body.coverImage ?? existing.coverImage,
    description: req.body.description ?? existing.description,
    publishedYear: req.body.publishedYear ?? existing.publishedYear,
  };

  db.prepare(`
    UPDATE books SET title = ?, author = ?, category = ?, isbn = ?, quantity = ?, available = ?, coverImage = ?, description = ?, publishedYear = ? WHERE id = ?
  `).run(updates.title, updates.author, updates.category, updates.isbn, updates.quantity, updates.available, updates.coverImage, updates.description, updates.publishedYear, id);

  const updatedBook = db.prepare("SELECT * FROM books WHERE id = ?").get(id);
  res.json(updatedBook);
});

router.delete("/:id", authMiddleware, requireAdmin, (req, res) => {
  const result = db.prepare("DELETE FROM books WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Book not found" });
  res.status(204).end();
});

export default router;
