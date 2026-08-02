import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, SkillChips, Toast, } from "@/components/ui-bits";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/useToast";
export const Route = createFileRoute("/admin/collaborations/")({
    component: AdminCollaborations,
});
function AdminCollaborations() {
    const { isAdmin, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!loading && !isAuthenticated)
            navigate({ to: "/login", replace: true });
        else if (!loading && !isAdmin)
            navigate({ to: "/challenges", replace: true });
    }, [isAdmin, isAuthenticated, loading, navigate]);
    const [selected, setSelected] = useState(null);
    const q = useQuery({
        queryKey: ["collaborations"],
        queryFn: () => api("/collaborations"),
        enabled: isAdmin,
    });
    return (<AppShell>
      <PageHeader eyebrow="Admin" title="Collaboration Management" subtitle="Review every group, member and join request."/>

      {q.isLoading && <LoadingState />}
      {q.error && <ErrorState message={q.error instanceof ApiError ? q.error.message : "Failed to load"}/>}
      {q.data && q.data.length === 0 && <EmptyState title="No collaborations."/>}

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
                {c.description && <p className="text-sm text-muted line-clamp-2 mt-1">{c.description}</p>}
              </div>
            </div>
            {c.required_skills && c.required_skills.length > 0 && (<div className="mb-4"><SkillChips skills={c.required_skills}/></div>)}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                {c.max_members ? `Up to ${c.max_members}` : "Open group"}
              </span>
              <Button variant="secondary" onClick={() => setSelected(c)}>Manage →</Button>
            </div>
          </Card>))}
      </div>

      {selected && <CollabDrawer collab={selected} onClose={() => setSelected(null)}/>}
    </AppShell>);
}
function CollabDrawer({ collab, onClose }) {
    const qc = useQueryClient();
    const { toast, show } = useToast();
    const membersQ = useQuery({
        queryKey: ["collab-members", collab.id],
        queryFn: () => api(`/collaborations/${collab.id}/members`, { auth: true }),
    });
    const requestsQ = useQuery({
        queryKey: ["collab-requests", collab.id],
        queryFn: () => api(`/collaborations/${collab.id}/requests`, { auth: true }),
    });
    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ["collab-members", collab.id] });
        qc.invalidateQueries({ queryKey: ["collab-requests", collab.id] });
    };
    const approve = useMutation({
        mutationFn: (reqId) => api(`/collaborations/${collab.id}/requests/${reqId}/approve`, { method: "POST", auth: true }),
        onSuccess: () => { show("Request approved", "success"); invalidate(); },
        onError: (e) => show(e instanceof ApiError ? e.message : "Failed", "error"),
    });
    const reject = useMutation({
        mutationFn: (reqId) => api(`/collaborations/${collab.id}/requests/${reqId}/reject`, { method: "POST", auth: true }),
        onSuccess: () => { show("Request rejected", "success"); invalidate(); },
        onError: (e) => show(e instanceof ApiError ? e.message : "Failed", "error"),
    });
    const removeMember = useMutation({
        mutationFn: (memberId) => api(`/collaborations/${collab.id}/members/${memberId}`, { method: "DELETE", auth: true }),
        onSuccess: () => { show("Member removed", "success"); invalidate(); },
        onError: (e) => show(e instanceof ApiError ? e.message : "Failed", "error"),
    });
    const pendingRequests = (requestsQ.data ?? []).filter((r) => (r.status ?? "pending").toLowerCase() === "pending");
    return (<div className="fixed inset-0 z-50 flex justify-end bg-foreground/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-2xl h-full bg-card border-l border-border overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Collaboration</p>
            <h2 className="text-lg font-bold">{collab.title}</h2>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="p-6 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted">Join Requests</h3>
              {pendingRequests.length > 0 && <Badge tone="amber">{pendingRequests.length} pending</Badge>}
            </div>
            {requestsQ.isLoading && <LoadingState />}
            {!requestsQ.isLoading && pendingRequests.length === 0 && (<p className="text-sm text-muted">No pending requests.</p>)}
            <ul className="space-y-2">
              {pendingRequests.map((r) => (<li key={r.id} className="p-4 border border-border rounded-lg flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">{r.username ?? r.email ?? `User #${String(r.user_id).slice(0, 8)}`}</p>
                    {r.message && <p className="text-xs text-muted mt-1">{r.message}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="primary" onClick={() => approve.mutate(r.id)} disabled={approve.isPending}>Approve</Button>
                    <Button variant="danger" onClick={() => reject.mutate(r.id)} disabled={reject.isPending}>Reject</Button>
                  </div>
                </li>))}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-3">Members</h3>
            {membersQ.isLoading && <LoadingState />}
            {!membersQ.isLoading && (membersQ.data ?? []).length === 0 && (<p className="text-sm text-muted">No members yet.</p>)}
            <ul className="divide-y divide-border">
              {membersQ.data?.map((m) => {
            const id = String(m.id ?? m.user_id ?? "");
            return (<li key={id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{m.username ?? m.email ?? `User #${id.slice(0, 8)}`}</p>
                      {m.role && <p className="text-[10px] text-muted font-mono uppercase tracking-wider">{m.role}</p>}
                    </div>
                    <Button variant="danger" onClick={() => removeMember.mutate(id)} disabled={removeMember.isPending}>
                      Remove
                    </Button>
                  </li>);
        })}
            </ul>
          </section>
        </div>
        {toast && <Toast message={toast.message} tone={toast.tone}/>}
      </div>
    </div>);
}
