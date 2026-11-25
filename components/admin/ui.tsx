import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-champagne/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display-md text-champagne">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm text-ash">{subtitle}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className="btn btn-solid btn-sm shrink-0">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function Stat({ label, value, href }: { label: string; value: number | string; href?: string }) {
  const content = (
    <>
      <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.22em] text-ash">{label}</p>
      <p className="mt-3 font-display text-4xl leading-none text-champagne">{value}</p>
    </>
  );
  return href ? (
    <Link href={href} className="block border border-champagne/10 bg-ink-soft p-5 transition-colors hover:border-champagne/30">
      {content}
    </Link>
  ) : (
    <div className="border border-champagne/10 bg-ink-soft p-5">{content}</div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  new: "border-champagne/40 text-champagne",
  pending: "border-champagne/40 text-champagne",
  confirmed: "border-crimson/60 bg-crimson/20 text-champagne",
  completed: "border-champagne/20 text-ash",
  declined: "border-champagne/20 text-ash",
  cancelled: "border-champagne/20 text-ash",
  valid: "border-crimson/60 bg-crimson/20 text-champagne",
  redeemed: "border-champagne/20 text-ash",
  void: "border-champagne/20 text-ash",
  published: "border-crimson/60 bg-crimson/20 text-champagne",
  draft: "border-champagne/20 text-ash",
  sold_out: "border-champagne/40 text-champagne",
  archived: "border-champagne/15 text-ash/70",
  checked_in: "border-champagne/20 text-ash",
};

export function Pill({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={`inline-flex items-center border px-2 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.16em] ${
        STATUS_STYLES[status] ?? "border-champagne/25 text-ash"
      }`}
    >
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}

export function Notice({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: "info" | "success" | "error";
}) {
  const styles =
    tone === "success"
      ? "border-champagne/25 bg-graphite/50 text-champagne"
      : tone === "error"
        ? "border-crimson/50 bg-crimson/15 text-champagne"
        : "border-champagne/15 bg-graphite/30 text-ash";
  return <div className={`mb-6 border px-4 py-3 text-xs leading-relaxed ${styles}`}>{children}</div>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-dashed border-champagne/20 px-6 py-10 text-center text-sm text-ash">
      {children}
    </div>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[0.5625rem] font-semibold uppercase tracking-[0.2em] text-ash">{children}</span>;
}
