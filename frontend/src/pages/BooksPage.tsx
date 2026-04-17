import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "@/services/api";
import { Book } from "@/types";
import { Search, Filter, BookOpen } from "lucide-react";

const CATEGORIES = ["All", "Fiction", "Dystopian", "Romance", "Non-Fiction", "Computer Science", "Philosophy"];
const PER_PAGE = 8;

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.getBooks().then(setBooks).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return books.filter((b) => {
      const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || (b.authorName ?? "").toLowerCase().includes(search.toLowerCase()) || b.isbn.includes(search);
      const matchCat = category === "All" || (b.categoryName ?? "").toLowerCase() === category.toLowerCase();
      return matchSearch && matchCat;
    });
  }, [books, search, category]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [search, category]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="container py-8">
      <div className="fade-up">
        <h1 className="text-2xl font-bold" style={{ lineHeight: "1.1" }}>Book Catalog</h1>
        <p className="mt-1 text-sm text-muted-foreground">Browse and discover books in the library</p>
      </div>

      {/* Search & filter */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center fade-up fade-up-delay-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-card pl-10 pr-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/20"
            placeholder="Search by title, author, or ISBN..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c} onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors active:scale-95 ${
                  category === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >{c}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {paginated.length === 0 ? (
        <div className="mt-16 text-center fade-up">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No books found matching your search</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {paginated.map((book, i) => (
              <Link
                to={`/books/${book.id}`} key={book.id}
                className={`fade-up fade-up-delay-${Math.min(i, 4)} group rounded-xl border bg-card p-4 transition-shadow hover:shadow-md active:scale-[0.98]`}
              >
                <div className="flex h-40 items-center justify-center rounded-lg bg-muted">
                  <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">{book.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{book.authorName ?? "Unknown author"}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{book.categoryName ?? "Uncategorized"}</span>
                    <span className={`text-xs font-medium ${book.available > 0 ? "text-success" : "text-destructive"}`}>
                      {book.available > 0 ? `${book.available} available` : "Unavailable"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40 active:scale-95">Previous</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`rounded-lg px-3 py-1.5 text-sm font-medium active:scale-95 ${page === i + 1 ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}>{i + 1}</button>
              ))}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40 active:scale-95">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
