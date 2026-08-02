import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, EmptyState, ErrorState, LoadingState, StatusBadge, Toast, } from "@/components/ui-bits";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/lib/useToast";
export const Route = createFileRoute("/collaborations/$collaborationId/requests")({
    component: RequestsPage,
});
function RequestsPage() {
    const { collaborationId } = Route.useParams();
    const qc = useQueryClient();
    const { toast, show } = useToast();
    const q = useQuery({
        queryKey: ["collab-requests", collaborationId],
        queryFn: () => api(`/collaborations/${collaborationId}/join-requests`, { auth: true }),
    });
    const decide = useMutation({
        mutationFn: ({ id, action }) => api(`/collaborations/join-requests/${id}/${action}`, { method: "PATCH", auth: true }),
        onSuccess: (_d, vars) => {
            show(`Request ${vars.action}d.`, "success");
            qc.invalidateQueries({ queryKey: ["collab-requests", collaborationId] });
            qc.invalidateQueries({ queryKey: ["collab-members", collaborationId] });
        },
        onError: (e) => show(e instanceof ApiError ? e.message : "Action failed", "error"),
    });
    return (<AppShell>
      <div className="mb-6">
        <Link to="/collaborations/$collaborationId" params={{ collaborationId }} className="text-xs font-bold text-muted hover:text-primary">
          ← Back to Collaboration
        </Link>
      </div>
      <PageHeader title="Join Requests" subtitle="Review incoming requests to join your group."/>

      {q.isLoading && <LoadingState />}
      {q.error && (<ErrorState message={q.error instanceof ApiError ? q.error.message : "Failed to load"}/>)}
      {q.data && q.data.length === 0 && <EmptyState title="No join requests."/>}
      {q.data && q.data.length > 0 && (<Card className="overflow-hidden animate-slide-up">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 border-b border-border">
              <tr>
                <Th>Request</Th>
                <Th>User</Th>
                <Th>Status</Th>
                <Th>Requested</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {q.data.map((r) => {
                const isPending = (r.status ?? "").toLowerCase() === "pending";
                return (<tr key={r.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      #{String(r.id).slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      #{String(r.user_id).slice(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status}/>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {r.requested_at
                        ? new Date(r.requested_at).toLocaleString()
                        : r.created_at
                            ? new Date(r.created_at).toLocaleString()
                            : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => decide.mutate({ id: r.id, action: "approve" })} disabled={!isPending || decide.isPending} className="text-xs font-bold text-accent-green hover:underline disabled:text-muted disabled:no-underline disabled:cursor-not-allowed">
                          Approve
                        </button>
                        <button onClick={() => decide.mutate({ id: r.id, action: "reject" })} disabled={!isPending || decide.isPending} className="text-xs font-bold text-accent-red hover:underline disabled:text-muted disabled:no-underline disabled:cursor-not-allowed">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>);
            })}
            </tbody>
          </table>
        </Card>)}
      {toast && <Toast message={toast.message} tone={toast.tone}/>}
    </AppShell>);
}
function Th({ children }) {
    return (<th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
      {children}
    </th>);
}
