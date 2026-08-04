import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button, Card, DifficultyBadge, EmptyState, ErrorState, Field, LoadingState, Select, TextInput, Textarea } from "@/components/ui-bits";
import { api, ApiError, API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
export const Route = createFileRoute("/challenges/")({
    component: ChallengeList,
});
function ChallengeList() {
  const { isAdmin, isAuthenticated } = useAuth();
  const qc = useQueryClient();
    const q = useQuery({
        queryKey: ["challenges"],
        queryFn: () => api("/challenges/"),
    });
    const requestCountQueries = useQueries({
      queries: (q.data ?? []).map((challenge) => ({
        queryKey: ["challenge-resource-requests", String(challenge.id), "count"],
        queryFn: () => api(`/challenges/${challenge.id}/resource-requests`),
        staleTime: 60000,
      })),
    });
  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [resourceMode, setResourceMode] = useState("request");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestFeedback, setRequestFeedback] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFeedback, setUploadFeedback] = useState(null);

  const requestsQ = useQuery({
    queryKey: ["challenge-resource-requests", selectedChallenge],
    queryFn: () => api(`/challenges/${selectedChallenge}/resource-requests`),
    enabled: !!selectedChallenge,
  });

  const resourcesQ = useQuery({
    queryKey: ["challenge-resources", selectedChallenge],
    queryFn: () => api(`/challenges/${selectedChallenge}/resources`),
    enabled: !!selectedChallenge,
  });

  useEffect(() => {
    if (!selectedChallenge && q.data && q.data.length > 0) {
      setSelectedChallenge(String(q.data[0].id));
    }
  }, [q.data, selectedChallenge]);

  const requestResource = useMutation({
    mutationFn: () => api(`/challenges/${selectedChallenge}/resource-requests`, {
      method: "POST",
      auth: true,
      body: { message: requestMessage },
    }),
    onSuccess: () => {
      setRequestMessage("");
      setRequestFeedback("Resource request posted.");
      qc.invalidateQueries({ queryKey: ["challenge-resource-requests", selectedChallenge] });
    },
    onError: (e) => {
      setRequestFeedback(e instanceof ApiError ? e.message : "Could not post request");
    },
  });

  const uploadResource = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("title", uploadTitle);
      formData.append("description", uploadDescription);
      formData.append("file", uploadFile);
      return api(`/challenges/${selectedChallenge}/resources/upload`, {
        method: "POST",
        auth: true,
        body: formData,
      });
    },
    onSuccess: () => {
      setUploadTitle("");
      setUploadDescription("");
      setUploadFile(null);
      setUploadFeedback("Document uploaded successfully.");
      qc.invalidateQueries({ queryKey: ["challenge-resources", selectedChallenge] });
    },
    onError: (e) => {
      setUploadFeedback(e instanceof ApiError ? e.message : "Could not upload document");
    },
  });

    const requestCountByChallengeId = new Map((q.data ?? []).map((challenge, index) => {
      const result = requestCountQueries[index];
      const count = Array.isArray(result?.data) ? result.data.length : 0;
      return [String(challenge.id), count];
    }));

    return (<AppShell>
      <PageHeader title="Coding Challenges" subtitle="Sharpen your skills with problems across every difficulty." actions={isAdmin ? (<Link to="/admin/challenges/new">
              <Button>+ Create Challenge</Button>
            </Link>) : null}/>

      {q.isLoading && <LoadingState />}
      {q.error && (<ErrorState message={q.error instanceof ApiError ? q.error.message : "Failed to load challenges"}/>)}
      {q.data && q.data.length === 0 && (<EmptyState title="No challenges available yet." subtitle="Check back soon."/>)}

      <Card className="p-6 mb-6 animate-slide-up">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Resource Requests</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button type="button" variant={resourceMode === "request" ? "primary" : "secondary"} onClick={() => setResourceMode("request")}>Request Resource</Button>
          <Button type="button" variant={resourceMode === "upload" ? "primary" : "secondary"} onClick={() => setResourceMode("upload")}>Upload Document</Button>
        </div>
        {!isAuthenticated && (<p className="text-sm text-muted">Sign in to request resources from the Challenges section.</p>)}
        {isAuthenticated && q.data?.length === 0 && (<p className="text-sm text-muted">No challenge exists yet, so resource requests and uploads cannot be posted. Ask an admin to create a challenge first.</p>)}
        {isAuthenticated && q.data && q.data.length > 0 && resourceMode === "request" && (<form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                setRequestFeedback(null);
                requestResource.mutate();
            }}>
            <Field label="Challenge">
              <Select value={selectedChallenge} onChange={(e) => setSelectedChallenge(e.target.value)}>
                {q.data.map((c) => (<option key={c.id} value={String(c.id)}>{c.title}</option>))}
              </Select>
            </Field>
            <Field label="What resource do you need?">
              <Textarea required rows={4} value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} placeholder="Example: Need reference notes or walkthrough for this challenge."/>
            </Field>
            <Button type="submit" disabled={requestResource.isPending || !selectedChallenge || !requestMessage.trim()}>
              {requestResource.isPending ? "Posting request…" : "Post Resource Request"}
            </Button>
            {requestFeedback && <p className="text-xs font-medium text-muted">{requestFeedback}</p>}
          </form>)}
        {isAuthenticated && q.data && q.data.length > 0 && resourceMode === "upload" && (<form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                setUploadFeedback(null);
                uploadResource.mutate();
            }}>
            <Field label="Challenge">
              <Select value={selectedChallenge} onChange={(e) => setSelectedChallenge(e.target.value)}>
                {q.data.map((c) => (<option key={c.id} value={String(c.id)}>{c.title}</option>))}
              </Select>
            </Field>
            <Field label="Document Title">
              <TextInput required value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Example: Recursion Notes"/>
            </Field>
            <Field label="Description">
              <Textarea rows={4} value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} placeholder="Short description of this document."/>
            </Field>
            <Field label="Upload File">
              <input required type="file" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm"/>
            </Field>
            <Button type="submit" disabled={uploadResource.isPending || !selectedChallenge || !uploadTitle.trim() || !uploadFile}>
              {uploadResource.isPending ? "Uploading…" : "Upload Document"}
            </Button>
            {uploadFeedback && <p className="text-xs font-medium text-muted">{uploadFeedback}</p>}
          </form>)}

        {isAuthenticated && q.data && q.data.length > 0 && (<div className="mt-6 border-t border-border pt-5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Open Requests For Selected Challenge</h4>
            {requestsQ.isLoading && <p className="text-sm text-muted">Loading requests…</p>}
            {!requestsQ.isLoading && (!requestsQ.data || requestsQ.data.length === 0) && (<p className="text-sm text-muted">No requests yet for this challenge.</p>)}
            <div className="space-y-2.5">
              {requestsQ.data?.map((request) => (<div key={request.id} className="rounded-lg border border-border bg-card p-3">
                  <p className="text-sm">{request.message}</p>
                  <p className="text-[11px] font-medium text-muted mt-2">Requested by user #{String(request.requester_id).slice(0, 8)}</p>
                </div>))}
            </div>
          </div>)}

        {q.data && q.data.length > 0 && (<div className="mt-6 border-t border-border pt-5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Uploaded Documents For Selected Challenge</h4>
            {resourcesQ.isLoading && <p className="text-sm text-muted">Loading documents…</p>}
            {!resourcesQ.isLoading && (!resourcesQ.data || resourcesQ.data.length === 0) && (<p className="text-sm text-muted">No documents uploaded yet.</p>)}
            <div className="space-y-2.5">
              {resourcesQ.data?.map((resource) => (<div key={resource.id} className="rounded-lg border border-border bg-card p-3">
                  <p className="text-sm font-semibold">{resource.title}</p>
                  {resource.description && <p className="text-xs text-muted mt-1">{resource.description}</p>}
                  <a href={`${API_BASE_URL}${resource.file_url}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline">
                    Open {resource.file_name}
                  </a>
                </div>))}
            </div>
          </div>)}
      </Card>

      <div className="grid gap-4 animate-slide-up">
        {q.data?.map((c) => (<Card key={c.id} className="group p-6 hover:border-primary/40 transition-all">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2">
                  <DifficultyBadge difficulty={c.difficulty}/>
                </div>
                <h3 className="text-lg font-bold leading-tight">{c.title}</h3>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted mt-2">
                  Open requests: {requestCountByChallengeId.get(String(c.id)) ?? 0}
                </p>
                {c.description && (<p className="text-sm text-muted mt-2 line-clamp-2 max-w-2xl">{c.description}</p>)}
                {c.created_at && (<p className="text-[10px] font-mono uppercase text-muted mt-3 tracking-wider">
                    Created {new Date(c.created_at).toLocaleDateString()}
                  </p>)}
              </div>
              <Link to="/challenges/$challengeId" params={{ challengeId: String(c.id) }} className="shrink-0">
                <Button variant="secondary">View Details →</Button>
              </Link>
            </div>
          </Card>))}
      </div>
    </AppShell>);
}
