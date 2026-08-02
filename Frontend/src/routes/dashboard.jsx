import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge, Card, DifficultyBadge, LoadingState, SkillChips } from "@/components/ui-bits";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
export const Route = createFileRoute("/dashboard")({
    component: Dashboard,
});
function Dashboard() {
    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!loading && !isAuthenticated)
            navigate({ to: "/login", search: { redirect: "/dashboard" }, replace: true });
    }, [isAuthenticated, loading, navigate]);
    const challenges = useQuery({
        queryKey: ["challenges"],
        queryFn: () => api("/challenges/"),
        enabled: isAuthenticated,
    });
    const collabs = useQuery({
        queryKey: ["collaborations"],
        queryFn: () => api("/collaborations"),
        enabled: isAuthenticated,
    });
    const subs = useQuery({
        queryKey: ["my-submissions"],
        queryFn: () => api("/challenges/my-submissions", { auth: true }),
        enabled: isAuthenticated,
    });
    if (loading || !isAuthenticated)
        return <AppShell><LoadingState /></AppShell>;
    const totalSubs = subs.data?.length ?? 0;
    const totalPoints = subs.data?.reduce((s, x) => s + (x.score ?? 0), 0) ?? 0;
    return (<AppShell>
      <PageHeader title={`Welcome back, ${user?.first_name || user?.username || "friend"}.`} subtitle="Your personalized workspace for coding practice, submissions and team projects."/>



      <section className="mb-8 rounded-[1.75rem] border border-border bg-card p-5 md:p-6 shadow-card animate-slide-up overflow-hidden relative">
        <div className="absolute right-0 top-0 size-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">Recommended next step</p>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">Solve one challenge, then join one active team.</h2>
            <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">Keep the workflow simple: practice individually, submit your solution, and collaborate with peers to turn learning into a project.</p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link to="/challenges" className="rounded-full bg-gradient-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow">Start solving</Link>
            <Link to="/collaborations" className="rounded-full border border-border bg-background px-4 py-2.5 text-sm font-bold shadow-sm hover:bg-secondary">Find teams</Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14 animate-slide-up">
        <StatTile label="Submissions" value={String(totalSubs)}/>
        <StatTile label="Points" value={String(totalPoints)} tone="primary"/>
        <StatTile label="Challenges" value={String(challenges.data?.length ?? 0)}/>
        <StatTile label="Collaborations" value={String(collabs.data?.length ?? 0)} tone="amber"/>
      </section>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">Active Challenges</h2>
            <Link to="/challenges" className="text-xs font-bold text-primary hover:underline">
              Browse Library →
            </Link>
          </div>
          <div className="space-y-4">
            {challenges.isLoading && <LoadingState />}
            {challenges.data?.slice(0, 4).map((c) => (<Card key={c.id} className="group p-6 hover:border-primary/40 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="mb-2">
                      <DifficultyBadge difficulty={c.difficulty}/>
                    </div>
                    <h3 className="text-lg font-bold leading-tight">{c.title}</h3>
                  </div>
                </div>
                {c.description && (<p className="text-sm text-muted mb-6 line-clamp-2">{c.description}</p>)}
                <div className="flex justify-end">
                  <Link to="/challenges/$challengeId" params={{ challengeId: String(c.id) }} className="text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">
                    Open Editor →
                  </Link>
                </div>
              </Card>))}
            {challenges.data && challenges.data.length === 0 && (<p className="text-sm text-muted">No challenges available yet.</p>)}
          </div>
        </div>

        <div className="lg:col-span-5 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">Team Collabs</h2>
            <Link to="/collaborations/new" className="text-[10px] font-bold px-3 py-1 bg-card border border-border rounded-full hover:bg-secondary">
              Start Group
            </Link>
          </div>
          <div className="grid gap-4">
            {collabs.isLoading && <LoadingState />}
            {collabs.data?.slice(0, 3).map((c) => (<Card key={c.id} className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="size-12 rounded bg-primary/10 grid place-items-center shrink-0">
                    <span className="font-bold text-primary font-mono text-sm">
                      {c.title.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm">{c.title}</h4>
                    {c.description && (<p className="text-xs text-muted line-clamp-2">{c.description}</p>)}
                  </div>
                </div>
                {c.required_skills && (<div className="mb-4">
                    <SkillChips skills={c.required_skills}/>
                  </div>)}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted uppercase">
                    {c.max_members ? `Up to ${c.max_members} members` : "Open group"}
                  </span>
                  <Link to="/collaborations/$collaborationId" params={{ collaborationId: String(c.id) }} className="text-xs font-bold text-primary hover:underline">
                    View →
                  </Link>
                </div>
              </Card>))}
            {collabs.data && collabs.data.length === 0 && (<p className="text-sm text-muted">No collaborations yet.</p>)}
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted">
                Recent Submissions
              </h3>
              <Link to="/my-submissions" className="text-xs font-bold text-primary hover:underline">
                All →
              </Link>
            </div>
            <Card className="overflow-hidden">
              <table className="w-full text-left text-xs">
                <tbody>
                  {subs.data?.slice(0, 4).map((s) => (<tr key={s.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono text-muted">#{String(s.id).slice(0, 6)}</td>
                      <td className="px-4 py-3 font-bold">{s.language ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge tone={s.status === "approved" ? "green" : "amber"}>
                          {s.status ?? "pending"}
                        </Badge>
                      </td>
                    </tr>))}
                  {(!subs.data || subs.data.length === 0) && (<tr>
                      <td colSpan={3} className="p-6 text-center text-muted">
                        No submissions yet.
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>);
}
function StatTile({ label, value, tone = "default", }) {
    const toneCls = tone === "primary" ? "text-primary" : tone === "amber" ? "text-accent-amber" : "text-foreground";
    const accent = tone === "primary" ? "bg-gradient-primary" : tone === "amber" ? "bg-gradient-warm" : "bg-foreground/80";
    return (<div className="relative overflow-hidden bg-card border border-border p-5 rounded-xl shadow-card hover:shadow-elevated transition-shadow">
      <span className={`absolute top-0 left-0 h-0.5 w-10 ${accent}`}/>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted mb-2">{label}</p>
      <p className={`text-3xl md:text-4xl font-mono font-medium tracking-tight ${toneCls}`}>{value}</p>
    </div>);
}
