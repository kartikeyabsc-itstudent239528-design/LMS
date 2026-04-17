import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import booksRoutes from "./routes/books.js";
import usersRoutes from "./routes/users.js";
import transactionsRoutes from "./routes/transactions.js";
import authorsRoutes from "./routes/authors.js";
import publishersRoutes from "./routes/publishers.js";
import categoriesRoutes from "./routes/categories.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/authors", authorsRoutes);
app.use("/api/publishers", publishersRoutes);
app.use("/api/categories", categoriesRoutes);

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
    console.log(`LMS backend listening on http://localhost:${PORT}`);
});
``