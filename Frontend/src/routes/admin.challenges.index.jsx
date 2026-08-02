import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button, Card, ConfirmDialog, DifficultyBadge, EmptyState, ErrorState, LoadingState, Select, TextInput, Toast, } from "@/components/ui-bits";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/useToast";
export const Route = createFileRoute("/admin/challenges/")({
    component: AdminChallenges,
});
function AdminChallenges() {
    const { isAdmin, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!loading && !isAuthenticated)
            navigate({ to: "/login", replace: true });
        else if (!loading && !isAdmin)
            navigate({ to: "/challenges", replace: true });
    }, [isAdmin, isAuthenticated, loading, navigate]);
    const qc = useQueryClient();
    const { toast, show } = useToast();
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [toDelete, setToDelete] = useState(null);
    const q = useQuery({
        queryKey: ["challenges"],
        queryFn: () => api("/challenges/"),
        enabled: isAdmin,
    });
    const filtered = useMemo(() => {
        return (q.data ?? []).filter((c) => {
            const s = search.trim().toLowerCase();
            if (s && !c.title.toLowerCase().includes(s))
                return false;
            if (difficulty && (c.difficulty ?? "").toLowerCase() !== difficulty.toLowerCase())
                return false;
            return true;
        });
    }, [q.data, search, difficulty]);
    const del = useMutation({
        mutationFn: (id) => api(`/challenges/${id}`, { method: "DELETE", auth: true }),
        onSuccess: () => {
            show("Challenge deleted", "success");
            setToDelete(null);
            qc.invalidateQueries({ queryKey: ["challenges"] });
        },
        onError: (e) => show(e instanceof ApiError ? e.message : "Delete failed", "error"),
    });
    return (<AppShell>
      <PageHeader eyebrow="Admin" title="Challenge Management" subtitle="Create, edit and manage coding challenges." actions={<Link to="/admin/challenges/new">
            <Button>+ New Challenge</Button>
          </Link>}/>

      <Card className="p-4 mb-6 flex flex-col sm:flex-row gap-3 animate-slide-up">
        <TextInput placeholder="Search by title…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1"/>
        <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="sm:max-w-[200px]">
          <option value="">All difficulties</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </Select>
      </Card>

      {q.isLoading && <LoadingState />}
      {q.error && <ErrorState message={q.error instanceof ApiError ? q.error.message : "Failed to load"}/>}
      {q.data && filtered.length === 0 && <EmptyState title="No challenges match your filters."/>}

      {filtered.length > 0 && (<Card className="overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 border-b border-border">
                <tr>
                  <Th>Title</Th>
                  <Th>Difficulty</Th>
                  <Th>Created</Th>
                  <Th>Submissions</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (<tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{c.title}</p>
                      <p className="text-[10px] font-mono text-muted uppercase tracking-wider mt-0.5">
                        #{String(c.id).slice(0, 8)}
                      </p>
                    </td>
                    <td className="px-4 py-3"><DifficultyBadge difficulty={c.difficulty}/></td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {c.total_submissions ?? c.submission_count ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link to="/challenges/$challengeId" params={{ challengeId: String(c.id) }}>
                          <Button variant="ghost">View</Button>
                        </Link>
                        <Link to="/admin/challenges/$challengeId/edit" params={{ challengeId: String(c.id) }}>
                          <Button variant="secondary">Edit</Button>
                        </Link>
                        <Button variant="danger" onClick={() => setToDelete(c)}>Delete</Button>
                      </div>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </Card>)}

      <ConfirmDialog open={!!toDelete} title="Delete challenge?" message={`This will permanently delete "${toDelete?.title}".`} confirmLabel={del.isPending ? "Deleting…" : "Delete"} danger onCancel={() => setToDelete(null)} onConfirm={() => toDelete && del.mutate(toDelete.id)}/>
      {toast && <Toast message={toast.message} tone={toast.tone}/>}
    </AppShell>);
}
function Th({ children }) {
    return <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">{children}</th>;
}
