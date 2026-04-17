import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Book } from "@/types";
import { ArrowLeft, BookOpen, Calendar, Hash, Layers } from "lucide-react";
import { toast } from "sonner";

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    if (id) api.getBook(id).then((b) => setBook(b ?? null)).finally(() => setLoading(false));
  }, [id]);

  const handleBorrow = async () => {
    if (!book || !user) return;
    setBorrowing(true);
    try {
      await api.borrowBook({ userId: user.id, bookId: book.id });
      toast.success(`"${book.title}" has been borrowed!`);
      const updated = await api.getBook(book.id);
      if (updated) setBook(updated);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to borrow book");
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!book) return <div className="container py-16 text-center"><p className="text-muted-foreground">Book not found</p></div>;

  return (
    <div className="container max-w-3xl py-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="fade-up rounded-xl border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="flex h-56 w-full shrink-0 items-center justify-center rounded-lg bg-muted sm:w-44">
            <BookOpen className="h-12 w-12 text-muted-foreground/40" />
          </div>
          <div className="flex-1">
            <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{book.categoryName ?? "Uncategorized"}</span>
            <h1 className="mt-2 text-2xl font-bold" style={{ lineHeight: "1.15" }}>{book.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">by {book.authorName ?? "Unknown author"}</p>
            {book.publisherName && <p className="text-sm text-muted-foreground">Published by {book.publisherName}</p>}

            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Hash className="h-3.5 w-3.5" /> ISBN: {book.isbn}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> Published: {book.publishedYear > 0 ? book.publishedYear : `${Math.abs(book.publishedYear)} BC`}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Layers className="h-3.5 w-3.5" /> Total: {book.quantity} copies</div>
              <div className={`flex items-center gap-2 font-medium ${book.available > 0 ? "text-success" : "text-destructive"}`}>
                <BookOpen className="h-3.5 w-3.5" /> {book.available} available
              </div>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{book.description}</p>

            {user?.role === "user" && (
              <button
                onClick={handleBorrow} disabled={borrowing || book.available <= 0}
                className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                {borrowing ? "Borrowing..." : book.available > 0 ? "Borrow this book" : "Currently unavailable"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
