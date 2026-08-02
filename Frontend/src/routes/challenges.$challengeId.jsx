import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button, Card, DifficultyBadge, ErrorState, Field, LoadingState, Select, Textarea, } from "@/components/ui-bits";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
const LANGUAGES = ["Python", "JavaScript", "Java", "C++", "C"];
export const Route = createFileRoute("/challenges/$challengeId")({
    component: ChallengeDetail,
});
function ChallengeDetail() {
    const { challengeId } = Route.useParams();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const q = useQuery({
        queryKey: ["challenge", challengeId],
        queryFn: () => api(`/challenges/${challengeId}`),
    });
    const [language, setLanguage] = useState("Python");
    const [code, setCode] = useState("");
    const [feedback, setFeedback] = useState(null);
    const submit = useMutation({
        mutationFn: () => api(`/challenges/${challengeId}/submit`, {
            method: "POST",
            auth: true,
            body: { language, code },
        }),
        onSuccess: () => {
            setFeedback("Solution submitted successfully.");
            setCode("");
            qc.invalidateQueries({ queryKey: ["my-submissions"] });
        },
        onError: (e) => setFeedback(e instanceof ApiError ? e.message : "Submit failed"),
    });
    // seed starter code once
    if (q.data?.starter_code && code === "" && !feedback) {
        setCode(q.data.starter_code);
    }
    return (<AppShell>
      <div className="mb-6">
        <Link to="/challenges" className="text-xs font-bold text-muted hover:text-primary">
          ← Back to Challenges
        </Link>
      </div>

      {q.isLoading && <LoadingState />}
      {q.error && (<ErrorState message={q.error instanceof ApiError ? q.error.message : "Failed to load challenge"}/>)}

      {q.data && (<>
          <PageHeader title={q.data.title} subtitle={q.data.description} actions={<DifficultyBadge difficulty={q.data.difficulty}/>}/>

          <div className="grid lg:grid-cols-12 gap-8 animate-slide-up">
            <Card className="lg:col-span-5 p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-3">
                Problem Description
              </h3>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{q.data.description}</p>
              {q.data.starter_code && (<div className="mt-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-3">
                    Starter Code
                  </h3>
                  <pre className="bg-foreground text-background font-mono text-xs p-4 rounded-lg overflow-x-auto">
                    {q.data.starter_code}
                  </pre>
                </div>)}
            </Card>

            <Card className="lg:col-span-7 p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">
                Submit Solution
              </h3>
              {!isAuthenticated ? (<div className="text-sm text-muted">
                  <Link to="/login" className="text-primary font-semibold hover:underline">
                    Sign in
                  </Link>{" "}
                  to submit a solution.
                </div>) : (<form onSubmit={(e) => {
                    e.preventDefault();
                    setFeedback(null);
                    submit.mutate();
                }} className="space-y-4">
                  <Field label="Language">
                    <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                      {LANGUAGES.map((l) => (<option key={l}>{l}</option>))}
                    </Select>
                  </Field>
                  <Field label="Code">
                    <Textarea required rows={16} value={code} onChange={(e) => setCode(e.target.value)} placeholder="// Your solution here"/>
                  </Field>
                  {feedback && (<div className="text-xs font-medium text-muted">{feedback}</div>)}
                  <div className="flex gap-3">
                    <Button type="submit" disabled={submit.isPending}>
                      {submit.isPending ? "Submitting…" : "Submit Solution"}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => navigate({ to: "/my-submissions" })}>
                      My Submissions
                    </Button>
                  </div>
                </form>)}
            </Card>
          </div>
        </>)}
    </AppShell>);
}
