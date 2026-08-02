import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button, Card, EmptyState, ErrorState, LoadingState, SkillChips } from "@/components/ui-bits";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
export const Route = createFileRoute("/collaborations/")({
    component: CollabList,
});
function CollabList() {
    const { isAuthenticated } = useAuth();
    const q = useQuery({
        queryKey: ["collaborations"],
        queryFn: () => api("/collaborations"),
    });
    return (<AppShell>
      <PageHeader title="Collaborations" subtitle="Find study groups and project teams to join." actions={isAuthenticated ? (<Link to="/collaborations/new">
              <Button>+ Create Collaboration</Button>
            </Link>) : null}/>
      {q.isLoading && <LoadingState />}
      {q.error && (<ErrorState message={q.error instanceof ApiError ? q.error.message : "Failed to load"}/>)}
      {q.data && q.data.length === 0 && (<EmptyState title="No collaborations have been created yet."/>)}
      <div className="grid md:grid-cols-2 gap-4 animate-slide-up">
        {q.data?.map((c) => (<Card key={c.id} className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="size-12 rounded bg-primary/10 grid place-items-center shrink-0">
                <span className="font-bold text-primary font-mono text-sm">
                  {c.title.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold">{c.title}</h4>
                {c.description && (<p className="text-sm text-muted line-clamp-2 mt-1">{c.description}</p>)}
              </div>
            </div>
            {c.required_skills && c.required_skills.length > 0 && (<div className="mb-4">
                <SkillChips skills={c.required_skills}/>
              </div>)}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                {c.max_members ? `Up to ${c.max_members} members` : "Open group"}
              </span>
              <Link to="/collaborations/$collaborationId" params={{ collaborationId: String(c.id) }} className="text-xs font-bold text-primary hover:underline">
                View Details →
              </Link>
            </div>
          </Card>))}
      </div>
    </AppShell>);
}
