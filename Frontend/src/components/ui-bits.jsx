export function Button({ variant = "primary", className = "", children, ...rest }) {
    const base = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
    const styles = {
        primary: "bg-foreground text-background hover:bg-foreground/90 shadow-sm hover:shadow-elevated",
        accent: "bg-gradient-primary text-primary-foreground shadow-sm hover:shadow-glow",
        secondary: "border border-border bg-card hover:bg-secondary text-foreground shadow-sm",
        danger: "bg-accent-red text-white hover:bg-accent-red/90 shadow-sm",
        ghost: "text-muted hover:text-foreground hover:bg-secondary",
    };
    return (<button className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </button>);
}
export function Field({ label, children, error, hint, }) {
    return (<label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted mb-2 block">
        {label}
      </span>
      {children}
      {hint && !error && <span className="text-xs text-muted mt-1.5 block">{hint}</span>}
      {error && <span className="text-xs text-accent-red mt-1.5 block font-medium">{error}</span>}
    </label>);
}
const inputCls = "w-full px-3.5 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-3 focus:ring-primary/15 focus:border-primary transition shadow-sm";
export function TextInput(props) {
    return <input {...props} className={`${inputCls} ${props.className ?? ""}`}/>;
}
export function Textarea(props) {
    return <textarea {...props} className={`${inputCls} font-mono min-h-[120px] leading-relaxed ${props.className ?? ""}`}/>;
}
export function Select(props) {
    return <select {...props} className={`${inputCls} ${props.className ?? ""}`}/>;
}
export function Card({ children, className = "", interactive = false, ...rest }) {
    const base = "bg-card border border-border rounded-xl shadow-card";
    const inter = interactive
        ? "transition-all duration-200 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-elevated"
        : "";
    return <div className={`${base} ${inter} ${className}`} {...rest}>{children}</div>;
}
export function Badge({ children, tone = "neutral", }) {
    const tones = {
        neutral: "bg-secondary text-muted border-border",
        red: "bg-accent-red/10 text-accent-red border-accent-red/20",
        amber: "bg-accent-amber/12 text-accent-amber border-accent-amber/25",
        green: "bg-accent-green/10 text-accent-green border-accent-green/20",
        blue: "bg-primary/10 text-primary border-primary/20",
        plum: "bg-accent-plum/10 text-accent-plum border-accent-plum/20",
    };
    return (<span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-[0.1em] border ${tones[tone]}`}>
      {children}
    </span>);
}
export function DifficultyBadge({ difficulty }) {
    const d = (difficulty ?? "").toLowerCase();
    if (d === "hard")
        return <Badge tone="red">● Hard</Badge>;
    if (d === "medium")
        return <Badge tone="amber">● Medium</Badge>;
    if (d === "easy")
        return <Badge tone="green">● Easy</Badge>;
    return <Badge>{difficulty ?? "—"}</Badge>;
}
export function StatusBadge({ status }) {
    const s = (status ?? "").toLowerCase();
    if (s === "approved" || s === "accepted")
        return <Badge tone="green">{status}</Badge>;
    if (s === "rejected" || s === "failed")
        return <Badge tone="red">{status}</Badge>;
    if (s === "pending")
        return <Badge tone="amber">{status}</Badge>;
    return <Badge>{status ?? "—"}</Badge>;
}
export function EmptyState({ title, subtitle, action }) {
    return (<div className="bg-card border border-dashed border-border rounded-xl p-14 text-center shadow-sm">
      <div className="mx-auto mb-4 size-12 rounded-full bg-secondary grid place-items-center text-muted">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
      </div>
      <p className="font-bold text-lg mb-2">{title}</p>
      {subtitle && <p className="text-sm text-muted mb-6 max-w-sm mx-auto">{subtitle}</p>}
      {action}
    </div>);
}
export function LoadingState({ label = "Loading" }) {
    return (<div className="p-12 flex flex-col items-center justify-center gap-3">
      <div className="size-6 rounded-full border-2 border-border border-t-primary animate-spin"/>
      <p className="text-muted text-[11px] font-mono uppercase tracking-[0.2em]">{label}</p>
    </div>);
}
export function ErrorState({ message }) {
    return (<div className="bg-accent-red/5 border border-accent-red/20 rounded-lg p-4 text-sm text-accent-red flex gap-3 items-start">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
      <span className="font-medium">{message}</span>
    </div>);
}
export function SkillChips({ skills }) {
    if (!skills?.length)
        return null;
    return (<div className="flex flex-wrap gap-1.5">
      {skills.map((s) => (<span key={s} className="text-[10px] font-medium border border-border rounded-full px-2 py-0.5 bg-secondary/50">
          {s}
        </span>))}
    </div>);
}
export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", onConfirm, onCancel, danger = false, }) {
    if (!open)
        return null;
    return (<div className="fixed inset-0 z-50 grid place-items-center p-4 bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-elevated animate-slide-up">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>);
}
export function Toast({ message, tone = "info", }) {
    const tones = {
        info: "bg-foreground text-background",
        success: "bg-accent-green text-white",
        error: "bg-accent-red text-white",
    };
    return (<div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-elevated text-sm font-medium ${tones[tone]} animate-slide-up`}>
      {message}
    </div>);
}
