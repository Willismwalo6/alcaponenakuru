import { NextResponse } from "next/server";
import { BookingError, createBooking, type RequestedLine } from "@/lib/bookings";
import { normalizeKenyanPhone } from "@/lib/site";
import { rateLimit, requestKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limit = rateLimit(requestKey(request, "booking-create"), 5, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many booking requests. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const eventId = Number(payload.eventId ?? 0);
  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const phoneRaw = String(payload.phone ?? "").trim();
  const notes = String(payload.notes ?? "").trim();
  const linesRaw = Array.isArray(payload.lines) ? payload.lines : [];

  if (!Number.isFinite(eventId) || eventId <= 0) {
    return NextResponse.json({ error: "Choose an event." }, { status: 400 });
  }
  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const phone = normalizeKenyanPhone(phoneRaw);
  if (!phone) {
    return NextResponse.json({ error: "Enter a valid Kenyan mobile number." }, { status: 400 });
  }
  if (notes.length > 1000) {
    return NextResponse.json({ error: "Please keep notes under 1000 characters." }, { status: 400 });
  }

  const lines: RequestedLine[] = linesRaw
    .map((line) => {
      const item = line as Record<string, unknown>;
      return {
        ticketTypeId: Number(item.ticketTypeId ?? 0),
        quantity: Number(item.quantity ?? 0),
      };
    })
    .filter((line) => line.ticketTypeId > 0 && line.quantity > 0);

  if (!lines.length) {
    return NextResponse.json({ error: "Select at least one ticket." }, { status: 400 });
  }

  try {
    const { booking, items } = await createBooking({
      eventId,
      name,
      email,
      phone,
      notes,
      lines,
    });

    return NextResponse.json(
      {
        reference: booking.reference,
        total: booking.total,
        status: booking.status,
        items: items.map((item) => ({
          label: item.label,
          quantity: item.quantity,
          unitPrice: item.unit_price,
        })),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Booking request failed", error);
    return NextResponse.json(
      { error: "Something went wrong saving your request. Please try again." },
      { status: 500 },
    );
  }
}
