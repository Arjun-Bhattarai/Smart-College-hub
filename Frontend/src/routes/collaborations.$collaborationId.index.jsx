import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge, Button, Card, ConfirmDialog, ErrorState, LoadingState, SkillChips, } from "@/components/ui-bits";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Toast } from "@/components/ui-bits";
import { useToast } from "@/lib/useToast";
export const Route = createFileRoute("/collaborations/$collaborationId/")({
    component: CollabDetail,
});
function CollabDetail() {
    const { collaborationId } = Route.useParams();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { toast, show } = useToast();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const q = useQuery({
        queryKey: ["collaboration", collaborationId],
        queryFn: () => api(`/collaborations/${collaborationId}`),
    });
    const isOwner = !!user && !!q.data?.created_by && user.uid === q.data.created_by;
    const join = useMutation({
        mutationFn: () => api(`/collaborations/${collaborationId}/join`, { method: "POST", auth: true }),
        onSuccess: () => show("Join request sent.", "success"),
        onError: (e) => show(e instanceof ApiError ? e.message : "Failed to send request", "error"),
    });
    const leave = useMutation({
        mutationFn: () => api(`/collaborations/${collaborationId}/leave`, { method: "DELETE", auth: true }),
        onSuccess: () => {
            show("Left collaboration.", "success");
            qc.invalidateQueries({ queryKey: ["collab-members", collaborationId] });
        },
        onError: (e) => show(e instanceof ApiError ? e.message : "Failed to leave", "error"),
    });
    const del = useMutation({
        mutationFn: () => api(`/collaborations/${collaborationId}`, { method: "DELETE", auth: true }),
        onSuccess: () => navigate({ to: "/collaborations", replace: true }),
        onError: (e) => show(e instanceof ApiError ? e.message : "Failed to delete", "error"),
    });
    return (<AppShell>
      <div className="mb-6">
        <Link to="/collaborations" className="text-xs font-bold text-muted hover:text-primary">
          ← Back to Collaborations
        </Link>
      </div>

      {q.isLoading && <LoadingState />}
      {q.error && (<ErrorState message={q.error instanceof ApiError ? q.error.message : "Failed to load"}/>)}

      {q.data && (<>
          <PageHeader title={q.data.title} subtitle={q.data.description} actions={<div className="flex flex-wrap gap-3">
                {isAuthenticated && !isOwner && (<Button onClick={() => join.mutate()} disabled={join.isPending}>
                    {join.isPending ? "Sending…" : "Request to Join"}
                  </Button>)}
                {isOwner && (<>
                    <Link to="/collaborations/$collaborationId/edit" params={{ collaborationId }}>
                      <Button variant="secondary">Edit</Button>
                    </Link>
                    <Link to="/collaborations/$collaborationId/requests" params={{ collaborationId }}>
                      <Button variant="secondary">Join Requests</Button>
                    </Link>
                    <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                      Delete
                    </Button>
                  </>)}
              </div>}/>

          <div className="grid lg:grid-cols-3 gap-6 animate-slide-up">
            <Card className="lg:col-span-2 p-6 space-y-5">
              <Section title="Description">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {q.data.description || "No description provided."}
                </p>
              </Section>
              {q.data.required_skills && q.data.required_skills.length > 0 && (<Section title="Required Skills">
                  <SkillChips skills={q.data.required_skills}/>
                </Section>)}
              <div className="grid grid-cols-2 gap-6 pt-3 border-t border-border">
                <Meta label="Max members" value={q.data.max_members ?? "—"}/>
                <Meta label="Created" value={q.data.created_at ? new Date(q.data.created_at).toLocaleDateString() : "—"}/>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted">Quick actions</h3>
              <div className="flex flex-col gap-2">
                <Link to="/collaborations/$collaborationId/members" params={{ collaborationId }} className="text-sm font-semibold text-primary hover:underline">
                  View Members →
                </Link>
                {isAuthenticated && !isOwner && (<button onClick={() => leave.mutate()} className="text-sm font-semibold text-accent-red hover:underline text-left">
                    Leave Collaboration
                  </button>)}
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
                  Owner
                </p>
                <Badge tone="blue">{q.data.created_by ? `#${String(q.data.created_by).slice(0, 8)}` : "—"}</Badge>
              </div>
            </Card>
          </div>
        </>)}

      <ConfirmDialog open={confirmDelete} title="Delete Collaboration" message="This action cannot be undone." confirmLabel="Delete" danger onCancel={() => setConfirmDelete(false)} onConfirm={() => {
            setConfirmDelete(false);
            del.mutate();
        }}/>
      {toast && <Toast message={toast.message} tone={toast.tone}/>}
    </AppShell>);
}
function Section({ title, children }) {
    return (<div>
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-3">{title}</h3>
      {children}
    </div>);
}
function Meta({ label, value }) {
    return (<div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>);
}
