import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge, Card, ErrorState, LoadingState } from "@/components/ui-bits";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
export const Route = createFileRoute("/profile")({
    component: ProfilePage,
});
function ProfilePage() {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!loading && !isAuthenticated)
            navigate({ to: "/login", search: { redirect: "/profile" }, replace: true });
    }, [isAuthenticated, loading, navigate]);
    const profile = useQuery({
        queryKey: ["profile"],
        queryFn: () => api("/auth/profile", { auth: true }),
        enabled: isAuthenticated,
    });
    return (<AppShell>
      <PageHeader title="Profile" subtitle="Your account details."/>
      {profile.isLoading && <LoadingState />}
      {profile.error && (<ErrorState message={profile.error instanceof ApiError ? profile.error.message : "Failed to load profile"}/>)}
      {profile.data && (<Card className="p-8 max-w-2xl animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Row label="Username" value={profile.data.username}/>
            <Row label="Email" value={profile.data.email}/>
            <Row label="Role" value={<Badge tone={profile.data.role === "admin" ? "blue" : "neutral"}>
                  {profile.data.role ?? "user"}
                </Badge>}/>
            <Row label="Title" value={profile.data.title || "—"}/>
            <Row label="First name" value={profile.data.first_name || "—"}/>
            <Row label="Last name" value={profile.data.last_name || "—"}/>
            <Row label="Verified" value={<Badge tone={profile.data.is_verified ? "green" : "amber"}>
                  {profile.data.is_verified ? "Yes" : "No"}
                </Badge>}/>
            <Row label="Created" value={fmt(profile.data.created_at)}/>
          </div>
        </Card>)}
    </AppShell>);
}
function Row({ label, value }) {
    return (<div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>);
}
function fmt(d) {
    if (!d)
        return "—";
    const date = new Date(d);
    return isNaN(date.getTime()) ? d : date.toLocaleDateString();
}
