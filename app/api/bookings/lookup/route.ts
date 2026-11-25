import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { normalizeKenyanPhone } from "@/lib/site";
import { rateLimit, requestKey } from "@/lib/rate-limit";
import type { BookingRow } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const limit = rateLimit(requestKey(request, "booking-lookup"), 20, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many lookups. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const { searchParams } = new URL(request.url);
  const reference = (searchParams.get("reference") ?? "").trim().toUpperCase();
  const phone = normalizeKenyanPhone(searchParams.get("phone") ?? "");

  if (!reference || !phone) {
    return NextResponse.json(
      { error: "Enter your booking reference and the phone number used." },
      { status: 400 },
    );
  }

  const sql = await getSql();
  const rows = (await sql`select * from bookings where reference = ${reference} limit 1`) as unknown as BookingRow[];
  const booking = rows[0];

  if (!booking) {
    return NextResponse.json({ error: "No booking matches that reference." }, { status: 404 });
  }
  if (booking.phone !== phone) {
    return NextResponse.json(
      { error: "That phone number does not match this booking." },
      { status: 403 },
    );
  }

  return NextResponse.json({ reference: booking.reference, status: booking.status });
}
