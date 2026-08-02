import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button, Card, ErrorState, Field, LoadingState, TextInput, Textarea } from "@/components/ui-bits";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
export const Route = createFileRoute("/collaborations/$collaborationId/edit")({
    component: EditCollab,
});
function EditCollab() {
    const { collaborationId } = Route.useParams();
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!loading && !isAuthenticated)
            navigate({ to: "/login", replace: true });
    }, [isAuthenticated, loading, navigate]);
    const q = useQuery({
        queryKey: ["collaboration", collaborationId],
        queryFn: () => api(`/collaborations/${collaborationId}`),
    });
    const [form, setForm] = useState({
        title: "",
        description: "",
        max_members: "",
        skillsInput: "",
    });
    const [seeded, setSeeded] = useState(false);
    const [error, setError] = useState(null);
    if (q.data && !seeded) {
        setForm({
            title: q.data.title ?? "",
            description: q.data.description ?? "",
            max_members: q.data.max_members != null ? String(q.data.max_members) : "",
            skillsInput: (q.data.required_skills ?? []).join(", "),
        });
        setSeeded(true);
    }
    const mut = useMutation({
        mutationFn: () => {
            const body = {
                title: form.title,
                description: form.description || undefined,
            };
            if (form.max_members)
                body.max_members = Number(form.max_members);
            const skills = form.skillsInput
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            body.required_skills = skills;
            return api(`/collaborations/${collaborationId}`, {
                method: "PATCH",
                auth: true,
                body,
            });
        },
        onSuccess: () => navigate({
            to: "/collaborations/$collaborationId",
            params: { collaborationId },
            replace: true,
        }),
        onError: (e) => setError(e instanceof ApiError ? e.message : "Failed to update"),
    });
    return (<AppShell>
      <PageHeader title="Edit Collaboration" subtitle="Update your group's details."/>
      {q.isLoading && <LoadingState />}
      {q.data && (<Card className="p-8 max-w-3xl animate-slide-up">
          <form onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                mut.mutate();
            }} className="space-y-5">
            {error && <ErrorState message={error}/>}
            <Field label="Title">
              <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/>
            </Field>
            <Field label="Description">
              <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/>
            </Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Max members">
                <TextInput type="number" min={1} value={form.max_members} onChange={(e) => setForm({ ...form, max_members: e.target.value })}/>
              </Field>
              <Field label="Required skills" hint="Comma separated">
                <TextInput value={form.skillsInput} onChange={(e) => setForm({ ...form, skillsInput: e.target.value })}/>
              </Field>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={mut.isPending}>
                {mut.isPending ? "Saving…" : "Save Changes"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate({
                to: "/collaborations/$collaborationId",
                params: { collaborationId },
            })}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>)}
    </AppShell>);
}
