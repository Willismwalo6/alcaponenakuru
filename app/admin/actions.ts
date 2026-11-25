"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMediaById, getSetting, getSql, setSetting, updateAdminPassword } from "@/lib/db";
import { clearSessionCookie, getCurrentAdmin, setSessionCookie, verifyCredentials } from "@/lib/auth";
import { BookingError, cancelBooking, confirmBooking, reopenBooking, redeemTicket } from "@/lib/bookings";
import { deleteObjectByUrl, uploadObject } from "@/lib/storage";
import { actionKey, rateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

function str(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

function num(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

function checked(formData: FormData, key: string) {
  return Boolean(formData.get(key));
}

function toIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function revalidatePublic(extra: string[] = []) {
  for (const p of ["/", "/events", "/tickets", "/gallery", "/reservations", "/admin", ...extra]) {
    revalidatePath(p);
  }
}

/* ---------------------------------- auth --------------------------------- */

export async function loginAction(formData: FormData) {
  const attempt = rateLimit(await actionKey("admin-login"), 8, 10 * 60_000);
  if (!attempt.ok) redirect("/admin/login?error=rate");

  const email = str(formData, "email");
  const password = str(formData, "password");

  const admin = await verifyCredentials(email, password);
  if (!admin) {
    redirect("/admin/login?error=1");
  }
  await setSessionCookie(admin.id);
  redirect("/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}

export async function changePasswordAction(formData: FormData) {
  const admin = await requireAdmin();
  const current = str(formData, "current_password");
  const next = str(formData, "new_password");

  if (next.length < 10) redirect("/admin/content?pw=short");
  const verified = await verifyCredentials(admin.email, current);
  if (!verified) redirect("/admin/content?pw=wrong");

  await updateAdminPassword(admin.id, bcrypt.hashSync(next, 10));
  redirect("/admin/content?pw=ok");
}

/* --------------------------------- events -------------------------------- */

export async function saveEventAction(formData: FormData) {
  await requireAdmin();
  const sql = await getSql();
  const id = num(formData, "id");
  const title = str(formData, "title");
  if (!title) redirect("/admin/events?error=title");

  const startsAt = toIso(str(formData, "starts_at"));
  if (!startsAt) redirect("/admin/events?error=date");

  const fields = {
    title,
    tagline: str(formData, "tagline"),
    description: str(formData, "description"),
    starts_at: startsAt,
    ends_at: toIso(str(formData, "ends_at")),
    doors_at: toIso(str(formData, "doors_at")),
    venue: str(formData, "venue", "Al Capone, Nakuru"),
    dress_code: str(formData, "dress_code"),
    age_limit: str(formData, "age_limit"),
    status: str(formData, "status", "draft"),
    featured: checked(formData, "featured"),
    cover: str(formData, "cover"),
  };

  if (id) {
    await sql`
      update events set
        title = ${fields.title}, tagline = ${fields.tagline}, description = ${fields.description},
        starts_at = ${fields.starts_at}, ends_at = ${fields.ends_at}, doors_at = ${fields.doors_at},
        venue = ${fields.venue}, dress_code = ${fields.dress_code}, age_limit = ${fields.age_limit},
        status = ${fields.status}, featured = ${fields.featured}, cover = ${fields.cover},
        updated_at = now()
      where id = ${id}
    `;
    revalidatePublic([`/events/${str(formData, "slug")}`, "/admin/events"]);
    redirect(`/admin/events/${id}?saved=1`);
  }

  const base = slugify(str(formData, "slug") || title) || `event-${Date.now()}`;
  let slug = base;
  let attempt = 2;
  while ((await sql`select 1 from events where slug = ${slug} limit 1`).length) {
    slug = `${base}-${attempt++}`;
  }

  const created = await sql`
    insert into events (slug, title, tagline, description, starts_at, ends_at, doors_at, venue,
      dress_code, age_limit, status, featured, is_placeholder, cover)
    values (${slug}, ${fields.title}, ${fields.tagline}, ${fields.description}, ${fields.starts_at},
      ${fields.ends_at}, ${fields.doors_at}, ${fields.venue}, ${fields.dress_code}, ${fields.age_limit},
      ${fields.status}, ${fields.featured}, false, ${fields.cover})
    returning id
  `;

  revalidatePublic(["/admin/events", `/events/${slug}`]);
  redirect(`/admin/events/${Number(created[0].id)}?saved=1`);
}

export async function deleteEventAction(formData: FormData) {
  await requireAdmin();
  const sql = await getSql();
  const id = num(formData, "id");
  const slug = str(formData, "slug");

  const bookings = await sql`select count(*)::int as count from bookings where event_id = ${id}`;
  if (Number(bookings[0].count) > 0) {
    redirect(`/admin/events/${id}?error=bookings`);
  }
  await sql`delete from events where id = ${id}`;
  revalidatePublic(["/admin/events", `/events/${slug}`]);
  redirect("/admin/events?deleted=1");
}

export async function saveTicketTypeAction(formData: FormData) {
  await requireAdmin();
  const sql = await getSql();
  const id = num(formData, "id");
  const eventId = num(formData, "event_id");
  const name = str(formData, "name");
  if (!name) redirect(`/admin/events/${eventId}?error=ticket`);

  const description = str(formData, "description");
  const price = Math.max(0, num(formData, "price"));
  const capacity = Math.max(0, num(formData, "capacity"));
  const active = checked(formData, "active");

  if (id) {
    await sql`
      update ticket_types set name = ${name}, description = ${description}, price = ${price},
        capacity = ${capacity}, active = ${active}
      where id = ${id} and event_id = ${eventId}
    `;
  } else {
    const order = await sql`
      select coalesce(max(sort_order), -1)::int as max from ticket_types where event_id = ${eventId}
    `;
    await sql`
      insert into ticket_types (name, description, price, capacity, active, event_id, sort_order)
      values (${name}, ${description}, ${price}, ${capacity}, ${active}, ${eventId}, ${Number(order[0].max) + 1})
    `;
  }
  revalidatePublic([`/admin/events/${eventId}`]);
  redirect(`/admin/events/${eventId}?saved=1`);
}

export async function deleteTicketTypeAction(formData: FormData) {
  await requireAdmin();
  const sql = await getSql();
  const id = num(formData, "id");
  const eventId = num(formData, "event_id");

  const used = await sql`select count(*)::int as count from tickets where ticket_type_id = ${id}`;
  if (Number(used[0].count) > 0) {
    await sql`update ticket_types set active = false where id = ${id}`;
  } else {
    await sql`delete from ticket_types where id = ${id} and event_id = ${eventId}`;
  }
  revalidatePublic([`/admin/events/${eventId}`]);
  redirect(`/admin/events/${eventId}?saved=1`);
}

/* ------------------------------ reservations ----------------------------- */

export async function updateReservationAction(formData: FormData) {
  await requireAdmin();
  const sql = await getSql();
  const id = num(formData, "id");
  const status = str(formData, "status");
  const notes = str(formData, "admin_notes");
  const allowed = ["new", "confirmed", "declined", "completed"];

  await sql`
    update reservations
    set status = ${allowed.includes(status) ? status : "new"}, admin_notes = ${notes}, updated_at = now()
    where id = ${id}
  `;
  revalidatePath("/admin/reservations");
  redirect(str(formData, "return_to") || "/admin/reservations?updated=1");
}

/* -------------------------------- bookings ------------------------------- */

export async function confirmBookingAction(formData: FormData) {
  await requireAdmin();
  const id = num(formData, "id");
  try {
    await confirmBooking(id);
  } catch (error) {
    const message =
      error instanceof BookingError ? error.message : "That booking could not be confirmed.";
    redirect(`/admin/bookings/${id}?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  redirect(`/admin/bookings/${id}?confirmed=1`);
}

export async function cancelBookingAction(formData: FormData) {
  await requireAdmin();
  const id = num(formData, "id");
  try {
    await cancelBooking(id, str(formData, "reason"));
  } catch {
    redirect(`/admin/bookings/${id}?error=cancel`);
  }
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  redirect(`/admin/bookings/${id}?cancelled=1`);
}

export async function reopenBookingAction(formData: FormData) {
  await requireAdmin();
  const id = num(formData, "id");
  await reopenBooking(id);
  revalidatePath("/admin/bookings");
  redirect(`/admin/bookings/${id}?reopened=1`);
}

/* ------------------------------ ticket check ----------------------------- */

export async function redeemTicketAction(formData: FormData) {
  await requireAdmin();
  const code = str(formData, "code");
  const result = await redeemTicket(code);
  redirect(`/admin/verify?code=${encodeURIComponent(code)}&result=${result.ok ? "ok" : "fail"}`);
}

export async function checkTicketAction(formData: FormData) {
  await requireAdmin();
  const code = str(formData, "code");
  redirect(`/admin/verify?code=${encodeURIComponent(code)}`);
}

/* --------------------------------- gallery ------------------------------- */

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export async function uploadMediaAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) redirect("/admin/gallery?error=file");

  const type = file.type;
  const ext = MIME_EXT[type];
  if (!ext) redirect("/admin/gallery?error=type");
  if (file.size > 45 * 1024 * 1024) redirect("/admin/gallery?error=size");

  const kind = type.startsWith("video/") ? "video" : "image";
  let publicUrl: string;
  try {
    publicUrl = await uploadObject({
      data: await file.arrayBuffer(),
      contentType: type,
      extension: ext,
      kind,
    });
  } catch (error) {
    console.error("Media upload failed", error);
    redirect("/admin/gallery?error=upload");
  }

  const caption = str(formData, "caption").slice(0, 300);
  const sql = await getSql();
  await sql`
    insert into media (filename, mime, kind, title, caption, featured)
    values (${publicUrl}, ${type}, ${kind}, ${caption.slice(0, 160)}, ${caption}, false)
  `;

  revalidatePublic(["/admin/gallery"]);
  redirect("/admin/gallery?uploaded=1");
}

export async function updateMediaAction(formData: FormData) {
  await requireAdmin();
  const sql = await getSql();
  const id = num(formData, "id");
  await sql`
    update media set caption = ${str(formData, "caption").slice(0, 300)}, featured = ${checked(formData, "featured")}
    where id = ${id}
  `;
  revalidatePublic(["/admin/gallery"]);
  redirect("/admin/gallery?saved=1");
}

export async function deleteMediaAction(formData: FormData) {
  await requireAdmin();
  const id = num(formData, "id");
  const media = await getMediaById(id);
  if (media) {
    const sql = await getSql();
    await sql`delete from media where id = ${id}`;
    await deleteObjectByUrl(media.filename);

    const slides = JSON.parse((await getSetting("hero_slides")) || "[]") as Array<{ mediaId: number }>;
    await setSetting(
      "hero_slides",
      JSON.stringify(slides.filter((slide) => slide.mediaId !== id)),
    );

    // Clear hero fields that pointed at the deleted file.
    if ((await getSetting("hero_video")) === media.filename) await setSetting("hero_video", "");
    if ((await getSetting("hero_poster")) === media.filename) await setSetting("hero_poster", "");
  }
  revalidatePublic(["/admin/gallery"]);
  redirect("/admin/gallery?deleted=1");
}

/* ------------------------------ hero slides ------------------------------ */

async function readSlides(): Promise<Array<{ mediaId: number }>> {
  try {
    const parsed = JSON.parse((await getSetting("hero_slides")) || "[]");
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s?.mediaId === "number") : [];
  } catch {
    return [];
  }
}

export async function addSlideAction(formData: FormData) {
  await requireAdmin();
  const mediaId = num(formData, "media_id");
  const slides = await readSlides();
  if (mediaId && !slides.some((s) => s.mediaId === mediaId)) {
    slides.push({ mediaId });
    await setSetting("hero_slides", JSON.stringify(slides));
  }
  revalidatePublic(["/admin/content"]);
  redirect("/admin/content?saved=1");
}

export async function removeSlideAction(formData: FormData) {
  await requireAdmin();
  const mediaId = num(formData, "media_id");
  await setSetting(
    "hero_slides",
    JSON.stringify((await readSlides()).filter((s) => s.mediaId !== mediaId)),
  );
  revalidatePublic(["/admin/content"]);
  redirect("/admin/content?saved=1");
}

export async function moveSlideAction(formData: FormData) {
  await requireAdmin();
  const mediaId = num(formData, "media_id");
  const direction = str(formData, "direction");
  const slides = await readSlides();
  const index = slides.findIndex((s) => s.mediaId === mediaId);
  if (index >= 0) {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target >= 0 && target < slides.length) {
      const [item] = slides.splice(index, 1);
      slides.splice(target, 0, item);
      await setSetting("hero_slides", JSON.stringify(slides));
    }
  }
  revalidatePublic(["/admin/content"]);
  redirect("/admin/content?saved=1");
}

/* -------------------------------- settings ------------------------------- */

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin();
  const keys = [
    "site_tagline",
    "phone",
    "whatsapp",
    "email",
    "address",
    "instagram",
    "tiktok",
    "opening_hours",
    "booking_notice",
    "hero_video",
    "hero_poster",
  ];
  for (const key of keys) {
    await setSetting(key, str(formData, key).slice(0, 1000));
  }
  revalidatePublic(["/admin/content", "/contact", "/about"]);
  redirect("/admin/content?saved=1");
}
