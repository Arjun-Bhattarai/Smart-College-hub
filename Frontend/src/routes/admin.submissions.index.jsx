import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge, Button, Card, EmptyState, ErrorState, Field, LoadingState, Select, StatusBadge, TextInput, Textarea, Toast, } from "@/components/ui-bits";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/useToast";
const STATUSES = ["Pending", "Accepted", "Rejected", "Needs Improvement"];
export const Route = createFileRoute("/admin/submissions/")({
    component: AdminSubmissions,
});
function AdminSubmissions() {
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
    const [selectedChallenge, setSelectedChallenge] = useState("");
    const [reviewing, setReviewing] = useState(null);
    const challenges = useQuery({
        queryKey: ["challenges"],
        queryFn: () => api("/challenges/"),
        enabled: isAdmin,
    });
    useEffect(() => {
        if (!selectedChallenge && challenges.data && challenges.data.length > 0) {
            setSelectedChallenge(String(challenges.data[0].id));
        }
    }, [challenges.data, selectedChallenge]);
    const subs = useQuery({
        queryKey: ["admin-subs", selectedChallenge],
        queryFn: () => api(`/challenges/${selectedChallenge}/submissions`, { auth: true }),
        enabled: isAdmin && !!selectedChallenge,
    });
    const currentChallenge = challenges.data?.find((c) => String(c.id) === selectedChallenge);
    return (<AppShell>
      <PageHeader eyebrow="Admin" title="Submission Reviews" subtitle="Review student submissions and provide feedback."/>

      <Card className="p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-slide-up">
        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted shrink-0">
          Challenge
        </label>
        <Select value={selectedChallenge} onChange={(e) => setSelectedChallenge(e.target.value)} className="flex-1">
          {challenges.data?.map((c) => (<option key={c.id} value={String(c.id)}>{c.title}</option>))}
        </Select>
      </Card>

      {subs.isLoading && <LoadingState />}
      {subs.error && <ErrorState message={subs.error instanceof ApiError ? subs.error.message : "Failed to load"}/>}
      {subs.data && subs.data.length === 0 && <EmptyState title="No submissions for this challenge yet."/>}

      {subs.data && subs.data.length > 0 && (<Card className="overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 border-b border-border">
                <tr>
                  <Th>Student</Th>
                  <Th>Challenge</Th>
                  <Th>Submitted</Th>
                  <Th>Status</Th>
                  <Th>Score</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {subs.data.map((s) => (<tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{studentName(s)}</p>
                      {s.email && <p className="text-[10px] text-muted">{s.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs">{currentChallenge?.title ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={s.status ?? "pending"}/></td>
                    <td className="px-4 py-3 font-mono">{s.score ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setReviewing({ ...s, code: "__load__" })}>View</Button>
                        <Button variant="secondary" onClick={() => setReviewing({ ...s, code: "__load__" })}>Review</Button>
                      </div>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </Card>)}

      {reviewing && (<ReviewDrawer submissionId={reviewing.id} challenge={currentChallenge} fallback={reviewing} onClose={() => setReviewing(null)} onSaved={() => {
                show("Review saved", "success");
                setReviewing(null);
                qc.invalidateQueries({ queryKey: ["admin-subs", selectedChallenge] });
            }}/>)}
      {toast && <Toast message={toast.message} tone={toast.tone}/>}
    </AppShell>);
}
function studentName(s) {
    const full = [s.first_name, s.last_name].filter(Boolean).join(" ");
    return s.student_name || full || s.username || s.email || `User #${String(s.user_id ?? "").slice(0, 8)}`;
}
function Th({ children }) {
    return <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">{children}</th>;
}
function ReviewDrawer({ submissionId, challenge, fallback, onClose, onSaved, }) {
    const q = useQuery({
        queryKey: ["submission", submissionId],
        queryFn: () => api(`/challenges/submissions/${submissionId}`, { auth: true }),
    });
    const sub = q.data ?? fallback;
    const [status, setStatus] = useState(sub.status ?? "Pending");
    const [score, setScore] = useState(sub.score ?? 0);
    const [feedback, setFeedback] = useState(sub.feedback ?? "");
    const [error, setError] = useState(null);
    useEffect(() => {
        if (q.data) {
            setStatus(q.data.status ?? "Pending");
            setScore(q.data.score ?? 0);
            setFeedback(q.data.feedback ?? "");
        }
    }, [q.data]);
    const save = useMutation({
        mutationFn: () => api(`/challenges/submissions/${submissionId}`, {
            method: "PATCH",
            auth: true,
            body: { status, score, feedback },
        }),
        onSuccess: onSaved,
        onError: (e) => setError(e instanceof ApiError ? e.message : "Save failed"),
    });
    return (<div className="fixed inset-0 z-50 flex justify-end bg-foreground/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-2xl h-full bg-card border-l border-border overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Review Submission</p>
            <h2 className="text-lg font-bold">#{String(submissionId).slice(0, 12)}</h2>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="p-6 space-y-6">
          {q.isLoading && <LoadingState />}

          <section className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Student</p>
              <p className="font-semibold text-sm">{studentName(sub)}</p>
              {sub.email && <p className="text-xs text-muted mt-1">{sub.email}</p>}
              <p className="text-[10px] text-muted font-mono mt-2">
                {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : "—"}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Challenge</p>
              <p className="font-semibold text-sm">{challenge?.title ?? `#${String(sub.challenge_id).slice(0, 8)}`}</p>
              <div className="mt-2 flex gap-2">
                {challenge?.difficulty && <Badge tone="blue">{challenge.difficulty}</Badge>}
                {sub.language && <Badge>{sub.language}</Badge>}
              </div>
            </Card>
          </section>

          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Submitted Code</p>
            <pre className="bg-foreground text-background font-mono text-xs p-4 rounded-lg overflow-x-auto max-h-[400px] leading-relaxed">
              {sub.code && sub.code !== "__load__" ? sub.code : q.isLoading ? "Loading…" : "// No code available"}
            </pre>
          </section>

          <section className="space-y-4">
            {error && <ErrorState message={error}/>}
            <Field label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Score (0–100)">
              <TextInput type="number" min={0} max={100} value={score} onChange={(e) => setScore(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}/>
            </Field>
            <Field label="Feedback">
              <Textarea rows={5} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Give the student constructive feedback…"/>
            </Field>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => { setError(null); save.mutate(); }} disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save Review"}
              </Button>
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
            </div>
          </section>
        </div>
      </div>
    </div>);
}
