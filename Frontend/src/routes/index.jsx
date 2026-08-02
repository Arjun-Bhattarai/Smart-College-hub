import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { BrandMark } from "@/components/app-shell";
import { LoadingState } from "@/components/ui-bits";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingState />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Landing />;
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden">
      <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/75 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="shrink-0">
            <BrandMark />
          </Link>
          <div className="hidden md:flex items-center gap-1 rounded-full border border-border bg-card/70 p-1 shadow-sm">
            <Link to="/challenges" className="px-3.5 py-2 text-sm font-semibold text-muted hover:text-foreground rounded-full hover:bg-secondary/70">
              Challenges
            </Link>
            <Link to="/collaborations" className="px-3.5 py-2 text-sm font-semibold text-muted hover:text-foreground rounded-full hover:bg-secondary/70">
              Teams
            </Link>
            <Link to="/leaderboard" className="px-3.5 py-2 text-sm font-semibold text-muted hover:text-foreground rounded-full hover:bg-secondary/70">
              Leaderboard
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-bold text-muted hover:text-foreground px-3 py-2">
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-foreground text-background rounded-full text-sm font-bold hover:bg-foreground/90 shadow-sm"
            >
              Join now
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative">
        <div className="absolute inset-0 bg-hero pointer-events-none" />
        <div className="absolute inset-0 grid-paper-fade pointer-events-none" />
        <div className="absolute -right-32 top-28 size-[32rem] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 bottom-10 size-[24rem] rounded-full bg-accent-amber/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-20 md:pt-24 md:pb-28">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/85 backdrop-blur text-[11px] font-bold uppercase tracking-[0.2em] text-muted mb-7 shadow-sm">
                <span className="size-1.5 rounded-full bg-accent-green animate-pulse" />
                Learn • Build • Compete
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.96] text-balance mb-6">
                A cleaner campus hub for students who <span className="bg-gradient-warm bg-clip-text text-transparent">ship skills</span>.
              </h1>
              <p className="text-lg md:text-xl text-muted max-w-2xl text-pretty mb-9 leading-relaxed">
                Smart College Hub brings coding practice, project teams, submissions, and leaderboards into one focused workspace for modern colleges.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-primary text-primary-foreground rounded-full text-sm font-bold shadow-glow hover:shadow-elevated transition-shadow"
                >
                  Start learning free →
                </Link>
                <Link
                  to="/challenges"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border border-border bg-card/90 backdrop-blur rounded-full text-sm font-bold hover:bg-secondary shadow-sm"
                >
                  Explore challenges
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-xl">
                {STATS.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border bg-card/80 p-4 shadow-card backdrop-blur">
                    <p className="text-2xl md:text-3xl font-black tracking-tight">{item.value}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 animate-slide-up">
              <div className="relative rounded-[2rem] border border-border bg-card/85 p-4 shadow-elevated backdrop-blur-xl">
                <div className="rounded-[1.45rem] border border-border bg-background p-5 overflow-hidden">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Today&apos;s sprint</p>
                      <h2 className="mt-1 text-xl font-black">Campus Coding Flow</h2>
                    </div>
                    <span className="rounded-full bg-accent-green/10 px-3 py-1 text-[10px] font-bold text-accent-green border border-accent-green/20">
                      Active
                    </span>
                  </div>

                  <div className="space-y-3">
                    {SPRINT.map((item, index) => (
                      <div key={item.title} className="group rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-card transition-shadow">
                        <div className="flex items-start gap-3">
                          <span className="size-8 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center text-xs font-black shrink-0">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-sm">{item.title}</h3>
                            <p className="text-xs text-muted leading-relaxed mt-1">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl bg-gradient-primary p-4 text-primary-foreground shadow-glow">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-75">Leaderboard pulse</p>
                        <p className="mt-1 text-2xl font-black">Top 10 chase</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black">87%</p>
                        <p className="text-[10px] uppercase tracking-widest opacity-75">progress</p>
                      </div>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-white/20 overflow-hidden">
                      <div className="h-full w-[87%] rounded-full bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-y border-border/60 bg-card/35">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="max-w-2xl mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-3">What makes it useful</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-balance">
              Everything students need after class, without the clutter.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {FEATURES.map((item) => (
              <FeatureCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-4">
          {AUDIENCE.map((item) => (
            <div key={item.title} className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4">{item.eyebrow}</p>
              <h3 className="text-xl font-black tracking-tight mb-2">{item.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-[2rem] border border-border bg-foreground text-background p-8 md:p-10 shadow-elevated overflow-hidden relative">
          <div className="absolute right-0 top-0 size-80 bg-primary/30 blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] opacity-70 mb-3">Ready for your college?</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-balance">
                Turn practice into progress.
              </h2>
              <p className="mt-3 text-sm md:text-base opacity-75 max-w-2xl">
                Create an account, solve your first challenge, invite friends into a project team, and start building your campus profile.
              </p>
            </div>
            <Link
              to="/signup"
              className="inline-flex shrink-0 rounded-full bg-background text-foreground px-6 py-3 text-sm font-black shadow-sm hover:opacity-90"
            >
              Create account →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <p className="font-mono uppercase tracking-widest">Smart College Hub</p>
          <p>© {new Date().getFullYear()} — Built for students who learn by building.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ item }) {
  return (
    <div className="group rounded-3xl border border-border bg-card p-6 shadow-card hover:-translate-y-1 hover:shadow-elevated transition-all">
      <div className="size-11 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-5 group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-colors">
        {item.icon}
      </div>
      <h3 className="font-black text-lg mb-2">{item.title}</h3>
      <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
    </div>
  );
}

const STATS = [
  { value: "3x", label: "faster practice" },
  { value: "24/7", label: "learning hub" },
  { value: "100%", label: "student focused" },
];

const SPRINT = [
  {
    title: "Pick a challenge",
    desc: "Choose easy, medium or hard problems based on your current confidence level.",
  },
  {
    title: "Submit and improve",
    desc: "Send solutions, review scores, and keep your submission history in one place.",
  },
  {
    title: "Build with peers",
    desc: "Create collaboration groups and find students with the skills your project needs.",
  },
];

const FEATURES = [
  {
    title: "Challenge library",
    desc: "Organized coding problems with difficulty labels, starter code and clear submission flow.",
    icon: <CodeIcon />,
  },
  {
    title: "Collaboration spaces",
    desc: "Students can create project teams, list required skills, request to join and manage members.",
    icon: <TeamIcon />,
  },
  {
    title: "Campus leaderboard",
    desc: "A simple competitive layer that encourages students to keep practicing and improving.",
    icon: <TrophyIcon />,
  },
];

const AUDIENCE = [
  {
    eyebrow: "For students",
    title: "Practice with direction",
    desc: "Know what to solve next, track submissions, and build confidence before exams or hackathons.",
  },
  {
    eyebrow: "For teachers",
    title: "Review work faster",
    desc: "Admins can manage users, publish challenges, and review submissions from a clean dashboard.",
  },
  {
    eyebrow: "For project teams",
    title: "Find the right people",
    desc: "Collaboration pages help students discover groups and join teams based on skills and interest.",
  },
];

function CodeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
