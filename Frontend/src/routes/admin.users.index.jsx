import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, LoadingState, Select, TextInput, Toast, } from "@/components/ui-bits";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/useToast";
export const Route = createFileRoute("/admin/users/")({
  component: AdminUsers,
});
function AdminUsers() {
  const { isAdmin, isAuthenticated, loading, user: me } = useAuth();
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
  const [roleFilter, setRoleFilter] = useState("");
  const [confirmDisable, setConfirmDisable] = useState(null);
  const [confirmEnable, setConfirmEnable] = useState(null);
  const q = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api("/auth/users", { auth: true }),
    enabled: isAdmin,
  });
  const filtered = useMemo(() => {
    return (q.data ?? []).filter((u) => {
      const s = search.trim().toLowerCase();
      if (s &&
        !(u.username ?? "").toLowerCase().includes(s) &&
        !(u.email ?? "").toLowerCase().includes(s) &&
        !fullName(u).toLowerCase().includes(s))
        return false;
      if (roleFilter && (u.role ?? "user") !== roleFilter)
        return false;
      return true;
    });
  }, [q.data, search, roleFilter]);
  const changeRole = useMutation({
    mutationFn: ({ id, role }) => api(`/auth/users/${id}/role`, { method: "PATCH", auth: true, body: { role } }),
    onSuccess: () => {
      show("Role updated", "success");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e) => show(e instanceof ApiError ? e.message : "Update failed", "error"),
  });
  const disable = useMutation({
    mutationFn: (id) => api(`/auth/users/${id}/disable`, { method: "PATCH", auth: true }),
    onSuccess: () => {
      show("User disabled", "success");
      setConfirmDisable(null);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e) => show(e instanceof ApiError ? e.message : "Disable failed", "error"),
  });
  const enable = useMutation({
    mutationFn: (id) => api(`/auth/users/${id}/enable`, { method: "PATCH", auth: true }),
    onSuccess: () => {
      show("User enabled", "success");
      setConfirmEnable(null);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e) => show(e instanceof ApiError ? e.message : "Enable failed", "error"),
  });
  return (<AppShell>
    <PageHeader eyebrow="Admin" title="User Management" subtitle="Manage all platform users." />

    <Card className="p-4 mb-6 flex flex-col sm:flex-row gap-3 animate-slide-up">
      <TextInput placeholder="Search name, email or username…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
      <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="sm:max-w-[180px]">
        <option value="">All roles</option>
        <option value="admin">Admin</option>
        <option value="user">Student</option>
      </Select>
    </Card>

    {q.isLoading && <LoadingState />}
    {q.error && <ErrorState message={q.error instanceof ApiError ? q.error.message : "Failed to load"} />}
    {q.data && filtered.length === 0 && <EmptyState title="No users found." />}

    {filtered.length > 0 && (<Card className="overflow-hidden animate-slide-up">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/60 border-b border-border">
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const id = String(u.uid ?? u.id ?? "");
              const isMe = me?.uid === u.uid || me?.email === u.email;
              const isDisabled = u.disabled === true || u.is_active === false || u.status === "disabled";
              return (<tr key={id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <p className="font-semibold">{fullName(u) || u.username || "—"}</p>
                  <p className="text-[10px] font-mono text-muted uppercase tracking-wider mt-0.5">@{u.username ?? "—"}</p>
                </td>
                <td className="px-4 py-3 text-xs">{u.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <Select value={u.role ?? "user"} disabled={isMe || changeRole.isPending} onChange={(e) => changeRole.mutate({ id, role: e.target.value })} className="max-w-[140px]">
                    <option value="user">Student</option>
                    <option value="admin">Admin</option>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  {isDisabled ? <Badge tone="red">Disabled</Badge> : <Badge tone="green">Active</Badge>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link to="/admin/users/$userId/submissions" params={{ userId: id }}>
                      <Button variant="ghost">Profile</Button>
                    </Link>
                    {isDisabled ? (
                      <Button variant="secondary" disabled={isMe} onClick={() => setConfirmEnable(u)}>
                        Enable
                      </Button>
                    ) : (
                      <Button variant="danger" disabled={isMe} onClick={() => setConfirmDisable(u)}>
                        Disable
                      </Button>
                    )}
                  </div>
                </td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </Card>)}

    <ConfirmDialog open={!!confirmDisable} title="Disable user?" message={`This will prevent ${fullName(confirmDisable ?? {}) || confirmDisable?.email} from signing in.`} confirmLabel={disable.isPending ? "Disabling…" : "Disable"} danger onCancel={() => setConfirmDisable(null)} onConfirm={() => confirmDisable && disable.mutate(String(confirmDisable.uid ?? confirmDisable.id ?? ""))} />
    <ConfirmDialog open={!!confirmEnable} title="Enable user?" message={`This will allow ${fullName(confirmEnable ?? {}) || confirmEnable?.email} to sign in again.`} confirmLabel={enable.isPending ? "Enabling…" : "Enable"} onCancel={() => setConfirmEnable(null)} onConfirm={() => confirmEnable && enable.mutate(String(confirmEnable.uid ?? confirmEnable.id ?? ""))} />
    {toast && <Toast message={toast.message} tone={toast.tone} />}
  </AppShell>);
}
function fullName(u) {
  return [u.first_name, u.last_name].filter(Boolean).join(" ");
}
function Th({ children }) {
  return <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">{children}</th>;
}
