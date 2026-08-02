import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge, Card, ConfirmDialog, EmptyState, ErrorState, LoadingState, Toast, } from "@/components/ui-bits";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/useToast";
export const Route = createFileRoute("/collaborations/$collaborationId/members")({
    component: MembersPage,
});
function MembersPage() {
    const { collaborationId } = Route.useParams();
    const { user } = useAuth();
    const qc = useQueryClient();
    const { toast, show } = useToast();
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [confirmRemove, setConfirmRemove] = useState(null);
    const collab = useQuery({
        queryKey: ["collaboration", collaborationId],
        queryFn: () => api(`/collaborations/${collaborationId}`),
    });
    const members = useQuery({
        queryKey: ["collab-members", collaborationId],
        queryFn: () => api(`/collaborations/${collaborationId}/members`),
    });
    const isOwner = !!user && !!collab.data?.created_by && user.uid === collab.data.created_by;
    const remove = useMutation({
        mutationFn: (uid) => api(`/collaborations/${collaborationId}/members/${uid}`, { method: "DELETE", auth: true }),
        onSuccess: () => {
            show("Member removed.", "success");
            qc.invalidateQueries({ queryKey: ["collab-members", collaborationId] });
        },
        onError: (e) => show(e instanceof ApiError ? e.message : "Failed to remove", "error"),
    });
    const leave = useMutation({
        mutationFn: () => api(`/collaborations/${collaborationId}/leave`, { method: "DELETE", auth: true }),
        onSuccess: () => {
            show("Left collaboration.", "success");
            qc.invalidateQueries({ queryKey: ["collab-members", collaborationId] });
        },
        onError: (e) => show(e instanceof ApiError ? e.message : "Failed to leave", "error"),
    });
    return (<AppShell>
      <div className="mb-6">
        <Link to="/collaborations/$collaborationId" params={{ collaborationId }} className="text-xs font-bold text-muted hover:text-primary">
          ← Back to Collaboration
        </Link>
      </div>
      <PageHeader title="Members" subtitle={collab.data?.title}/>

      {members.isLoading && <LoadingState />}
      {members.error && (<ErrorState message={members.error instanceof ApiError ? members.error.message : "Failed to load"}/>)}
      {members.data && members.data.length === 0 && <EmptyState title="No members yet."/>}
      {members.data && members.data.length > 0 && (<Card className="overflow-hidden animate-slide-up">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 border-b border-border">
              <tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Joined</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {members.data.map((m) => {
                const isSelf = user?.uid === m.user_id;
                const isMemberOwner = collab.data?.created_by === m.user_id;
                return (<tr key={m.user_id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">
                      #{String(m.user_id).slice(0, 8)}
                      {isSelf && (<span className="ml-2 text-primary font-bold uppercase text-[10px]">
                          (you)
                        </span>)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={isMemberOwner ? "blue" : "neutral"}>
                        {isMemberOwner ? "owner" : m.role ?? "member"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {isOwner && !isMemberOwner && (<button onClick={() => setConfirmRemove(m.user_id)} className="text-xs font-bold text-accent-red hover:underline">
                          Remove
                        </button>)}
                      {isSelf && !isMemberOwner && (<button onClick={() => setConfirmLeave(true)} className="text-xs font-bold text-accent-red hover:underline">
                          Leave
                        </button>)}
                    </td>
                  </tr>);
            })}
            </tbody>
          </table>
        </Card>)}

      <ConfirmDialog open={confirmLeave} title="Leave Collaboration" message="You will lose access to this group." confirmLabel="Leave" danger onCancel={() => setConfirmLeave(false)} onConfirm={() => {
            setConfirmLeave(false);
            leave.mutate();
        }}/>
      <ConfirmDialog open={!!confirmRemove} title="Remove Member" message="This member will lose access to the collaboration." confirmLabel="Remove" danger onCancel={() => setConfirmRemove(null)} onConfirm={() => {
            if (confirmRemove)
                remove.mutate(confirmRemove);
            setConfirmRemove(null);
        }}/>
      {toast && <Toast message={toast.message} tone={toast.tone}/>}
    </AppShell>);
}
function Th({ children }) {
    return (<th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
      {children}
    </th>);
}
