import { NextResponse } from "next/server";
import { getReservationByReference } from "@/lib/db";
import { normalizeKenyanPhone } from "@/lib/site";
import { rateLimit, requestKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const limit = rateLimit(requestKey(request, "reservation-lookup"), 20, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many lookups. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const { searchParams } = new URL(request.url);
  const reference = (searchParams.get("reference") ?? "").trim().toUpperCase();
  const phone = normalizeKenyanPhone(searchParams.get("phone") ?? "");

  if (!reference) {
    return NextResponse.json({ error: "Enter your reference." }, { status: 400 });
  }

  const row = await getReservationByReference(reference);

  if (!row) {
    return NextResponse.json({ error: "We could not find that reference." }, { status: 404 });
  }
  if (phone && row.phone !== phone) {
    return NextResponse.json(
      { error: "That phone number does not match this reference." },
      { status: 403 },
    );
  }

  return NextResponse.json({
    reference: row.reference,
    status: row.status,
    date: row.date,
    guests: row.guests,
    category: row.category,
    createdAt: row.created_at,
  });
}
