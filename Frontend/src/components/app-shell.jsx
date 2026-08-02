import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const STUDENT_NAV = [
  { to: "/dashboard", label: "Dashboard", auth: true },
  { to: "/challenges", label: "Challenges", auth: false },
  { to: "/collaborations", label: "Teams", auth: false },
  { to: "/leaderboard", label: "Leaderboard", auth: false },
];

const ADMIN_NAV = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/challenges", label: "Challenges" },
  { to: "/admin/submissions", label: "Reviews" },
  { to: "/admin/collaborations", label: "Teams" },
  { to: "/leaderboard", label: "Leaderboard" },
];

export function BrandMark({ compact = false }) {
  return (
    <span className="inline-flex items-center gap-2 font-black tracking-tight text-lg">
      <span className="size-8 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center text-xs shadow-glow">
        SCH
      </span>
      {!compact && (
        <span>
          Smart College Hub<span className="text-accent-amber">.</span>
        </span>
      )}
    </span>
  );
}

export function AppShell({ children }) {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navItems = isAdmin
    ? ADMIN_NAV
    : STUDENT_NAV.filter((item) => !item.auth || isAuthenticated);

  const initials =
    (user?.username || user?.email || "U")
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "U";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <div className="fixed inset-x-0 top-0 z-40 h-24 bg-gradient-to-b from-background via-background/90 to-transparent pointer-events-none" />
      <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/78 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8 min-w-0">
            <Link to="/" className="shrink-0">
              <BrandMark />
            </Link>

            <div className="hidden lg:flex items-center gap-1 rounded-full border border-border bg-card/70 p-1 shadow-sm">
              {navItems.map((item) => (
                <NavLink key={item.to} item={item} pathname={pathname} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="hidden sm:block text-right group">
                  <p className="text-xs font-extrabold leading-none group-hover:text-primary transition-colors">
                    {user?.username ?? user?.email}
                  </p>
                  <p className="text-[10px] text-muted font-mono uppercase tracking-wider mt-1">
                    {isAdmin ? "Admin workspace" : user?.role ?? "student"}
                  </p>
                </Link>
                <Link
                  to="/profile"
                  className="size-9 rounded-full bg-gradient-primary grid place-items-center text-[11px] font-bold text-primary-foreground shadow-sm hover:shadow-glow transition-shadow"
                >
                  {initials}
                </Link>
                <button
                  onClick={() => {
                    void logout();
                  }}
                  className="hidden sm:inline text-xs font-semibold text-muted hover:text-accent-red transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline text-sm font-semibold text-muted hover:text-foreground transition-colors px-3 py-1.5"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:inline-flex px-4 py-2 bg-foreground text-background rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}

            <button
              onClick={() => setOpen((value) => !value)}
              className="lg:hidden inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm"
              aria-label="Toggle navigation"
            >
              <span className="text-lg leading-none">{open ? "×" : "☰"}</span>
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl px-4 py-4 animate-slide-up">
            <div className="grid gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold shadow-sm"
                >
                  {item.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-gradient-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow"
                >
                  Create account
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">{children}</main>

      <footer className="border-t border-border/60 mt-20 bg-card/35">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <BrandMark compact />
            <span className="font-mono uppercase tracking-widest">Smart College Hub</span>
          </div>
          <p>© {new Date().getFullYear()} — Built for students who learn by building.</p>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ item, pathname }) {
  const active = pathname === item.to || pathname.startsWith(item.to + "/");

  return (
    <Link
      to={item.to}
      className={
        "relative px-3.5 py-2 text-sm font-semibold rounded-full transition-all " +
        (active
          ? "text-primary-foreground bg-gradient-primary shadow-sm"
          : "text-muted hover:text-foreground hover:bg-secondary/80")
      }
    >
      {item.label}
    </Link>
  );
}

export function PageHeader({ title, subtitle, actions, eyebrow }) {
  return (
    <header className="mb-10 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-3xl min-w-0">
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-3">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3 text-balance leading-[1.02]">
            {title}
          </h1>
          {subtitle && <p className="text-muted text-base md:text-lg text-pretty leading-relaxed">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-3 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
