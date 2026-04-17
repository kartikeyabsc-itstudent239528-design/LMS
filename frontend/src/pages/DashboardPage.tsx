import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Book, Transaction } from "@/types";
import { BookOpen, BookCheck, AlertTriangle, Users, TrendingUp, Clock } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getBooks(), user?.role === "admin" ? api.getTransactions() : api.getUserTransactions(user!.id)])
      .then(([b, t]) => { setBooks(b); setTransactions(t); })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  const totalBooks = books.reduce((s, b) => s + b.quantity, 0);
  const totalAvailable = books.reduce((s, b) => s + b.available, 0);
  const issued = transactions.filter((t) => t.status === "issued").length;
  const overdue = transactions.filter((t) => t.status === "overdue").length;
  const returned = transactions.filter((t) => t.status === "returned").length;

  const stats = user?.role === "admin"
    ? [
        { label: "Total Books", value: totalBooks, icon: BookOpen, color: "bg-primary/10 text-primary" },
        { label: "Available", value: totalAvailable, icon: BookCheck, color: "bg-success/10 text-success" },
        { label: "Currently Issued", value: issued, icon: TrendingUp, color: "bg-accent/10 text-accent-foreground" },
        { label: "Overdue", value: overdue, icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
        { label: "Returned", value: returned, icon: Clock, color: "bg-muted text-muted-foreground" },
        { label: "Book Titles", value: books.length, icon: Users, color: "bg-primary/10 text-primary" },
      ]
    : [
        { label: "Books Borrowed", value: issued, icon: BookOpen, color: "bg-primary/10 text-primary" },
        { label: "Returned", value: returned, icon: BookCheck, color: "bg-success/10 text-success" },
        { label: "Overdue", value: overdue, icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
      ];

  const recentTxns = [...transactions].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).slice(0, 5);

  return (
    <div className="container py-8">
      <div className="fade-up">
        <h1 className="text-2xl font-bold" style={{ lineHeight: "1.1" }}>
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user?.role === "admin" ? "Here's an overview of your library" : "Here's your reading activity"}
        </p>
      </div>

      <div className={`mt-8 grid gap-4 ${user?.role === "admin" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6" : "grid-cols-1 sm:grid-cols-3"}`}>
        {stats.map((s, i) => (
          <div key={s.label} className={`fade-up fade-up-delay-${Math.min(i, 4)} rounded-xl border bg-card p-4`}>
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
              <s.icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="mt-10 fade-up fade-up-delay-2">
        <h2 className="mb-4 text-lg font-semibold">Recent Transactions</h2>
        {recentTxns.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Book</th>
                  {user?.role === "admin" && <th className="px-4 py-3 font-medium">User</th>}
                  <th className="px-4 py-3 font-medium">Issued</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTxns.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{t.bookTitle}</td>
                    {user?.role === "admin" && <td className="px-4 py-3 text-muted-foreground">{t.userName}</td>}
                    <td className="px-4 py-3 text-muted-foreground">{t.issueDate}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.dueDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.status === "returned" ? "bg-success/10 text-success" :
                        t.status === "overdue" ? "bg-destructive/10 text-destructive" :
                        "bg-accent/10 text-accent-foreground"
                      }`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
