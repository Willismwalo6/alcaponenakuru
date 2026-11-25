import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { newReservationReference } from "@/lib/bookings";
import { RESERVATION_CATEGORIES, SEATING_AREAS, normalizeKenyanPhone } from "@/lib/site";
import { rateLimit, requestKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  const limit = rateLimit(requestKey(request, "reservation-create"), 5, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many enquiries. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return bad("Invalid request body.");
  }

  const name = String(payload.name ?? "").trim();
  const phoneRaw = String(payload.phone ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const date = String(payload.date ?? "").trim();
  const arrivalTime = String(payload.arrival_time ?? "").trim();
  const guests = Number(payload.guests ?? 0);
  const category = String(payload.category ?? "General Enquiry").trim();
  const seating = String(payload.seating ?? "No preference").trim();
  const requests = String(payload.requests ?? "").trim();

  if (name.length < 2 || name.length > 120) return bad("Please enter your name.");
  const phone = normalizeKenyanPhone(phoneRaw);
  if (!phone) return bad("Enter a valid Kenyan mobile number, e.g. 0712 345 678.");
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return bad("Enter a valid email address or leave it blank.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return bad("Choose a date for your visit.");
  const requested = new Date(`${date}T20:00:00+03:00`);
  if (Number.isNaN(requested.getTime())) return bad("Choose a valid date.");
  if (requested.getTime() < Date.now() - 24 * 60 * 60 * 1000) return bad("Choose a date in the future.");
  if (!Number.isFinite(guests) || guests < 1 || guests > 500) return bad("Enter a guest count between 1 and 500.");
  if (!RESERVATION_CATEGORIES.includes(category as (typeof RESERVATION_CATEGORIES)[number])) {
    return bad("Choose a valid reservation category.");
  }
  if (!SEATING_AREAS.includes(seating as (typeof SEATING_AREAS)[number])) {
    return bad("Choose a valid seating area.");
  }
  if (requests.length > 2000) return bad("Please keep your notes under 2000 characters.");

  const reference = await newReservationReference();
  const sql = await getSql();

  await sql`
    insert into reservations
      (reference, name, phone, email, date, arrival_time, guests, category, seating, requests, status, admin_notes)
    values
      (${reference}, ${name}, ${phone}, ${email.toLowerCase()}, ${date}, ${arrivalTime},
       ${Math.floor(guests)}, ${category}, ${seating}, ${requests}, 'new', '')
  `;

  return NextResponse.json({ reference }, { status: 201 });
}
