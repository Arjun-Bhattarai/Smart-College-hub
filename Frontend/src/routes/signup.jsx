import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BrandMark } from "@/components/app-shell";
import { Button, ErrorState, Field, TextInput } from "@/components/ui-bits";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const { signup, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    title: "",navigate
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(form);
      
        navigate({ to: "/login", replace: true });
      
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Signup failed. Please review the form.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
      <div className="relative flex flex-col p-6 md:p-10">
        <div className="absolute -left-24 top-24 size-72 rounded-full bg-accent-amber/10 blur-3xl pointer-events-none" />
        <Link to="/" className="relative flex items-center gap-2 mb-8 md:mb-10">
          <BrandMark />
        </Link>

        <div className="relative flex-1 grid place-items-center">
          <div className="w-full max-w-lg animate-slide-up">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-3">Create profile</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Join Smart College Hub.</h1>
            <p className="text-muted mb-8 leading-relaxed">
              Create your learning profile and start solving challenges with your college community.
            </p>

            <form onSubmit={submit} className="space-y-5">
              {error && <ErrorState message={error} />}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Username">
                  <TextInput
                    required
                    maxLength={100}
                    value={form.username}
                    onChange={(event) => update("username", event.target.value)}
                    placeholder="arjun_dev"
                    autoComplete="username"
                  />
                </Field>
                <Field label="Email">
                  <TextInput
                    type="email"
                    required
                    maxLength={100}
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    placeholder="you@college.edu"
                    autoComplete="email"
                  />
                </Field>
                <Field label="First name">
                  <TextInput value={form.first_name} onChange={(event) => update("first_name", event.target.value)} />
                </Field>
                <Field label="Last name">
                  <TextInput value={form.last_name} onChange={(event) => update("last_name", event.target.value)} />
                </Field>
                <Field label="Program / Title">
                  <TextInput
                    value={form.title}
                    onChange={(event) => update("title", event.target.value)}
                    placeholder="BSc CSIT / BCA / BE Computer"
                  />
                </Field>
                <Field label="Password" hint="Minimum 5 characters">
                  <TextInput
                    type="password"
                    required
                    minLength={5}
                    value={form.password}
                    onChange={(event) => update("password", event.target.value)}
                    autoComplete="new-password"
                  />
                </Field>
              </div>

              <Button variant="accent" type="submit" disabled={loading} className="w-full rounded-full">
                {loading ? "Creating account…" : "Create account →"}
              </Button>
              <p className="text-sm text-muted text-center">
                Already registered?{" "}
                <Link to="/login" className="text-primary font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <div className="relative hidden lg:block bg-gradient-primary overflow-hidden">
        <div className="absolute inset-0 grid-paper opacity-10" />
        <div className="absolute -right-28 bottom-20 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute inset-0 flex flex-col justify-center p-12 text-primary-foreground">
          <div className="max-w-md animate-slide-up">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] opacity-70 mb-6">
              Your learning loop
            </p>
            <h2 className="text-3xl md:text-4xl font-black leading-tight text-balance mb-6">
              Solve. Review. Collaborate. <span className="italic font-serif">Level up.</span>
            </h2>
            <ul className="space-y-3 text-sm opacity-90">
              {[
                "Practice from a structured challenge library",
                "Track submissions and scores over time",
                "Create or join project teams based on skills",
                "Compete through the campus leaderboard",
              ].map((text) => (
                <li key={text} className="flex gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-amber" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
