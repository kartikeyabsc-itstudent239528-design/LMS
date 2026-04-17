export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
  nationality?: string;
  birthDate?: string;
  deathDate?: string;
}

export interface Publisher {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
}

export interface Book {
  id: string;
  title: string;
  authorId?: string;
  authorName?: string;
  publisherId?: string;
  publisherName?: string;
  categoryId?: string;
  categoryName?: string;
  isbn: string;
  quantity: number;
  available: number;
  coverImage: string;
  description: string;
  publishedYear: number;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  bookId: string;
  bookTitle: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: "issued" | "returned" | "overdue";
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
