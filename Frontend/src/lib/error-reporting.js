export function reportClientError(error, context = {}) {
  if (typeof window === "undefined") return;

  const payload = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    route: window.location.pathname,
    source: "react_error_boundary",
    ...context,
  };

  window.dispatchEvent(new CustomEvent("smart-college-hub:error", { detail: payload }));

  if (import.meta.env.DEV) {
    console.error("Smart College Hub captured an error", payload);
  }
}
