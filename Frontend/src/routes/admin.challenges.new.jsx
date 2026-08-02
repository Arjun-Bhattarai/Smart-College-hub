import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button, Card, ErrorState, Field, Select, TextInput, Textarea } from "@/components/ui-bits";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
export const Route = createFileRoute("/admin/challenges/new")({
    component: AdminNewChallenge,
});
function AdminNewChallenge() {
    const { isAdmin, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!loading && !isAuthenticated)
            navigate({ to: "/login", search: { redirect: "/admin/challenges/new" }, replace: true });
        else if (!loading && !isAdmin)
            navigate({ to: "/challenges", replace: true });
    }, [isAdmin, isAuthenticated, loading, navigate]);
    const [form, setForm] = useState({
        title: "",
        description: "",
        difficulty: "Easy",
        starter_code: "",
    });
    const [error, setError] = useState(null);
    const mut = useMutation({
        mutationFn: () => api("/challenges/", { method: "POST", auth: true, body: form }),
        onSuccess: () => navigate({ to: "/challenges" }),
        onError: (e) => setError(e instanceof ApiError ? e.message : "Failed to create challenge"),
    });
    return (<AppShell>
      <PageHeader title="Create Challenge" subtitle="Add a new coding challenge for students."/>
      <Card className="p-8 max-w-3xl animate-slide-up">
        <form onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            mut.mutate();
        }} className="space-y-5">
          {error && <ErrorState message={error}/>}
          <Field label="Title">
            <TextInput required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/>
          </Field>
          <Field label="Description">
            <Textarea required rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/>
          </Field>
          <Field label="Difficulty">
            <Select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </Select>
          </Field>
          <Field label="Starter code (optional)">
            <Textarea rows={10} value={form.starter_code} onChange={(e) => setForm({ ...form, starter_code: e.target.value })} placeholder="def solve():\n    pass"/>
          </Field>
          <div className="flex gap-3">
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending ? "Creating…" : "Create Challenge"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate({ to: "/challenges" })}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>);
}
