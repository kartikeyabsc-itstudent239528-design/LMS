import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Transaction } from "@/types";
import { BookOpen, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function MyBooksPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "history">("active");

  const load = () => {
    if (user) api.getUserTransactions(user.id).then(setTransactions).finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  const handleReturn = async (txnId: string) => {
    try {
      await api.returnBook(txnId);
      toast.success("Book returned successfully!");
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to return book");
    }
  };

  const active = transactions.filter((t) => t.status === "issued" || t.status === "overdue");
  const history = transactions.filter((t) => t.status === "returned");
  const display = tab === "active" ? active : history;

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="container py-8">
      <div className="fade-up">
        <h1 className="text-2xl font-bold" style={{ lineHeight: "1.1" }}>My Books</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track your borrowed books and history</p>
      </div>

      <div className="mt-6 flex gap-1 rounded-lg bg-muted p-1 w-fit fade-up fade-up-delay-1">
        <button onClick={() => setTab("active")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === "active" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
          Active ({active.length})
        </button>
        <button onClick={() => setTab("history")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === "history" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
          History ({history.length})
        </button>
      </div>

      {display.length === 0 ? (
        <div className="mt-16 text-center fade-up">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">{tab === "active" ? "No active borrowings" : "No return history yet"}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3 fade-up fade-up-delay-2">
          {display.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <BookOpen className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t.bookTitle}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Issued: {t.issueDate} · Due: {t.dueDate}
                    {t.returnDate && ` · Returned: ${t.returnDate}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  t.status === "returned" ? "bg-success/10 text-success" :
                  t.status === "overdue" ? "bg-destructive/10 text-destructive" :
                  "bg-accent/10 text-accent-foreground"
                }`}>{t.status}</span>
                {(t.status === "issued" || t.status === "overdue") && (
                  <button onClick={() => handleReturn(t.id)} className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted active:scale-95">
                    <RotateCcw className="mr-1 inline h-3 w-3" /> Return
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
