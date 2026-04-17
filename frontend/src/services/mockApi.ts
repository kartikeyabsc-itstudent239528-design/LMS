import { Book, Transaction, User } from "@/types";

const BOOKS_KEY = "lms_books";
const USERS_KEY = "lms_users";
const TRANSACTIONS_KEY = "lms_transactions";
const AUTH_KEY = "lms_auth";

// Seed data
const defaultBooks: Book[] = [
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
  { id: "b12", title: "Design Patterns", author: "Erich Gamma et al.", category: "Computer Science", isbn: "978-0201633610", quantity: 3, available: 1, coverImage: "", description: "Elements of reusable object-oriented software design patterns.", publishedYear: 1994 },
];

const defaultUsers: User[] = [
  { id: "u1", name: "Admin User", email: "admin@library.com", role: "admin", createdAt: "2024-01-15" },
  { id: "u3", name: "kartik", email: "kartik@example.com", role: "user", createdAt: "2024-05-22" },
  { id: "u4", name: "Ananya Patel", email: "ananya@example.com", role: "user", createdAt: "2024-06-08" },
];

const defaultTransactions: Transaction[] = [
  { id: "t1", userId: "u3", userName: "kartik", bookId: "b1", bookTitle: "The Great Gatsby", issueDate: "2026-03-01", dueDate: "2026-03-15", returnDate: null, status: "overdue" },
  { id: "t2", userId: "u3", userName: "kartik", bookId: "b7", bookTitle: "Clean Code", issueDate: "2026-03-10", dueDate: "2026-03-24", returnDate: null, status: "issued" },
  { id: "t3", userId: "u3", userName: "kartik", bookId: "b3", bookTitle: "1984", issueDate: "2026-02-01", dueDate: "2026-02-15", returnDate: "2026-02-14", status: "returned" },
  { id: "t4", userId: "u4", userName: "Ananya Patel", bookId: "b10", bookTitle: "Brave New World", issueDate: "2026-03-05", dueDate: "2026-03-19", returnDate: null, status: "overdue" },
  { id: "t5", userId: "u3", userName: "kartik", bookId: "b12", bookTitle: "Design Patterns", issueDate: "2026-03-15", dueDate: "2026-03-29", returnDate: null, status: "issued" },
];

const passwords: Record<string, string> = {
  "admin@library.com": "admin123",
  "kartik@example.com": "user123",
  "ananya@example.com": "user123",
};

function getItem<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

function setItem<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Simulate async delay
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// ==================== AUTH ====================

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  await delay(500);

  // required case: explicit credentials
  if (email === "kartik@example.com" && password === "user123") {
    const user: User = { id: "u3", name: "kartik", email: "kartik@example.com", role: "user", createdAt: "2024-05-22" };
    const token = btoa(JSON.stringify({ userId: user.id, role: user.role, exp: Date.now() + 86400000 }));
    setItem(AUTH_KEY, { user, token });
    return { user, token };
  }

  if (email === "admin@library.com" && password === "admin123") {
    const user: User = { id: "u1", name: "admin user", email: "admin@library.com", role: "admin", createdAt: "2024-01-15" };
    const token = btoa(JSON.stringify({ userId: user.id, role: user.role, exp: Date.now() + 86400000 }));
    setItem(AUTH_KEY, { user, token });
    return { user, token };
  }

  const users = getItem<User[]>(USERS_KEY, defaultUsers);
  const user = users.find((u) => u.email === email);
  const storedPasswords = getItem<Record<string, string>>("lms_passwords", passwords);
  const normalizedPasswords = { ...passwords, ...storedPasswords };

  setItem("lms_passwords", normalizedPasswords);

  if (!user || normalizedPasswords[email] !== password) {
    throw new Error("Invalid email or password");
  }

  const token = btoa(JSON.stringify({ userId: user.id, role: user.role, exp: Date.now() + 86400000 }));
  setItem(AUTH_KEY, { user, token });
  return { user, token };
}

