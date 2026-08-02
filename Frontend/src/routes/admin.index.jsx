import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, LoadingState, StatusBadge } from "@/components/ui-bits";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
export const Route = createFileRoute("/admin/")({
    component: AdminDashboard,
});
function AdminDashboard() {
    const { isAdmin, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!loading && !isAuthenticated)
            navigate({ to: "/login", search: { redirect: "/admin" }, replace: true });
        else if (!loading && !isAdmin)
            navigate({ to: "/dashboard", replace: true });
    }, [isAdmin, isAuthenticated, loading, navigate]);
    const users = useQuery({ queryKey: ["admin-users"], queryFn: () => api("/auth/users", { auth: true }), enabled: isAdmin });
    const challenges = useQuery({ queryKey: ["challenges"], queryFn: () => api("/challenges/"), enabled: isAdmin });
    const collabs = useQuery({ queryKey: ["collaborations"], queryFn: () => api("/collaborations"), enabled: isAdmin });
    const subs = useQuery({ queryKey: ["admin-all-subs"], queryFn: () => api("/challenges/submissions", { auth: true }).catch(() => []), enabled: isAdmin });
    const joinRequests = useQuery({
        queryKey: ["admin-join-requests"],
        queryFn: () => api("/collaborations/requests/all", { auth: true }).catch(() => []),
        enabled: isAdmin,
    });
    if (loading || !isAdmin)
        return <AppShell><LoadingState /></AppShell>;
    const pendingReviews = (subs.data ?? []).filter((s) => (s.status ?? "pending").toLowerCase() === "pending").length;
    const pendingJoin = (joinRequests.data ?? []).filter((r) => (r.status ?? "pending").toLowerCase() === "pending").length;
    const recentSubs = [...(subs.data ?? [])]
        .sort((a, b) => new Date(b.submitted_at ?? 0).getTime() - new Date(a.submitted_at ?? 0).getTime())
        .slice(0, 6);
    return (<AppShell>
      <PageHeader eyebrow="Admin" title="Control Center" subtitle="Overview of your platform activity."/>

      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12 animate-slide-up">
        <StatTile label="Users" value={String(users.data?.length ?? "—")} to="/admin/users"/>
        <StatTile label="Challenges" value={String(challenges.data?.length ?? "—")} to="/admin/challenges"/>
        <StatTile label="Collaborations" value={String(collabs.data?.length ?? "—")} to="/admin/collaborations"/>
        <StatTile label="Submissions" value={String(subs.data?.length ?? "—")} to="/admin/submissions"/>
        <StatTile label="Pending Reviews" value={String(pendingReviews)} tone="amber" to="/admin/submissions"/>
        <StatTile label="Join Requests" value={String(pendingJoin)} tone="primary" to="/admin/collaborations"/>
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted">Recent Submissions</h3>
            <Link to="/admin/submissions" className="text-xs font-bold text-primary hover:underline">All →</Link>
          </div>
          {subs.isLoading && <LoadingState />}
          {!subs.isLoading && recentSubs.length === 0 && (<p className="text-sm text-muted">No submissions yet.</p>)}
          <ul className="divide-y divide-border">
            {recentSubs.map((s) => (<li key={String(s.id)} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">Submission #{String(s.id).slice(0, 8)}</p>
                  <p className="text-[10px] text-muted font-mono uppercase tracking-wider">
                    Challenge #{String(s.challenge_id ?? "").slice(0, 8)} · {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : "—"}
                  </p>
                </div>
                <StatusBadge status={s.status ?? "pending"}/>
              </li>))}
          </ul>
        </Card>

        <Card className="p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted">Score Distribution</h3>
          </div>
          <ScoreBars data={subs.data ?? []}/>
        </Card>
      </div>
    </AppShell>);
}
function StatTile({ label, value, tone, to }) {
    const toneCls = tone === "amber" ? "text-accent-amber" : tone === "primary" ? "text-primary" : "text-foreground";
    const content = (<Card interactive className="p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className={`text-3xl font-extrabold mt-2 ${toneCls}`}>{value}</p>
    </Card>);
    if (to)
        return <Link to={to}>{content}</Link>;
    return content;
}
function ScoreBars({ data }) {
    const buckets = [0, 0, 0, 0, 0];
    data.forEach((s) => {
        const sc = s.score ?? 0;
        const i = Math.min(4, Math.floor(sc / 20));
        buckets[i]++;
    });
    const max = Math.max(1, ...buckets);
    const labels = ["0-20", "21-40", "41-60", "61-80", "81-100"];
    return (<div className="space-y-3">
      {buckets.map((v, i) => (<div key={i} className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase text-muted w-12">{labels[i]}</span>
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-primary" style={{ width: `${(v / max) * 100}%` }}/>
          </div>
          <span className="text-xs font-bold w-8 text-right">{v}</span>
        </div>))}
    </div>);
}
