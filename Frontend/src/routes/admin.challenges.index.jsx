import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button, Card, ConfirmDialog, DifficultyBadge, EmptyState, ErrorState, Field, LoadingState, Select, TextInput, Textarea, Toast, } from "@/components/ui-bits";
import { api, ApiError, API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/useToast";
export const Route = createFileRoute("/admin/challenges/")({
    component: AdminChallenges,
});
function AdminChallenges() {
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
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [toDelete, setToDelete] = useState(null);
    const [selectedChallenge, setSelectedChallenge] = useState("");
    const [resourceMode, setResourceMode] = useState("request");
    const [requestMessage, setRequestMessage] = useState("");
    const [requestFeedback, setRequestFeedback] = useState(null);
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploadDescription, setUploadDescription] = useState("");
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadFeedback, setUploadFeedback] = useState(null);
    const q = useQuery({
        queryKey: ["challenges"],
        queryFn: () => api("/challenges/"),
        enabled: isAdmin,
    });
    useEffect(() => {
      if (!selectedChallenge && q.data && q.data.length > 0) {
        setSelectedChallenge(String(q.data[0].id));
      }
    }, [q.data, selectedChallenge]);

    const requestsQ = useQuery({
      queryKey: ["challenge-resource-requests", selectedChallenge],
      queryFn: () => api(`/resources/${selectedChallenge}/resource-requests`),
      enabled: isAdmin && !!selectedChallenge,
    });
    const resourcesQ = useQuery({
      queryKey: ["challenge-resources", selectedChallenge],
      queryFn: () => api(`/resources/${selectedChallenge}/resources`),
      enabled: isAdmin && !!selectedChallenge,
    });
    const filtered = useMemo(() => {
        return (q.data ?? []).filter((c) => {
            const s = search.trim().toLowerCase();
            if (s && !c.title.toLowerCase().includes(s))
                return false;
            if (difficulty && (c.difficulty ?? "").toLowerCase() !== difficulty.toLowerCase())
                return false;
            return true;
        });
    }, [q.data, search, difficulty]);
    const del = useMutation({
        mutationFn: (id) => api(`/challenges/${id}`, { method: "DELETE", auth: true }),
        onSuccess: () => {
            show("Challenge deleted", "success");
            setToDelete(null);
            qc.invalidateQueries({ queryKey: ["challenges"] });
        },
        onError: (e) => show(e instanceof ApiError ? e.message : "Delete failed", "error"),
    });
    const requestResource = useMutation({
        mutationFn: () => api(`/resources/${selectedChallenge}/resource-requests`, {
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
            return api(`/resources/${selectedChallenge}/resources/upload`, {
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
    return (<AppShell>
      <PageHeader eyebrow="Admin" title="Challenge Management" subtitle="Create, edit and manage coding challenges." actions={<Link to="/admin/challenges/new">
            <Button>+ New Challenge</Button>
          </Link>}/>

      <Card className="p-6 mb-6 animate-slide-up">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Resources Board</h3>
        {q.data && q.data.length === 0 && (<p className="text-sm text-muted">No challenge exists yet, so requests and uploads cannot be posted.</p>)}
        {q.data && q.data.length > 0 && (<>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button type="button" variant={resourceMode === "request" ? "primary" : "secondary"} onClick={() => setResourceMode("request")}>Request Resource</Button>
              <Button type="button" variant={resourceMode === "upload" ? "primary" : "secondary"} onClick={() => setResourceMode("upload")}>Upload Document</Button>
            </div>

            {resourceMode === "request" && (<form className="space-y-4" onSubmit={(e) => {
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
                  <Textarea required rows={4} value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} placeholder="Example: Need answer format notes or test-case breakdown."/>
                </Field>
                <Button type="submit" disabled={requestResource.isPending || !selectedChallenge || !requestMessage.trim()}>
                  {requestResource.isPending ? "Posting request…" : "Post Resource Request"}
                </Button>
                {requestFeedback && <p className="text-xs font-medium text-muted">{requestFeedback}</p>}
              </form>)}

            {resourceMode === "upload" && (<form className="space-y-4" onSubmit={(e) => {
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
                  <TextInput required value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Example: Greedy Algorithm Notes"/>
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

            <div className="mt-6 border-t border-border pt-5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Open Requests For Selected Challenge</h4>
              {requestsQ.isLoading && <p className="text-sm text-muted">Loading requests…</p>}
              {!requestsQ.isLoading && (!requestsQ.data || requestsQ.data.length === 0) && (<p className="text-sm text-muted">No requests yet for this challenge.</p>)}
              <div className="space-y-2.5">
                {requestsQ.data?.map((request) => (<div key={request.id} className="rounded-lg border border-border bg-card p-3">
                    <p className="text-sm">{request.message}</p>
                    <p className="text-[11px] font-medium text-muted mt-2">Requested by user #{String(request.requester_id).slice(0, 8)}</p>
                  </div>))}
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-5">
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
            </div>
          </>)}
      </Card>

      <Card className="p-4 mb-6 flex flex-col sm:flex-row gap-3 animate-slide-up">
        <TextInput placeholder="Search by title…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1"/>
        <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="sm:max-w-[200px]">
          <option value="">All difficulties</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </Select>
      </Card>

      {q.isLoading && <LoadingState />}
      {q.error && <ErrorState message={q.error instanceof ApiError ? q.error.message : "Failed to load"}/>}
      {q.data && filtered.length === 0 && <EmptyState title="No challenges match your filters."/>}

      {filtered.length > 0 && (<Card className="overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 border-b border-border">
                <tr>
                  <Th>Title</Th>
                  <Th>Difficulty</Th>
                  <Th>Created</Th>
                  <Th>Submissions</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (<tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{c.title}</p>
                      <p className="text-[10px] font-mono text-muted uppercase tracking-wider mt-0.5">
                        #{String(c.id).slice(0, 8)}
                      </p>
                    </td>
                    <td className="px-4 py-3"><DifficultyBadge difficulty={c.difficulty}/></td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {c.total_submissions ?? c.submission_count ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link to="/challenges/$challengeId" params={{ challengeId: String(c.id) }}>
                          <Button variant="ghost">View</Button>
                        </Link>
                        <Link to="/admin/challenges/$challengeId/edit" params={{ challengeId: String(c.id) }}>
                          <Button variant="secondary">Edit</Button>
                        </Link>
                        <Button variant="danger" onClick={() => setToDelete(c)}>Delete</Button>
                      </div>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </Card>)}

      <ConfirmDialog open={!!toDelete} title="Delete challenge?" message={`This will permanently delete "${toDelete?.title}".`} confirmLabel={del.isPending ? "Deleting…" : "Delete"} danger onCancel={() => setToDelete(null)} onConfirm={() => toDelete && del.mutate(toDelete.id)}/>
      {toast && <Toast message={toast.message} tone={toast.tone}/>}
    </AppShell>);
}
function Th({ children }) {
    return <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">{children}</th>;
}
