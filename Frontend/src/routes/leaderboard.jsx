import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, EmptyState, ErrorState, LoadingState } from "@/components/ui-bits";
import { api, ApiError } from "@/lib/api";
export const Route = createFileRoute("/leaderboard")({
    component: LeaderboardPage,
});
function LeaderboardPage() {
    const q = useQuery({
        queryKey: ["leaderboard"],
        queryFn: () => api("/challenges/leaderboard"),
    });
    return (<AppShell>
      <PageHeader title="Leaderboard" subtitle="Top performers across all coding challenges."/>
      {q.isLoading && <LoadingState />}
      {q.error && (<ErrorState message={q.error instanceof ApiError ? q.error.message : "Failed to load"}/>)}
      {q.data && q.data.length === 0 && (<EmptyState title="No leaderboard entries yet." subtitle="Be the first to submit!"/>)}
      {q.data && q.data.length > 0 && (<Card className="overflow-hidden animate-slide-up">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 border-b border-border">
              <tr>
                <Th>Rank</Th>
                <Th>User</Th>
                <Th>Score</Th>
                <Th>Submissions</Th>
              </tr>
            </thead>
            <tbody>
              {q.data.map((row, i) => (<tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-muted w-16">
                    {String(row.rank ?? i + 1).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {row.username ??
                    row.email ??
                    (row.user_id ? `#${String(row.user_id).slice(0, 8)}` : "—")}
                  </td>
                  <td className="px-4 py-3 font-mono">{row.score ?? row.points ?? 0}</td>
                  <td className="px-4 py-3 font-mono text-muted">
                    {row.submissions ?? row.total_submissions ?? "—"}
                  </td>
                </tr>))}
            </tbody>
          </table>
        </Card>)}
    </AppShell>);
}
function Th({ children }) {
    return (<th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
      {children}
    </th>);
}
