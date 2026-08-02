import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/ui-bits";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
export const Route = createFileRoute("/my-submissions")({
    component: MySubs,
});
function MySubs() {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!loading && !isAuthenticated)
            navigate({ to: "/login", search: { redirect: "/my-submissions" }, replace: true });
    }, [isAuthenticated, loading, navigate]);
    const q = useQuery({
        queryKey: ["my-submissions"],
        queryFn: () => api("/challenges/my-submissions", { auth: true }),
        enabled: isAuthenticated,
    });
    return (<AppShell>
      <PageHeader title="My Submissions" subtitle="Every solution you've submitted."/>
      {q.isLoading && <LoadingState />}
      {q.error && (<ErrorState message={q.error instanceof ApiError ? q.error.message : "Failed to load"}/>)}
      {q.data && q.data.length === 0 && (<EmptyState title="No submissions yet." subtitle="Solve a challenge to see your submissions here."/>)}
      {q.data && q.data.length > 0 && (<Card className="overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 border-b border-border">
                <tr>
                  <Th>Submission</Th>
                  <Th>Challenge</Th>
                  <Th>Language</Th>
                  <Th>Status</Th>
                  <Th>Score</Th>
                  <Th>Submitted</Th>
                </tr>
              </thead>
              <tbody>
                {q.data.map((s) => (<tr key={s.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      #{String(s.id).slice(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <Link to="/challenges/$challengeId" params={{ challengeId: String(s.challenge_id) }} className="text-primary font-semibold hover:underline">
                        #{String(s.challenge_id).slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{s.language ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status ?? "pending"}/>
                    </td>
                    <td className="px-4 py-3 font-mono">{s.score ?? 0}</td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : "—"}
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </Card>)}
    </AppShell>);
}
function Th({ children }) {
    return (<th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
      {children}
    </th>);
}