export async function signup(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
  await delay(500);
  const users = getItem<User[]>(USERS_KEY, defaultUsers);
  if (users.find((u) => u.email === email)) throw new Error("Email already registered");
  const user: User = { id: `u${Date.now()}`, name, email, role: "user", createdAt: new Date().toISOString().split("T")[0] };
  users.push(user);
  setItem(USERS_KEY, users);
  const storedPasswords = getItem<Record<string, string>>("lms_passwords", passwords);
  storedPasswords[email] = password;
  setItem("lms_passwords", storedPasswords);
  const token = btoa(JSON.stringify({ userId: user.id, role: user.role, exp: Date.now() + 86400000 }));
  setItem(AUTH_KEY, { user, token });
  return { user, token };
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function getStoredAuth(): { user: User; token: string } | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

// ==================== BOOKS ====================

export async function getBooks(): Promise<Book[]> {
  await delay();
  return getItem<Book[]>(BOOKS_KEY, defaultBooks);
}

export async function getBook(id: string): Promise<Book | undefined> {
  await delay();
  const books = getItem<Book[]>(BOOKS_KEY, defaultBooks);
  return books.find((b) => b.id === id);
}

export async function addBook(book: Omit<Book, "id">): Promise<Book> {
  await delay();
  const books = getItem<Book[]>(BOOKS_KEY, defaultBooks);
  const newBook: Book = { ...book, id: `b${Date.now()}` };
  books.push(newBook);
  setItem(BOOKS_KEY, books);
  return newBook;
}

export async function updateBook(id: string, updates: Partial<Book>): Promise<Book> {
  await delay();
  const books = getItem<Book[]>(BOOKS_KEY, defaultBooks);
  const idx = books.findIndex((b) => b.id === id);
  if (idx === -1) throw new Error("Book not found");
  books[idx] = { ...books[idx], ...updates };
  setItem(BOOKS_KEY, books);
  return books[idx];
}

export async function deleteBook(id: string): Promise<void> {
  await delay();
  let books = getItem<Book[]>(BOOKS_KEY, defaultBooks);
  books = books.filter((b) => b.id !== id);
  setItem(BOOKS_KEY, books);
}

// ==================== USERS ====================

export async function getUsers(): Promise<User[]> {
  await delay();
  return getItem<User[]>(USERS_KEY, defaultUsers);
}

// ==================== TRANSACTIONS ====================

export async function getTransactions(): Promise<Transaction[]> {
  await delay();
  return getItem<Transaction[]>(TRANSACTIONS_KEY, defaultTransactions);
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  await delay();
  const txns = getItem<Transaction[]>(TRANSACTIONS_KEY, defaultTransactions);
  return txns.filter((t) => t.userId === userId);
}

export async function borrowBook(userId: string, userName: string, bookId: string): Promise<Transaction> {
  await delay();
  const books = getItem<Book[]>(BOOKS_KEY, defaultBooks);
  const book = books.find((b) => b.id === bookId);
  if (!book || book.available <= 0) throw new Error("Book not available");
  book.available--;
  setItem(BOOKS_KEY, books);

  const txns = getItem<Transaction[]>(TRANSACTIONS_KEY, defaultTransactions);
  const issueDate = new Date().toISOString().split("T")[0];
  const due = new Date();
  due.setDate(due.getDate() + 14);
  const txn: Transaction = {
    id: `t${Date.now()}`,
    userId, userName, bookId,
    bookTitle: book.title,
    issueDate,
    dueDate: due.toISOString().split("T")[0],
    returnDate: null,
    status: "issued",
  };
  txns.push(txn);
  setItem(TRANSACTIONS_KEY, txns);
  return txn;
}

export async function returnBook(transactionId: string): Promise<Transaction> {
  await delay();
  const txns = getItem<Transaction[]>(TRANSACTIONS_KEY, defaultTransactions);
  const txn = txns.find((t) => t.id === transactionId);
  if (!txn) throw new Error("Transaction not found");
  txn.returnDate = new Date().toISOString().split("T")[0];
  txn.status = "returned";
  setItem(TRANSACTIONS_KEY, txns);

  const books = getItem<Book[]>(BOOKS_KEY, defaultBooks);
  const book = books.find((b) => b.id === txn.bookId);
  if (book) {
    book.available++;
    setItem(BOOKS_KEY, books);
  }
  return txn;
}

export async function issueBookToUser(userId: string, bookId: string): Promise<Transaction> {
  await delay();
  const users = getItem<User[]>(USERS_KEY, defaultUsers);
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");
  return borrowBook(userId, user.name, bookId);
}
