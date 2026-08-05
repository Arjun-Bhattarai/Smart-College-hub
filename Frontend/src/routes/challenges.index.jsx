import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button, Card, DifficultyBadge, EmptyState, ErrorState, LoadingState } from "@/components/ui-bits";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/challenges/")({
  component: ChallengeList,
});

function ChallengeList() {
  const { isAdmin } = useAuth();

  const q = useQuery({
    queryKey: ["challenges"],
    queryFn: () => api("/challenges/"),
  });

  return (
    <AppShell>
      <PageHeader
        title="Coding Challenges"
        subtitle="Sharpen your skills with problems across every difficulty."
        actions={
          isAdmin ? (
            <Link to="/admin/challenges/new">
              <Button>+ Create Challenge</Button>
            </Link>
          ) : null
        }
      />

      {q.isLoading && <LoadingState />}
      {q.error && (
        <ErrorState message={q.error instanceof ApiError ? q.error.message : "Failed to load challenges"} />
      )}
      {q.data && q.data.length === 0 && (
        <EmptyState title="No challenges available yet." subtitle="Check back soon." />
      )}

      <div className="grid gap-4 animate-slide-up">
        {q.data?.map((c) => (
          <Card key={c.id} className="group p-6 hover:border-primary/40 transition-all">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2">
                  <DifficultyBadge difficulty={c.difficulty} />
                </div>
                <h3 className="text-lg font-bold leading-tight">{c.title}</h3>
                {c.description && (
                  <p className="text-sm text-muted mt-2 line-clamp-2 max-w-2xl">{c.description}</p>
                )}
                {c.created_at && (
                  <p className="text-[10px] font-mono uppercase text-muted mt-3 tracking-wider">
                    Created {new Date(c.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Link to="/challenges/$challengeId" params={{ challengeId: String(c.id) }} className="shrink-0">
                <Button variant="secondary">View Details →</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}