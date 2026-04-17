import sqlite3 from "sqlite3";
import { promisify } from "util";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(
    import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "lms.db");
const db = await new Promise((resolve, reject) => {
    const database = new sqlite3.Database(dbPath, (err) => {
        if (err) reject(err);
        else resolve(database);
    });
});

// Promisify the methods
db.runAsync = (sql, ...params) => {
    return new Promise((resolve, reject) => {
        db.run(sql, ...params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));
db.execAsync = (sql) => {
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

const createTables = async() => {
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
    DROP TABLE IF EXISTS books;    CREATE TABLE IF NOT EXISTS authors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      bio TEXT,
      nationality TEXT,
      birthDate TEXT,
      deathDate TEXT
    );

    CREATE TABLE IF NOT EXISTS publishers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      email TEXT,
      website TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parentId TEXT,
      FOREIGN KEY(parentId) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      authorId TEXT,
      publisherId TEXT,
      categoryId TEXT,
      isbn TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      available INTEGER NOT NULL,
      coverImage TEXT,
      description TEXT,
      publishedYear INTEGER,
      FOREIGN KEY(authorId) REFERENCES authors(id),
      FOREIGN KEY(publisherId) REFERENCES publishers(id),
      FOREIGN KEY(categoryId) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS book_copies (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      copyNumber TEXT NOT NULL,
      condition TEXT NOT NULL,
      shelfLocation TEXT,
      status TEXT NOT NULL,
      FOREIGN KEY(bookId) REFERENCES books(id)
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      bookId TEXT NOT NULL,
      reservationDate TEXT NOT NULL,
      expiryDate TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(bookId) REFERENCES books(id)
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

    CREATE TABLE IF NOT EXISTS fines (
      id TEXT PRIMARY KEY,
      transactionId TEXT NOT NULL,
      amount REAL NOT NULL,
      reason TEXT NOT NULL,
      paidDate TEXT,
      status TEXT NOT NULL,
      FOREIGN KEY(transactionId) REFERENCES transactions(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      bookId TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      reviewDate TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(bookId) REFERENCES books(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      sentDate TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      action TEXT NOT NULL,
      tableName TEXT NOT NULL,
      recordId TEXT,
      timestamp TEXT NOT NULL,
      details TEXT
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact TEXT,
      address TEXT,
      terms TEXT
    );

    CREATE TABLE IF NOT EXISTS book_requests (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      author TEXT,
      reason TEXT,
      requestDate TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      eventDate TEXT NOT NULL,
      location TEXT,
      organizer TEXT
    );

    CREATE TABLE IF NOT EXISTS memberships (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      maxBooks INTEGER NOT NULL,
      maxDays INTEGER NOT NULL,
      fee REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS loans_archive (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      bookId TEXT NOT NULL,
      issueDate TEXT NOT NULL,
      returnDate TEXT NOT NULL,
      archivedDate TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL UNIQUE,
      favoriteGenres TEXT,
      notificationSettings TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `);
};

const seedData = async() => {
    const userCount = (await db.getAsync("SELECT COUNT(*) as count FROM users")).count;
    if (userCount === 0) {
        const hashedAdmin = bcrypt.hashSync("admin123", 10);
        const hashedUser = bcrypt.hashSync("user123", 10);

        await db.runAsync("INSERT INTO users (id, name, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)", "u1", "Admin User", "admin@library.com", hashedAdmin, "admin", "2024-01-15");
        await db.runAsync("INSERT INTO users (id, name, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)", "u3", "kartik", "kartik@example.com", hashedUser, "user", "2024-05-22");
        await db.runAsync("INSERT INTO users (id, name, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)", "u4", "Ananya Patel", "ananya@example.com", hashedUser, "user", "2024-06-08");
    }

    const authorCount = (await db.getAsync("SELECT COUNT(*) as count FROM authors")).count;
    if (authorCount === 0) {
        const authors = [
            { id: "a1", name: "F. Scott Fitzgerald", bio: "American novelist", nationality: "American", birthDate: "1896-09-24", deathDate: "1940-12-21" },
            { id: "a2", name: "Harper Lee", bio: "American novelist", nationality: "American", birthDate: "1926-04-28", deathDate: "2016-02-19" },
            { id: "a3", name: "George Orwell", bio: "English novelist", nationality: "British", birthDate: "1903-06-25", deathDate: "1950-01-21" },
            { id: "a4", name: "Jane Austen", bio: "English novelist", nationality: "British", birthDate: "1775-12-16", deathDate: "1817-07-18" },
            { id: "a5", name: "J.D. Salinger", bio: "American writer", nationality: "American", birthDate: "1919-01-01", deathDate: "2010-01-27" },
            { id: "a6", name: "Thomas H. Cormen", bio: "Computer scientist", nationality: "American" },
            { id: "a7", name: "Robert C. Martin", bio: "Software engineer", nationality: "American" },
            { id: "a8", name: "Yuval Noah Harari", bio: "Historian", nationality: "Israeli" },
            { id: "a9", name: "Sun Tzu", bio: "Chinese general", nationality: "Chinese", birthDate: "-544-01-01", deathDate: "-496-01-01" },
            { id: "a10", name: "Aldous Huxley", bio: "English writer", nationality: "British", birthDate: "1894-07-26", deathDate: "1963-11-22" },
            { id: "a11", name: "Paulo Coelho", bio: "Brazilian author", nationality: "Brazilian", birthDate: "1947-08-24" },
            { id: "a12", name: "Erich Gamma et al.", bio: "Authors of Design Patterns" }
        ];
        for (const author of authors) {
            await db.runAsync("INSERT INTO authors (id, name, bio, nationality, birthDate, deathDate) VALUES (?, ?, ?, ?, ?, ?)", author.id, author.name, author.bio, author.nationality, author.birthDate, author.deathDate);
        }
    }

    const publisherCount = (await db.getAsync("SELECT COUNT(*) as count FROM publishers")).count;
    if (publisherCount === 0) {
        const publishers = [
            { id: "p1", name: "Scribner", address: "New York", phone: "123-456-7890", email: "info@scribner.com", website: "scribner.com" },
            { id: "p2", name: "HarperCollins", address: "New York", phone: "123-456-7891", email: "info@harpercollins.com", website: "harpercollins.com" },
            { id: "p3", name: "Penguin Books", address: "London", phone: "123-456-7892", email: "info@penguin.com", website: "penguin.com" },
            { id: "p4", name: "MIT Press", address: "Cambridge", phone: "123-456-7893", email: "info@mitpress.com", website: "mitpress.com" },
            { id: "p5", name: "Prentice Hall", address: "New Jersey", phone: "123-456-7894", email: "info@prenticehall.com", website: "prenticehall.com" }
        ];
        for (const pub of publishers) {
            await db.runAsync("INSERT INTO publishers (id, name, address, phone, email, website) VALUES (?, ?, ?, ?, ?, ?)", pub.id, pub.name, pub.address, pub.phone, pub.email, pub.website);
        }
    }

    const categoryCount = (await db.getAsync("SELECT COUNT(*) as count FROM categories")).count;
    if (categoryCount === 0) {
        const categories = [
            { id: "c1", name: "Fiction" },
            { id: "c2", name: "Non-Fiction" },
            { id: "c3", name: "Computer Science" },
            { id: "c4", name: "Romance" },
            { id: "c5", name: "Dystopian" },
            { id: "c6", name: "Philosophy" }
        ];
        for (const cat of categories) {
            await db.runAsync("INSERT INTO categories (id, name) VALUES (?, ?)", cat.id, cat.name);
        }
    }

    const bookCount = (await db.getAsync("SELECT COUNT(*) as count FROM books")).count;
    if (bookCount === 0) {
        const defaultBooks = [
            { id: "b1", title: "The Great Gatsby", authorId: "a1", publisherId: "p1", categoryId: "c1", isbn: "978-0743273565", quantity: 5, available: 3, coverImage: "", description: "A story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.", publishedYear: 1925 },
            { id: "b2", title: "To Kill a Mockingbird", authorId: "a2", publisherId: "p2", categoryId: "c1", isbn: "978-0061120084", quantity: 4, available: 4, coverImage: "", description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.", publishedYear: 1960 },
            { id: "b3", title: "1984", authorId: "a3", publisherId: "p3", categoryId: "c5", isbn: "978-0451524935", quantity: 6, available: 5, coverImage: "", description: "A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.", publishedYear: 1949 },
            { id: "b4", title: "Pride and Prejudice", authorId: "a4", publisherId: "p3", categoryId: "c4", isbn: "978-0141439518", quantity: 3, available: 2, coverImage: "", description: "A romantic novel following the character development of Elizabeth Bennet.", publishedYear: 1813 },
            { id: "b5", title: "The Catcher in the Rye", authorId: "a5", publisherId: "p1", categoryId: "c1", isbn: "978-0316769488", quantity: 4, available: 4, coverImage: "", description: "The story of Holden Caulfield, a teenager navigating the challenges of growing up.", publishedYear: 1951 },
            { id: "b6", title: "Introduction to Algorithms", authorId: "a6", publisherId: "p4", categoryId: "c3", isbn: "978-0262033848", quantity: 8, available: 6, coverImage: "", description: "A comprehensive textbook covering a broad range of algorithms in depth.", publishedYear: 2009 },
            { id: "b7", title: "Clean Code", authorId: "a7", publisherId: "p5", categoryId: "c3", isbn: "978-0132350884", quantity: 5, available: 3, coverImage: "", description: "A handbook of agile software craftsmanship with practical advice.", publishedYear: 2008 },
            { id: "b8", title: "Sapiens", authorId: "a8", publisherId: "p2", categoryId: "c2", isbn: "978-0062316097", quantity: 7, available: 7, coverImage: "", description: "A brief history of humankind, exploring how Homo sapiens came to dominate the world.", publishedYear: 2011 },
            { id: "b9", title: "The Art of War", authorId: "a9", publisherId: "p3", categoryId: "c6", isbn: "978-1599869773", quantity: 3, available: 3, coverImage: "", description: "An ancient Chinese military treatise dating from the 5th century BC.", publishedYear: -500 },
            { id: "b10", title: "Brave New World", authorId: "a10", publisherId: "p2", categoryId: "c5", isbn: "978-0060850524", quantity: 4, available: 2, coverImage: "", description: "A dystopian novel set in a futuristic World State of genetically modified citizens.", publishedYear: 1932 },
            { id: "b11", title: "The Alchemist", authorId: "a11", publisherId: "p2", categoryId: "c1", isbn: "978-0062315007", quantity: 6, available: 5, coverImage: "", description: "A mystical story about Santiago, an Andalusian shepherd boy who yearns to travel.", publishedYear: 1988 },
            { id: "b12", title: "Design Patterns", authorId: "a12", publisherId: "p5", categoryId: "c3", isbn: "978-0201633610", quantity: 3, available: 1, coverImage: "", description: "Elements of reusable object-oriented software design patterns.", publishedYear: 1994 }
        ];

        for (const book of defaultBooks) {
            await db.runAsync("INSERT INTO books (id, title, authorId, publisherId, categoryId, isbn, quantity, available, coverImage, description, publishedYear) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", book.id, book.title, book.authorId, book.publisherId, book.categoryId, book.isbn, book.quantity, book.available, book.coverImage, book.description, book.publishedYear);
        }
    }

    const transactionCount = (await db.getAsync("SELECT COUNT(*) as count FROM transactions")).count;
    if (transactionCount === 0) {
        await db.runAsync("INSERT INTO transactions (id, userId, bookId, bookTitle, userName, issueDate, dueDate, returnDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", "t1", "u3", "b1", "The Great Gatsby", "kartik", "2026-03-01", "2026-03-15", null, "overdue");
        await db.runAsync("INSERT INTO transactions (id, userId, bookId, bookTitle, userName, issueDate, dueDate, returnDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", "t2", "u3", "b7", "Clean Code", "kartik", "2026-03-10", "2026-03-24", null, "issued");
        await db.runAsync("INSERT INTO transactions (id, userId, bookId, bookTitle, userName, issueDate, dueDate, returnDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", "t3", "u3", "b3", "1984", "kartik", "2026-02-01", "2026-02-15", "2026-02-14", "returned");
        await db.runAsync("INSERT INTO transactions (id, userId, bookId, bookTitle, userName, issueDate, dueDate, returnDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", "t4", "u4", "b10", "Brave New World", "Ananya Patel", "2026-03-05", "2026-03-19", null, "overdue");
        await db.runAsync("INSERT INTO transactions (id, userId, bookId, bookTitle, userName, issueDate, dueDate, returnDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", "t5", "u3", "b12", "Design Patterns", "kartik", "2026-03-15", "2026-03-29", null, "issued");
    }
};

(async() => {
    await createTables();
    await seedData();
})();

export default db;