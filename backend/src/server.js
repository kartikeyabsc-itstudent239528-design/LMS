import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import booksRoutes from "./routes/books.js";
import usersRoutes from "./routes/users.js";
import transactionsRoutes from "./routes/transactions.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = ["http://localhost:8080", "http://localhost:8081"];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS policy: origin not allowed"));
        }
    },
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/transactions", transactionsRoutes);

app.get("/", (req, res) => {
    res.json({ status: "ok", message: "LMS backend is running. Use /api/health or /api/* endpoints." });
});

app.get("/admin", (req, res) => {
    res.json({
        error: "This is the backend server. Open the frontend at http://localhost:8081/admin after logging in.",
    });
});

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