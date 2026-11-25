const TZ = "Africa/Nairobi";

export function formatKes(value: number): string {
  return `KES ${Math.round(value).toLocaleString("en-KE")}`;
}

export function formatDate(iso: string): string {
  if (!iso) return "To be announced";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date(iso));
}

export function formatDateLong(iso: string): string {
  if (!iso) return "To be announced";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TZ,
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  if (!iso) return "—";
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

export function dayNumber(iso: string): string {
  if (!iso) return "--";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", timeZone: TZ }).format(new Date(iso));
}

export function monthShort(iso: string): string {
  if (!iso) return "---";
  return new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: TZ })
    .format(new Date(iso))
    .toUpperCase();
}

export function isPast(iso: string): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

export function toLocalInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function todayInput(): string {
  return new Date().toISOString().slice(0, 10);
}

export function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
