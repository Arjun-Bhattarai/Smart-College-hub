import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button, Card, EmptyState, ErrorState, Field, LoadingState, Select, TextInput, Textarea } from "@/components/ui-bits";
import { api, ApiError, API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/resources/")({
  component: ResourceHub,
});

// Resource module endpoints (owned by the Resources module on the backend,
// independent of the Challenges module). If the backend's mount prefix for
// `resource_route.py` ever changes, update the helpers below in one place.
const resourceEndpoints = {
  list: (challengeId) => `/resources/${challengeId}/resources`,
  upload: (challengeId) => `/resources/${challengeId}/resources/upload`,
  requests: (challengeId) => `/resources/${challengeId}/resource-requests`,
};

function ResourceHub() {
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();

  const challengesQ = useQuery({
    queryKey: ["challenges"],
    queryFn: () => api("/challenges/"),
  });

  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [resourceMode, setResourceMode] = useState("request");

  const [requestMessage, setRequestMessage] = useState("");
  const [requestFeedback, setRequestFeedback] = useState(null);

  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFeedback, setUploadFeedback] = useState(null);

  useEffect(() => {
    if (!selectedChallenge && challengesQ.data && challengesQ.data.length > 0) {
      setSelectedChallenge(String(challengesQ.data[0].id));
    }
  }, [challengesQ.data, selectedChallenge]);

  const requestsQ = useQuery({
    queryKey: ["resource-requests", selectedChallenge],
    queryFn: () => api(resourceEndpoints.requests(selectedChallenge)),
    enabled: !!selectedChallenge,
  });

  const resourcesQ = useQuery({
    queryKey: ["resources", selectedChallenge],
    queryFn: () => api(resourceEndpoints.list(selectedChallenge)),
    enabled: !!selectedChallenge,
  });

  const requestResource = useMutation({
    mutationFn: () =>
      api(resourceEndpoints.requests(selectedChallenge), {
        method: "POST",
        auth: true,
        body: { message: requestMessage },
      }),
    onSuccess: () => {
      setRequestMessage("");
      setRequestFeedback("Resource request posted.");
      qc.invalidateQueries({ queryKey: ["resource-requests", selectedChallenge] });
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
      return api(resourceEndpoints.upload(selectedChallenge), {
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
      qc.invalidateQueries({ queryKey: ["resources", selectedChallenge] });
    },
    onError: (e) => {
      setUploadFeedback(e instanceof ApiError ? e.message : "Could not upload document");
    },
  });

  const hasChallenges = !!challengesQ.data && challengesQ.data.length > 0;

  return (
    <AppShell>
      <PageHeader
        title="Resource Hub"
        subtitle="Request learning material or share documents for any coding challenge."
      />

      {challengesQ.isLoading && <LoadingState />}
      {challengesQ.error && (
        <ErrorState
          message={challengesQ.error instanceof ApiError ? challengesQ.error.message : "Failed to load challenges"}
        />
      )}
      {challengesQ.data && challengesQ.data.length === 0 && (
        <EmptyState
          title="No challenges available yet."
          subtitle="Resources are tied to challenges — check back once a challenge has been created."
        />
      )}

      {hasChallenges && (
        <Card className="p-6 mb-6 animate-slide-up">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Resources</h3>

          <div className="mb-4">
            <Field label="Challenge">
              <Select value={selectedChallenge} onChange={(e) => setSelectedChallenge(e.target.value)}>
                {challengesQ.data.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              type="button"
              variant={resourceMode === "request" ? "primary" : "secondary"}
              onClick={() => setResourceMode("request")}
            >
              Request Resource
            </Button>
            <Button
              type="button"
              variant={resourceMode === "upload" ? "primary" : "secondary"}
              onClick={() => setResourceMode("upload")}
            >
              Upload Document
            </Button>
          </div>

          {!isAuthenticated && <p className="text-sm text-muted">Sign in to request or upload resources.</p>}

          {isAuthenticated && resourceMode === "request" && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setRequestFeedback(null);
                requestResource.mutate();
              }}
            >
              <Field label="What resource do you need?">
                <Textarea
                  required
                  rows={4}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Example: Need reference notes or walkthrough for this challenge."
                />
              </Field>
              <Button type="submit" disabled={requestResource.isPending || !selectedChallenge || !requestMessage.trim()}>
                {requestResource.isPending ? "Posting request…" : "Post Resource Request"}
              </Button>
              {requestFeedback && <p className="text-xs font-medium text-muted">{requestFeedback}</p>}
            </form>
          )}

          {isAuthenticated && resourceMode === "upload" && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setUploadFeedback(null);
                uploadResource.mutate();
              }}
            >
              <Field label="Document Title">
                <TextInput
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Example: Recursion Notes"
                />
              </Field>
              <Field label="Description">
                <Textarea
                  rows={4}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Short description of this document."
                />
              </Field>
              <Field label="Upload File">
                <input
                  required
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm"
                />
              </Field>
              <Button
                type="submit"
                disabled={uploadResource.isPending || !selectedChallenge || !uploadTitle.trim() || !uploadFile}
              >
                {uploadResource.isPending ? "Uploading…" : "Upload Document"}
              </Button>
              {uploadFeedback && <p className="text-xs font-medium text-muted">{uploadFeedback}</p>}
            </form>
          )}

          {isAuthenticated && (
            <div className="mt-6 border-t border-border pt-5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">
                Open Requests For Selected Challenge
              </h4>
              {requestsQ.isLoading && <p className="text-sm text-muted">Loading requests…</p>}
              {!requestsQ.isLoading && (!requestsQ.data || requestsQ.data.length === 0) && (
                <p className="text-sm text-muted">No requests yet for this challenge.</p>
              )}
              <div className="space-y-2.5">
                {requestsQ.data?.map((request) => (
                  <div key={request.id} className="rounded-lg border border-border bg-card p-3">
                    <p className="text-sm">{request.message}</p>
                    <p className="text-[11px] font-medium text-muted mt-2">
                      Requested by user #{String(request.requester_id).slice(0, 8)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 border-t border-border pt-5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">
              Uploaded Documents For Selected Challenge
            </h4>
            {resourcesQ.isLoading && <p className="text-sm text-muted">Loading documents…</p>}
            {!resourcesQ.isLoading && (!resourcesQ.data || resourcesQ.data.length === 0) && (
              <p className="text-sm text-muted">No documents uploaded yet.</p>
            )}
            <div className="space-y-2.5">
              {resourcesQ.data?.map((resource) => (
                <div key={resource.id} className="rounded-lg border border-border bg-card p-3">
                  <p className="text-sm font-semibold">{resource.title}</p>
                  {resource.description && <p className="text-xs text-muted mt-1">{resource.description}</p>}
                  <a
                    href={`${API_BASE_URL}${resource.file_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline"
                  >
                    Open {resource.file_name}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </AppShell>
  );
}