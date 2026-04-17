import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "lms.db");
const db = new Database(dbPath);

const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT NOT NULL,
      isbn TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      available INTEGER NOT NULL,
      coverImage TEXT NOT NULL,
      description TEXT NOT NULL,
      publishedYear INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      bookId TEXT NOT NULL,
      bookTitle TEXT NOT NULL,
      userName TEXT NOT NULL,
      issueDate TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      returnDate TEXT,
      status TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(bookId) REFERENCES books(id)
    );
  `);
};

const seedData = () => {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
  if (userCount === 0) {
    const hashedAdmin = bcrypt.hashSync("admin123", 10);
    const hashedUser = bcrypt.hashSync("user123", 10);

    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, password, role, createdAt)
      VALUES (@id, @name, @email, @password, @role, @createdAt)
    `);

    insertUser.run({ id: "u1", name: "Admin User", email: "admin@library.com", password: hashedAdmin, role: "admin", createdAt: "2024-01-15" });
    insertUser.run({ id: "u3", name: "kartik", email: "kartik@example.com", password: hashedUser, role: "user", createdAt: "2024-05-22" });
    insertUser.run({ id: "u4", name: "Ananya Patel", email: "ananya@example.com", password: hashedUser, role: "user", createdAt: "2024-06-08" });
  }

  const bookCount = db.prepare("SELECT COUNT(*) as count FROM books").get().count;
  if (bookCount === 0) {
    const insertBook = db.prepare(`
      INSERT INTO books (id, title, author, category, isbn, quantity, available, coverImage, description, publishedYear)
      VALUES (@id, @title, @author, @category, @isbn, @quantity, @available, @coverImage, @description, @publishedYear)
    `);

    const defaultBooks = [
      { id: "b1", title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", isbn: "978-0743273565", quantity: 5, available: 3, coverImage: "", description: "A story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.", publishedYear: 1925 },
      { id: "b2", title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", isbn: "978-0061120084", quantity: 4, available: 4, coverImage: "", description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.", publishedYear: 1960 },
      { id: "b3", title: "1984", author: "George Orwell", category: "Dystopian", isbn: "978-0451524935", quantity: 6, available: 5, coverImage: "", description: "A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.", publishedYear: 1949 },
      { id: "b4", title: "Pride and Prejudice", author: "Jane Austen", category: "Romance", isbn: "978-0141439518", quantity: 3, available: 2, coverImage: "", description: "A romantic novel following the character development of Elizabeth Bennet.", publishedYear: 1813 },
      { id: "b5", title: "The Catcher in the Rye", author: "J.D. Salinger", category: "Fiction", isbn: "978-0316769488", quantity: 4, available: 4, coverImage: "", description: "The story of Holden Caulfield, a teenager navigating the challenges of growing up.", publishedYear: 1951 },
      { id: "b6", title: "Introduction to Algorithms", author: "Thomas H. Cormen", category: "Computer Science", isbn: "978-0262033848", quantity: 8, available: 6, coverImage: "", description: "A comprehensive textbook covering a broad range of algorithms in depth.", publishedYear: 2009 },
      { id: "b7", title: "Clean Code", author: "Robert C. Martin", category: "Computer Science", isbn: "978-0132350884", quantity: 5, available: 3, coverImage: "", description: "A handbook of agile software craftsmanship with practical advice.", publishedYear: 2008 },
      { id: "b8", title: "Sapiens", author: "Yuval Noah Harari", category: "Non-Fiction", isbn: "978-0062316097", quantity: 7, available: 7, coverImage: "", description: "A brief history of humankind, exploring how Homo sapiens came to dominate the world.", publishedYear: 2011 },
      { id: "b9", title: "The Art of War", author: "Sun Tzu", category: "Philosophy", isbn: "978-1599869773", quantity: 3, available: 3, coverImage: "", description: "An ancient Chinese military treatise dating from the 5th century BC.", publishedYear: -500 },
      { id: "b10", title: "Brave New World", author: "Aldous Huxley", category: "Dystopian", isbn: "978-0060850524", quantity: 4, available: 2, coverImage: "", description: "A dystopian novel set in a futuristic World State of genetically modified citizens.", publishedYear: 1932 },
      { id: "b11", title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", isbn: "978-0062315007", quantity: 6, available: 5, coverImage: "", description: "A mystical story about Santiago, an Andalusian shepherd boy who yearns to travel.", publishedYear: 1988 },
      { id: "b12", title: "Design Patterns", author: "Erich Gamma et al.", category: "Computer Science", isbn: "978-0201633610", quantity: 3, available: 1, coverImage: "", description: "Elements of reusable object-oriented software design patterns.", publishedYear: 1994 }
    ];

    const insert = db.transaction((books) => {
      for (const book of books) insertBook.run(book);
    });

    insert(defaultBooks);
  }

  const transactionCount = db.prepare("SELECT COUNT(*) as count FROM transactions").get().count;
  if (transactionCount === 0) {
    const insertTxn = db.prepare(`
      INSERT INTO transactions (id, userId, bookId, bookTitle, userName, issueDate, dueDate, returnDate, status)
      VALUES (@id, @userId, @bookId, @bookTitle, @userName, @issueDate, @dueDate, @returnDate, @status)
    `);

    insertTxn.run({ id: "t1", userId: "u3", bookId: "b1", bookTitle: "The Great Gatsby", userName: "kartik", issueDate: "2026-03-01", dueDate: "2026-03-15", returnDate: null, status: "overdue" });
    insertTxn.run({ id: "t2", userId: "u3", bookId: "b7", bookTitle: "Clean Code", userName: "kartik", issueDate: "2026-03-10", dueDate: "2026-03-24", returnDate: null, status: "issued" });
    insertTxn.run({ id: "t3", userId: "u3", bookId: "b3", bookTitle: "1984", userName: "kartik", issueDate: "2026-02-01", dueDate: "2026-02-15", returnDate: "2026-02-14", status: "returned" });
    insertTxn.run({ id: "t4", userId: "u4", bookId: "b10", bookTitle: "Brave New World", userName: "Ananya Patel", issueDate: "2026-03-05", dueDate: "2026-03-19", returnDate: null, status: "overdue" });
    insertTxn.run({ id: "t5", userId: "u3", bookId: "b12", bookTitle: "Design Patterns", userName: "kartik", issueDate: "2026-03-15", dueDate: "2026-03-29", returnDate: null, status: "issued" });
  }
};

createTables();
seedData();

export default db;
