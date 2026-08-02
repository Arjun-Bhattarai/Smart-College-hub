export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const ACCESS_KEY = "sch_access_token";
const REFRESH_KEY = "sch_refresh_token";
const USER_KEY = "sch_user";
export const tokenStore = {
    getAccess: () => (typeof window === "undefined" ? null : localStorage.getItem(ACCESS_KEY)),
    getRefresh: () => (typeof window === "undefined" ? null : localStorage.getItem(REFRESH_KEY)),
    getUser: () => {
        if (typeof window === "undefined")
            return null;
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    },
    setSession: (access, refresh, user) => {
        if (typeof window === "undefined")
            return;
        localStorage.setItem(ACCESS_KEY, access);
        if (refresh)
            localStorage.setItem(REFRESH_KEY, refresh);
        if (user)
            localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    setAccess: (access) => {
        if (typeof window === "undefined")
            return;
        localStorage.setItem(ACCESS_KEY, access);
    },
    clear: () => {
        if (typeof window === "undefined")
            return;
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
    },
};
export class ApiError extends Error {
    status;
    detail;
    constructor(status, message, detail) {
        super(message);
        this.status = status;
        this.detail = detail;
    }
}
async function refreshAccessToken() {
    const refresh = tokenStore.getRefresh();
    if (!refresh)
        return null;
    try {
        const res = await fetch(`${API_BASE_URL}/token/refresh`, {
            headers: { Authorization: `Bearer ${refresh}` },
        });
        if (!res.ok)
            return null;
        const data = (await res.json());
        if (data.access_token) {
            tokenStore.setAccess(data.access_token);
            return data.access_token;
        }
    }
    catch {
        // ignore
    }
    return null;
}
export async function api(path, opts = {}) {
    const { method = "GET", body, auth = false, useRefresh = false } = opts;
    const headers = {};
    if (body !== undefined)
        headers["Content-Type"] = "application/json";
    if (auth) {
        const token = useRefresh ? tokenStore.getRefresh() : tokenStore.getAccess();
        if (token)
            headers.Authorization = `Bearer ${token}`;
    }
    const doFetch = () => fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    let res = await doFetch();
    if (res.status === 401 && auth && !useRefresh) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            headers.Authorization = `Bearer ${newToken}`;
            res = await doFetch();
        }
    }
    const contentType = res.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);
    if (!res.ok) {
        const message = (data && typeof data === "object" && "detail" in data
            ? String(data.detail)
            : typeof data === "string"
                ? data
                : res.statusText) || "Request failed";
        throw new ApiError(res.status, message, data);
    }
    return data;
}
