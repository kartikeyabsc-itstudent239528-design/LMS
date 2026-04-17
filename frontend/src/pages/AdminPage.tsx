
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Author, Book, Category, Publisher, Transaction, User } from "@/types";
import { toast } from "sonner";
import { BookOpen, Plus, Pencil, Trash2, RotateCcw, Users, X, AlertCircle } from "lucide-react";

export default function AdminPage() {
  const [tab, setTab] = useState<"books" | "users" | "transactions" | "authors" | "publishers" | "categories">("books");
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showAuthorForm, setShowAuthorForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [showPublisherForm, setShowPublisherForm] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([api.getBooks(), api.getUsers(), api.getTransactions(), api.getAuthors(), api.getPublishers(), api.getCategories()])
      .then(([b, u, t, a, p, c]) => { 
        setBooks(b); 
        setUsers(u); 
        setTransactions(t); 
        setAuthors(a);
        setPublishers(p);
        setCategories(c);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDeleteBook = async (id: string) => {
    if (!confirm("Delete this book?")) return;
    try {
      await api.deleteBook(id);
      toast.success("Book deleted");
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete book");
    }
  };

  const handleReturn = async (txnId: string) => {
    try {
      await api.returnBook(txnId);
      toast.success("Book return accepted");
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to return book");
    }
  };

  const handleDeleteAuthor = async (id: string) => {
    if (!confirm("Delete this author?")) return;
    try {
      await api.deleteAuthor(id);
      toast.success("Author deleted");
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete author");
    }
  };

  const handleDeletePublisher = async (id: string) => {
    if (!confirm("Delete this publisher?")) return;
    try {
      await api.deletePublisher(id);
      toast.success("Publisher deleted");
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete publisher");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.deleteCategory(id);
      toast.success("Category deleted");
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const tabs = [
    { key: "books" as const, label: "Books", count: books.length },
    { key: "users" as const, label: "Users", count: users.length },
    { key: "transactions" as const, label: "Transactions", count: transactions.length },
    { key: "authors" as const, label: "Authors", count: authors.length },
    { key: "publishers" as const, label: "Publishers", count: publishers.length },
    { key: "categories" as const, label: "Categories", count: categories.length },
  ];

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between fade-up">
        <div>
          <h1 className="text-2xl font-bold" style={{ lineHeight: "1.1" }}>Admin Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage books, users, transactions, and library entities</p>
        </div>
        <div className="flex gap-2">
          {tab === "books" && (
            <button onClick={() => { setEditingBook(null); setShowBookForm(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-[0.98]">
              <Plus className="h-4 w-4" /> Add Book
            </button>
          )}
          {tab === "transactions" && (
            <button onClick={() => setShowIssueForm(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-[0.98]">
              <Plus className="h-4 w-4" /> Issue Book
            </button>
          )}
          {tab === "authors" && (
            <button onClick={() => { setEditingAuthor(null); setShowAuthorForm(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-[0.98]">
              <Plus className="h-4 w-4" /> Add Author
            </button>
          )}
          {tab === "publishers" && (
            <button onClick={() => { setEditingPublisher(null); setShowPublisherForm(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-[0.98]">
              <Plus className="h-4 w-4" /> Add Publisher
            </button>
          )}
          {tab === "categories" && (
            <button onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-[0.98]">
              <Plus className="h-4 w-4" /> Add Category
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-1 rounded-lg bg-muted p-1 w-fit fade-up fade-up-delay-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      <div className="mt-6 fade-up fade-up-delay-2">
        {tab === "books" && (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Author</th>
                  <th className="px-4 py-3 font-medium">Publisher</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">ISBN</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Avail</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{b.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.authorName ?? "Unknown"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.publisherName ?? "—"}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{b.categoryName ?? "Unknown"}</span></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{b.isbn}</td>
                    <td className="px-4 py-3 tabular-nums">{b.quantity}</td>
                    <td className={`px-4 py-3 tabular-nums font-medium ${b.available > 0 ? "text-success" : "text-destructive"}`}>{b.available}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingBook(b); setShowBookForm(true); }} className="rounded p-1.5 hover:bg-muted active:scale-95"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDeleteBook(b.id)} className="rounded p-1.5 text-destructive hover:bg-destructive/10 active:scale-95"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "users" && (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{u.name.split(" ").map(n => n[0]).join("")}</div>
                      {u.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{u.role}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{u.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "transactions" && (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Book</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Issued</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{t.bookTitle}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.userName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.issueDate}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.dueDate}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.status === "returned" ? "bg-success/10 text-success" :
                        t.status === "overdue" ? "bg-destructive/10 text-destructive" :
                        "bg-accent/10 text-accent-foreground"
                      }`}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {(t.status === "issued" || t.status === "overdue") && (
                        <button onClick={() => handleReturn(t.id)} className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium hover:bg-muted active:scale-95">
                          <RotateCcw className="h-3 w-3" /> Accept Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "authors" && (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Bio</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {authors.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.bio ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingAuthor(item); setShowAuthorForm(true); }} className="rounded p-1.5 hover:bg-muted active:scale-95"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDeleteAuthor(item.id)} className="rounded p-1.5 text-destructive hover:bg-destructive/10 active:scale-95"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "publishers" && (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Country</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {publishers.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.address ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingPublisher(item); setShowPublisherForm(true); }} className="rounded p-1.5 hover:bg-muted active:scale-95"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDeletePublisher(item.id)} className="rounded p-1.5 text-destructive hover:bg-destructive/10 active:scale-95"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "categories" && (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Parent</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.parentId ? "Subcategory" : "Root"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingCategory(item); setShowCategoryForm(true); }} className="rounded p-1.5 hover:bg-muted active:scale-95"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDeleteCategory(item.id)} className="rounded p-1.5 text-destructive hover:bg-destructive/10 active:scale-95"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Book Form Modal */}
      {showBookForm && <BookFormModal book={editingBook} authors={authors} publishers={publishers} categories={categories} onClose={() => setShowBookForm(false)} onSave={load} />}
      {showIssueForm && <IssueFormModal users={users.filter(u => u.role === "user")} books={books.filter(b => b.available > 0)} onClose={() => setShowIssueForm(false)} onSave={load} />}
      {showAuthorForm && <EntityFormModal entityType="author" item={editingAuthor} onClose={() => setShowAuthorForm(false)} onSave={load} />}
      {showPublisherForm && <EntityFormModal entityType="publisher" item={editingPublisher} onClose={() => setShowPublisherForm(false)} onSave={load} />}
      {showCategoryForm && <EntityFormModal entityType="category" item={editingCategory} onClose={() => setShowCategoryForm(false)} onSave={load} />}
    </div>
  );
}

function BookFormModal({ book, authors, publishers, categories, onClose, onSave }: { book: Book | null; authors: Author[]; publishers: Publisher[]; categories: Category[]; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    title: book?.title ?? "",
    authorId: book?.authorId ?? "",
    publisherId: book?.publisherId ?? "",
    categoryId: book?.categoryId ?? "",
    isbn: book?.isbn ?? "",
    quantity: book?.quantity ?? 1,
    available: book?.available ?? 1,
    description: book?.description ?? "",
    publishedYear: book?.publishedYear ?? 2024,
  });
  const [errors, setErrors] = useState<{
    title?: string;
    authorId?: string;
    categoryId?: string;
    isbn?: string;
    quantity?: string;
    available?: string;
  }>({});
  const [saving, setSaving] = useState(false);

  // Validation functions
  const validateTitle = (title: string): string | undefined => {
    if (!title.trim()) return "Title is required";
    if (title.trim().length < 2) return "Title must be at least 2 characters";
    if (/\d/.test(title)) return "Title should not contain numbers";
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(title)) return "Title should not contain special characters";
    return undefined;
  };

  const validateAuthor = (author: string): string | undefined => {
    if (!author.trim()) return "Author name is required";
    if (author.trim().length < 2) return "Author name must be at least 2 characters";
    if (/\d/.test(author)) return "Author name should not contain numbers";
    if (!/^[a-zA-Z\s'-]+$/.test(author)) return "Author name can only contain letters, spaces, hyphens, and apostrophes";
    return undefined;
  };

  const validateCategory = (category: string): string | undefined => {
    if (!category.trim()) return "Category is required";
    if (category.trim().length < 2) return "Category must be at least 2 characters";
    if (/\d/.test(category)) return "Category should not contain numbers";
    return undefined;
  };

  const validateISBN = (isbn: string): string | undefined => {
    if (!isbn.trim()) return "ISBN is required";
    const isbnRegex = /^(?:\d{10}|\d{13})$/;
    if (!isbnRegex.test(isbn.replace(/[-\s]/g, ''))) return "ISBN must be 10 or 13 digits";
    return undefined;
  };

  const validateQuantity = (quantity: number): string | undefined => {
    if (quantity < 1) return "Quantity must be at least 1";
    if (quantity > 1000) return "Quantity cannot exceed 1000";
    return undefined;
  };

  const validateAvailable = (available: number, quantity: number): string | undefined => {
    if (available < 0) return "Available copies cannot be negative";
    if (available > quantity) return "Available copies cannot exceed total quantity";
    return undefined;
  };

  const handleInputChange = (field: string, value: any) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setForm({ ...form, [field]: value });
  };

  const validateForm = (): boolean => {
    const newErrors = {
      title: validateTitle(form.title),
      authorId: form.authorId ? undefined : "Author is required",
      categoryId: form.categoryId ? undefined : "Category is required",
      isbn: validateISBN(form.isbn),
      quantity: validateQuantity(form.quantity),
      available: validateAvailable(form.available, form.quantity),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setSaving(true);
    try {
      if (book) {
        await api.updateBook(book.id, form);
        toast.success("Book updated successfully!");
      } else {
        await api.createBook(form);
        toast.success("Book added successfully!");
      }
      onSave();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save book");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg" style={{ animation: "slideDown 0.2s ease-out" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">{book ? "Edit Book" : "Add New Book"}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted active:scale-95"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Title Field */}
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium">Title <span className="text-red-500">*</span></label>
              <input 
                required 
                value={form.title} 
                onChange={e => handleInputChange("title", e.target.value)} 
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 ${errors.title ? "border-red-500 focus:ring-red-500/20" : ""}`}
                placeholder="Enter book title (no numbers or special characters)"
              />
              {errors.title && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.title}</span>
                </div>
              )}
            </div>

            {/* Author Field */}
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium">Author <span className="text-red-500">*</span></label>
              <select
                required
                value={form.authorId}
                onChange={e => handleInputChange("authorId", e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 ${errors.authorId ? "border-red-500 focus:ring-red-500/20" : ""}`}
              >
                <option value="">Select author...</option>
                {authors.map(author => <option key={author.id} value={author.id}>{author.name}</option>)}
              </select>
              {errors.authorId && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.authorId}</span>
                </div>
              )}
            </div>

            {/* Publisher Field */}
            <div>
              <label className="mb-1 block text-xs font-medium">Publisher</label>
              <select
                value={form.publisherId}
                onChange={e => handleInputChange("publisherId", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              >
                <option value="">Select publisher (optional)...</option>
                {publishers.map(publisher => <option key={publisher.id} value={publisher.id}>{publisher.name}</option>)}
              </select>
            </div>

            {/* Category Field */}
            <div>
              <label className="mb-1 block text-xs font-medium">Category <span className="text-red-500">*</span></label>
              <select
                required
                value={form.categoryId}
                onChange={e => handleInputChange("categoryId", e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 ${errors.categoryId ? "border-red-500 focus:ring-red-500/20" : ""}`}
              >
                <option value="">Select category...</option>
                {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              {errors.categoryId && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.categoryId}</span>
                </div>
              )}
            </div>

            {/* ISBN Field */}
            <div>
              <label className="mb-1 block text-xs font-medium">ISBN <span className="text-red-500">*</span></label>
              <input 
                required 
                value={form.isbn} 
                onChange={e => handleInputChange("isbn", e.target.value)} 
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 ${errors.isbn ? "border-red-500 focus:ring-red-500/20" : ""}`}
                placeholder="10 or 13 digits"
              />
              {errors.isbn && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.isbn}</span>
                </div>
              )}
            </div>

            {/* Quantity Field */}
            <div>
              <label className="mb-1 block text-xs font-medium">Quantity <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                min={1} 
                required 
                value={form.quantity} 
                onChange={e => handleInputChange("quantity", +e.target.value)} 
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 ${errors.quantity ? "border-red-500 focus:ring-red-500/20" : ""}`}
              />
              {errors.quantity && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.quantity}</span>
                </div>
              )}
            </div>

            {/* Available Field */}
            <div>
              <label className="mb-1 block text-xs font-medium">Available <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                min={0} 
                required 
                value={form.available} 
                onChange={e => handleInputChange("available", +e.target.value)} 
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 ${errors.available ? "border-red-500 focus:ring-red-500/20" : ""}`}
              />
              {errors.available && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.available}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="mb-1 block text-xs font-medium">Description</label>
            <textarea 
              rows={3} 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })} 
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Optional: Add a brief description of the book"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted active:scale-95">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-[0.98] disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EntityFormModal({ entityType, item, onClose, onSave }: {
  entityType: "author" | "publisher" | "category";
  item: Author | Publisher | Category | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: item?.name ?? "",
    bio: entityType === "author" ? (item as Author | null)?.bio ?? "" : "",
    address: entityType === "publisher" ? (item as Publisher | null)?.address ?? "" : "",
  });
  const [saving, setSaving] = useState(false);

  const title = item ? `Edit ${entityType}` : `Add New ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`;
  const label = entityType === "author" ? "Bio" : entityType === "publisher" ? "Address" : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      if (item) {
        if (entityType === "author") await api.updateAuthor(item.id, { name: form.name, bio: form.bio });
        if (entityType === "publisher") await api.updatePublisher(item.id, { name: form.name, address: form.address });
        if (entityType === "category") await api.updateCategory(item.id, { name: form.name });
        toast.success(`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} updated successfully!`);
      } else {
        if (entityType === "author") await api.createAuthor({ name: form.name, bio: form.bio });
        if (entityType === "publisher") await api.createPublisher({ name: form.name, address: form.address });
        if (entityType === "category") await api.createCategory({ name: form.name });
        toast.success(`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} added successfully!`);
      }
      onSave();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `Failed to save ${entityType}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg" style={{ animation: "slideDown 0.2s ease-out" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted active:scale-95"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium">Name <span className="text-red-500">*</span></label>
            <input
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              placeholder={`Enter ${entityType} name`}
            />
          </div>
          {entityType !== "category" && (
            <div>
              <label className="mb-1 block text-xs font-medium">{label}</label>
              <input
                value={entityType === "author" ? form.bio : form.address}
                onChange={e => setForm({
                  ...form,
                  bio: entityType === "author" ? e.target.value : form.bio,
                  address: entityType === "publisher" ? e.target.value : form.address,
                })}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={`Optional ${label.toLowerCase()}`}
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted active:scale-95">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-[0.98] disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function IssueFormModal({ users, books, onClose, onSave }: { users: User[]; books: Book[]; onClose: () => void; onSave: () => void }) {
  const [userId, setUserId] = useState("");
  const [bookId, setBookId] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !bookId) {
      toast.error("Please select both user and book");
      return;
    }
    setSaving(true);
    try {
      await api.issueBook({ userId, bookId });
      toast.success("Book issued successfully!");
      onSave();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to issue book");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg" style={{ animation: "slideDown 0.2s ease-out" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Issue Book to User</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted active:scale-95"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium">Select User <span className="text-red-500">*</span></label>
            <select 
              required 
              value={userId} 
              onChange={e => setUserId(e.target.value)} 
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-background"
            >
              <option value="">Choose a user...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Select Book <span className="text-red-500">*</span></label>
            <select 
              required 
              value={bookId} 
              onChange={e => setBookId(e.target.value)} 
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-background"
            >
              <option value="">Choose a book...</option>
              {books.map(b => <option key={b.id} value={b.id}>{b.title} ({b.available} available)</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted active:scale-95">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-[0.98] disabled:opacity-50">
              {saving ? "Issuing..." : "Issue Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}