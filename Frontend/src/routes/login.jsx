import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/app-shell";
import { Button, ErrorState, Field, TextInput } from "@/components/ui-bits";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  validateSearch: (search) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate({ to: search.redirect ?? "/dashboard", replace: true });
  }, [isAuthenticated, navigate, search.redirect]);

  async function submit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate({ to: search.redirect ?? "/dashboard", replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
      <div className="relative flex flex-col p-6 md:p-10">
        <div className="absolute -left-24 top-24 size-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <Link to="/" className="relative flex items-center gap-2 mb-12 md:mb-16">
          <BrandMark />
        </Link>

        <div className="relative flex-1 grid place-items-center">
          <div className="w-full max-w-sm animate-slide-up">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-3">Student login</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Welcome back.</h1>
            <p className="text-muted mb-8 leading-relaxed">
              Continue solving challenges, reviewing submissions and building with your team.
            </p>

            <form onSubmit={submit} className="space-y-5">
              {error && <ErrorState message={error} />}
              <Field label="Email address">
                <TextInput
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@college.edu"
                  autoComplete="email"
                />
              </Field>
              <Field label="Password">
                <TextInput
                  type="password"
                  required
                  minLength={5}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </Field>
              <Button variant="accent" type="submit" disabled={loading} className="w-full rounded-full">
                {loading ? "Signing in…" : "Open dashboard →"}
              </Button>
            </form>

            <p className="text-sm text-muted text-center mt-6">
              New to the hub?{" "}
              <Link to="/signup" className="text-primary font-bold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <p className="relative text-[10px] text-muted font-mono uppercase tracking-widest mt-10">
          © Smart College Hub
        </p>
      </div>

      <div className="relative hidden lg:block bg-gradient-primary overflow-hidden">
        <div className="absolute inset-0 grid-paper opacity-10" />
        <div className="absolute -right-28 top-20 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-primary-foreground">
          <div className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] backdrop-blur">
            Focus mode enabled
          </div>
          <div className="max-w-md animate-slide-up">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] opacity-70 mb-6">
              Built for daily practice
            </p>
            <blockquote className="text-2xl md:text-3xl font-serif italic leading-snug text-balance">
              “Small daily submissions become real confidence before exams, interviews and hackathons.”
            </blockquote>
            <p className="mt-6 text-sm opacity-80">— Smart College Hub</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs font-mono uppercase tracking-widest">
            {[
              ["01", "Solve"],
              ["02", "Submit"],
              ["03", "Rank"],
            ].map(([number, label]) => (
              <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="opacity-60">{number}</p>
                <p className="mt-1 font-bold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
