import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button, Card, EmptyState, ErrorState, Field, LoadingState, Textarea } from "@/components/ui-bits";
import { api, ApiError, API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/resources/")({
  component: ResourceHub,
});

function ResourceHub() {
  const { isAuthenticated, user } = useAuth();
  const qc = useQueryClient();

  const [requestMessage, setRequestMessage] = useState("");
  const [requestFeedback, setRequestFeedback] = useState(null);

  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFeedback, setUploadFeedback] = useState(null);

  const [resourceMode, setResourceMode] = useState("request");

  const requestsQ = useQuery({
    queryKey: ["resource-requests"],
    queryFn: () => api("/resources/requests"),
  });

  const resourcesQ = useQuery({
    queryKey: ["resources"],
    queryFn: () => api("/resources/"),
  });

  const requestResource = useMutation({
    mutationFn: () =>
      api("/resources/requests", {
        method: "POST",
        auth: true,
        body: { message: requestMessage },
      }),
    onSuccess: () => {
      setRequestMessage("");
      setRequestFeedback("Resource request posted.");
      qc.invalidateQueries({ queryKey: ["resource-requests"] });
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
      return api("/resources/upload", {
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
      qc.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (e) => {
      setUploadFeedback(e instanceof ApiError ? e.message : "Could not upload document");
    },
  });

  const deleteRequest = useMutation({
    mutationFn: (requestId) =>
      api(`/resources/requests/${requestId}`, {
        method: "DELETE",
        auth: true,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resource-requests"] });
    },
  });

  const deleteResource = useMutation({
    mutationFn: (resourceId) =>
      api(`/resources/${resourceId}`, {
        method: "DELETE",
        auth: true,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resources"] });
    },
  });

  return (
    <AppShell>
      <PageHeader
        title="Resource Hub"
        subtitle="Request learning material or share documents."
      />

      <Card className="p-6 mb-6 animate-slide-up">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Resources</h3>

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
            <Button type="submit" disabled={requestResource.isPending || !requestMessage.trim()}>
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
              <input
                required
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Example: Recursion Notes"
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm"
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
              disabled={uploadResource.isPending || !uploadTitle.trim() || !uploadFile}
            >
              {uploadResource.isPending ? "Uploading…" : "Upload Document"}
            </Button>
            {uploadFeedback && <p className="text-xs font-medium text-muted">{uploadFeedback}</p>}
          </form>
        )}

        {isAuthenticated && (
          <div className="mt-6 border-t border-border pt-5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">
              Open Requests
            </h4>
            {requestsQ.isLoading && <p className="text-sm text-muted">Loading requests…</p>}
            {!requestsQ.isLoading && (!requestsQ.data || requestsQ.data.length === 0) && (
              <p className="text-sm text-muted">No requests yet.</p>
            )}
            <div className="space-y-2.5">
              {requestsQ.data?.map((request) => {
                const isOwner = user?.uid === String(request.requester_id);
                return (
                  <div key={request.id} className="rounded-lg border border-border bg-card p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm">{request.message}</p>
                        <p className="text-[11px] font-medium text-muted mt-2">
                          Requested by user #{String(request.requester_id).slice(0, 8)}
                        </p>
                      </div>
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => deleteRequest.mutate(request.id)}
                          disabled={deleteRequest.isPending}
                          className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-accent-red border border-accent-red/30 hover:bg-accent-red/10 transition-colors disabled:opacity-50"
                          title="Remove your request"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-border pt-5">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">
            Uploaded Documents
          </h4>
          {resourcesQ.isLoading && <p className="text-sm text-muted">Loading documents…</p>}
          {!resourcesQ.isLoading && (!resourcesQ.data || resourcesQ.data.length === 0) && (
            <p className="text-sm text-muted">No documents uploaded yet.</p>
          )}
          <div className="space-y-2.5">
            {resourcesQ.data?.map((resource) => {
              const isUploader = user?.uid === String(resource.uploader_id);
              return (
                <div key={resource.id} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
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
                    {isUploader && (
                      <button
                        type="button"
                        onClick={() => deleteResource.mutate(resource.id)}
                        disabled={deleteResource.isPending}
                        className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-accent-red border border-accent-red/30 hover:bg-accent-red/10 transition-colors disabled:opacity-50"
                        title="Remove your document"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </AppShell>
  );
}