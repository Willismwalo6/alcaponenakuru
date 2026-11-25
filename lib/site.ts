export const SITE = {
  name: "AL CAPONE",
  legalName: "Al Capone Nakuru",
  tagline: "YOUR NIGHT. YOUR RULES.",
  description:
    "Al Capone is Nakuru's nightlife destination — events, table reservations, VIP experiences and private celebrations.",
  city: "Nakuru",
  country: "Kenya",
  defaultPhone: "0115333111",
  defaultWhatsapp: "254115333111",
};

export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Reservations", href: "/reservations" },
  { label: "Contact", href: "/contact" },
];

export const RESERVATION_CATEGORIES = [
  "VIP Table",
  "Birthday Celebration",
  "Group Booking",
  "Private Event",
  "General Enquiry",
] as const;

export const SEATING_AREAS = [
  "No preference",
  "VIP section",
  "Main floor",
  "Lounge",
  "Private booth",
  "Terrace",
] as const;

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting confirmation",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  checked_in: "Checked in",
};

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  new: "New enquiry",
  confirmed: "Confirmed",
  declined: "Declined",
  completed: "Completed",
};

/**
 * Resolves a stored media value to a servable URL.
 *
 * Uploads are stored as full Supabase Storage public URLs, so they pass through.
 * Bundled art direction still lives under /images, and the legacy local
 * `uploads/<file>` form is mapped onto the storage bucket for older rows.
 */
export function mediaSrc(filename: string): string {
  if (!filename) return "";
  if (/^(https?:)?\/\//.test(filename) || filename.startsWith("/")) return filename;

  if (filename.startsWith("uploads/")) {
    const base = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";
    if (base) {
      return `${base}/storage/v1/object/public/${bucket}/${filename.slice("uploads/".length)}`;
    }
  }

  return `/images/${filename}`;
}

export function whatsappLink(number: string, message?: string): string {
  const digits = (number || SITE.defaultWhatsapp).replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function telLink(phone: string): string {
  return `tel:${(phone || SITE.defaultPhone).replace(/\s+/g, "")}`;
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

/** Kenyan mobile number → 2547XXXXXXXX, or null when invalid. */
export function normalizeKenyanPhone(input: string): string | null {
  const digits = (input || "").replace(/\D/g, "");
  let normalized = digits;
  if (normalized.startsWith("0")) normalized = `254${normalized.slice(1)}`;
  else if (normalized.startsWith("7") || normalized.startsWith("1")) normalized = `254${normalized}`;
  if (!/^254(7|1)\d{8}$/.test(normalized)) return null;
  return normalized;
}

export function displayPhone(input: string): string {
  const normalized = normalizeKenyanPhone(input);
  if (!normalized) return input;
  return `0${normalized.slice(3)}`;
}

export function bookingWhatsappMessage(opts: {
  reference: string;
  eventTitle: string;
  total: number;
  phone: string;
}): string {
  return [
    `Hello Al Capone, I have submitted a ticket booking request.`,
    ``,
    `Reference: ${opts.reference}`,
    `Event: ${opts.eventTitle}`,
    `Total: KES ${opts.total.toLocaleString("en-KE")}`,
    `Phone: ${opts.phone}`,
    ``,
    `Please advise on how to complete payment.`,
  ].join("\n");
}
