import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button, Card, ErrorState, Field, LoadingState, Select, TextInput, Textarea } from "@/components/ui-bits";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
export const Route = createFileRoute("/admin/challenges/$challengeId/edit")({
    component: AdminEditChallenge,
});
function AdminEditChallenge() {
    const { challengeId } = Route.useParams();
    const { isAdmin, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const qc = useQueryClient();
    useEffect(() => {
        if (!loading && !isAuthenticated)
            navigate({ to: "/login", replace: true });
        else if (!loading && !isAdmin)
            navigate({ to: "/challenges", replace: true });
    }, [isAdmin, isAuthenticated, loading, navigate]);
    const q = useQuery({
        queryKey: ["challenge", challengeId],
        queryFn: () => api(`/challenges/${challengeId}`),
        enabled: isAdmin,
    });
    const [form, setForm] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (q.data && !form)
            setForm(q.data);
    }, [q.data, form]);
    const save = useMutation({
        mutationFn: () => api(`/challenges/${challengeId}`, {
            method: "PATCH",
            auth: true,
            body: {
                title: form?.title,
                description: form?.description,
                difficulty: form?.difficulty,
                starter_code: form?.starter_code,
            },
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["challenges"] });
            qc.invalidateQueries({ queryKey: ["challenge", challengeId] });
            navigate({ to: "/admin/challenges" });
        },
        onError: (e) => setError(e instanceof ApiError ? e.message : "Update failed"),
    });
    return (<AppShell>
      <PageHeader eyebrow="Admin" title="Edit Challenge" subtitle="Update challenge details."/>
      {q.isLoading && <LoadingState />}
      {q.error && <ErrorState message={q.error instanceof ApiError ? q.error.message : "Failed to load"}/>}
      {form && (<Card className="p-8 max-w-3xl animate-slide-up">
          <form onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                save.mutate();
            }} className="space-y-5">
            {error && <ErrorState message={error}/>}
            <Field label="Title">
              <TextInput required value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })}/>
            </Field>
            <Field label="Description">
              <Textarea required rows={6} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })}/>
            </Field>
            <Field label="Difficulty">
              <Select value={form.difficulty ?? "Easy"} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </Select>
            </Field>
            <Field label="Starter code">
              <Textarea rows={10} value={form.starter_code ?? ""} onChange={(e) => setForm({ ...form, starter_code: e.target.value })}/>
            </Field>
            <div className="flex gap-3">
              <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save Changes"}</Button>
              <Button type="button" variant="secondary" onClick={() => navigate({ to: "/admin/challenges" })}>Cancel</Button>
            </div>
          </form>
        </Card>)}
    </AppShell>);
}
