import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button, Card, ErrorState, Field, TextInput, Textarea } from "@/components/ui-bits";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
export const Route = createFileRoute("/collaborations/new")({
    component: NewCollab,
});
function NewCollab() {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!loading && !isAuthenticated)
            navigate({ to: "/login", search: { redirect: "/collaborations/new" }, replace: true });
    }, [isAuthenticated, loading, navigate]);
    const [form, setForm] = useState({
        title: "",
        description: "",
        max_members: "",
        skillsInput: "",
    });
    const [error, setError] = useState(null);
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
            if (skills.length)
                body.required_skills = skills;
            return api("/collaborations", {
                method: "POST",
                auth: true,
                body,
            });
        },
        onSuccess: () => navigate({ to: "/collaborations" }),
        onError: (e) => setError(e instanceof ApiError ? e.message : "Failed to create collaboration"),
    });
    return (<AppShell>
      <PageHeader title="Create Collaboration" subtitle="Start a new study group or project team."/>
      <Card className="p-8 max-w-3xl animate-slide-up">
        <form onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            mut.mutate();
        }} className="space-y-5">
          {error && <ErrorState message={error}/>}
          <Field label="Title">
            <TextInput required maxLength={100} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/>
          </Field>
          <Field label="Description">
            <Textarea rows={5} maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/>
          </Field>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Max members">
              <TextInput type="number" min={1} value={form.max_members} onChange={(e) => setForm({ ...form, max_members: e.target.value })}/>
            </Field>
            <Field label="Required skills" hint="Comma separated (e.g. Python, ML, FastAPI)">
              <TextInput value={form.skillsInput} onChange={(e) => setForm({ ...form, skillsInput: e.target.value })}/>
            </Field>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending ? "Creating…" : "Create Collaboration"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate({ to: "/collaborations" })}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>);
}
