import crypto from "node:crypto";
import QRCode from "qrcode";
import type { TransactionSql } from "postgres";
import { getEventById, getSql, getTicketTypes, toPlainRow } from "./db";
import type { BookingItemRow, BookingRow, TicketRow } from "./types";

/**
 * Ticketing domain logic.
 *
 * Payment is intentionally manual in this build: a booking is created as
 * `pending`, the club collects payment offline, and an admin confirms the
 * booking — only then are tickets and QR codes issued. There is no gateway,
 * no callback and no card/M-Pesa credential anywhere in the codebase.
 *
 * If online payment is added later, the natural insertion point is between
 * `createBooking()` and `confirmBooking()`: a payment record keyed by booking
 * reference, and confirmation driven by a verified server-side callback rather
 * than by the customer's browser.
 */

const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomToken(length: number) {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += REFERENCE_ALPHABET[bytes[i] % REFERENCE_ALPHABET.length];
  return out;
}

export class BookingError extends Error {}

export async function newBookingReference(): Promise<string> {
  const sql = await getSql();
  for (let attempt = 0; attempt < 12; attempt++) {
    const ref = `AC-${randomToken(6)}`;
    const exists = await sql`select 1 from bookings where reference = ${ref} limit 1`;
    if (!exists.length) return ref;
  }
  throw new BookingError("Could not allocate a booking reference. Please try again.");
}

export async function newReservationReference(): Promise<string> {
  const sql = await getSql();
  for (let attempt = 0; attempt < 12; attempt++) {
    const ref = `RS-${randomToken(6)}`;
    const exists = await sql`select 1 from reservations where reference = ${ref} limit 1`;
    if (!exists.length) return ref;
  }
  throw new BookingError("Could not allocate an enquiry reference. Please try again.");
}

/** Uses the given transaction when one is open so codes are visible inside it. */
async function newTicketCode(tx: TransactionSql): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = `ACT-${randomToken(8)}`;
    const exists = await tx`select 1 from tickets where code = ${code} limit 1`;
    if (!exists.length) return code;
  }
  throw new BookingError("Could not allocate a ticket code. Please try again.");
}

export type RequestedLine = { ticketTypeId: number; quantity: number };

export type CreateBookingInput = {
  eventId: number;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  lines: RequestedLine[];
};

/**
 * Validates a request and creates a pending booking.
 *
 * The ticket-type rows are locked (`select ... for update`) before stock is
 * counted, so two concurrent bookings for the last seats cannot both succeed.
 */
export async function createBooking(
  input: CreateBookingInput,
): Promise<{ booking: BookingRow; items: BookingItemRow[] }> {
  const sql = await getSql();
  const event = await getEventById(input.eventId);
  if (!event || !["published", "sold_out"].includes(event.status)) {
    throw new BookingError("That event is not open for bookings.");
  }

  const types = await getTicketTypes(event.id);
  const cleaned = input.lines
    .map((l) => ({ ticketTypeId: Number(l.ticketTypeId), quantity: Math.floor(Number(l.quantity)) }))
    .filter((l) => Number.isFinite(l.ticketTypeId) && Number.isFinite(l.quantity) && l.quantity > 0);

  if (!cleaned.length) throw new BookingError("Select at least one ticket to continue.");

  const merged = new Map<number, number>();
  for (const line of cleaned) merged.set(line.ticketTypeId, (merged.get(line.ticketTypeId) ?? 0) + line.quantity);

  for (const [ticketTypeId, quantity] of merged) {
    const type = types.find((t) => t.id === ticketTypeId);
    if (!type) throw new BookingError("One of the selected ticket categories is no longer available.");
    if (quantity > 12) throw new BookingError(`Maximum 12 tickets per category for ${type.name}.`);
  }

  const reference = await newBookingReference();
  const ids = Array.from(merged.keys());

  return sql.begin(async (tx): Promise<{ booking: BookingRow; items: BookingItemRow[] }> => {
    // Lock the categories for the rest of the transaction.
    const lockedRows = await tx`
      select id, name, price, capacity from ticket_types
      where event_id = ${event.id} and id = any(${ids}::int[])
      order by id
      for update
    `;
    const locked = lockedRows as unknown as Array<{
      id: number;
      name: string;
      price: number;
      capacity: number;
    }>;

    if (locked.length !== merged.size) {
      throw new BookingError("One of the selected ticket categories is no longer available.");
    }

    let total = 0;
    const resolved: Array<{ type: (typeof locked)[number]; quantity: number }> = [];

    for (const [ticketTypeId, quantity] of merged) {
      const type = locked.find((t) => t.id === ticketTypeId);
      if (!type) throw new BookingError("One of the selected ticket categories is no longer available.");

      if (type.capacity) {
        const takenRows = await tx`
          select count(*)::int as count from tickets t
          join bookings b on b.id = t.booking_id
          where t.ticket_type_id = ${type.id} and t.status <> 'void' and b.status <> 'cancelled'
        `;
        const remaining = Math.max(0, type.capacity - Number(takenRows[0].count));
        if (quantity > remaining) {
          throw new BookingError(
            remaining > 0
              ? `Only ${remaining} ${type.name} ticket${remaining === 1 ? "" : "s"} left.`
              : `${type.name} is sold out.`,
          );
        }
      }

      total += type.price * quantity;
      resolved.push({ type, quantity });
    }

    const bookingRows = await tx`
      insert into bookings (reference, event_id, name, email, phone, notes, total, status)
      values (
        ${reference}, ${event.id}, ${input.name.trim()}, ${input.email.trim().toLowerCase()},
        ${input.phone.trim()}, ${(input.notes ?? "").trim()}, ${total}, 'pending'
      )
      returning *
    `;
    const booking = toPlainRow<BookingRow>(bookingRows[0]);

    for (const line of resolved) {
      await tx`
        insert into booking_items (booking_id, ticket_type_id, label, unit_price, quantity)
        values (${booking.id}, ${line.type.id}, ${line.type.name}, ${line.type.price}, ${line.quantity})
      `;
    }

    const itemRows = await tx`select * from booking_items where booking_id = ${booking.id} order by id asc`;
    return { booking, items: itemRows.map((row) => toPlainRow<BookingItemRow>(row)) };
  });
}

/**
 * Confirms a pending booking and issues one ticket per seat.
 * Idempotent: calling it twice cannot create duplicate tickets.
 */
export async function confirmBooking(
  bookingId: number,
): Promise<{ booking: BookingRow; issued: number }> {
  const sql = await getSql();

  const result = await sql.begin(async (tx) => {
    const bookingRows = await tx`select * from bookings where id = ${bookingId} for update`;
    if (!bookingRows.length) throw new BookingError("Booking not found.");
    const booking = bookingRows[0] as unknown as BookingRow;
    if (booking.status === "cancelled") {
      throw new BookingError("A cancelled booking cannot be confirmed.");
    }

    const itemRows = await tx`select * from booking_items where booking_id = ${bookingId} order by id asc`;
    const items = itemRows as unknown as BookingItemRow[];
    if (!items.length) throw new BookingError("This booking has no items.");

    const existingRows = await tx`select count(*)::int as count from tickets where booking_id = ${bookingId}`;
    const existing = Number(existingRows[0].count);

    if (!existing) {
      // Pending requests do not hold stock, so re-check capacity before issuing.
      // Locking the categories keeps this check atomic for concurrent confirms.
      const typeIds = Array.from(new Set(items.map((item) => item.ticket_type_id)));
      const typeRows = await tx`
        select id, name, capacity from ticket_types
        where id = any(${typeIds}::int[])
        order by id
        for update
      `;
      const types = typeRows as unknown as Array<{ id: number; name: string; capacity: number }>;

      for (const item of items) {
        const type = types.find((t) => t.id === item.ticket_type_id);
        if (!type || !type.capacity) continue;
        const takenRows = await tx`
          select count(*)::int as count from tickets t
          join bookings b on b.id = t.booking_id
          where t.ticket_type_id = ${type.id}
            and t.status <> 'void'
            and b.status <> 'cancelled'
            and t.booking_id <> ${bookingId}
        `;
        const remaining = Math.max(0, type.capacity - Number(takenRows[0].count));
        if (item.quantity > remaining) {
          throw new BookingError(
            remaining > 0
              ? `Only ${remaining} ${type.name} ticket${remaining === 1 ? "" : "s"} left — this booking needs ${item.quantity}.`
              : `${type.name} is sold out — this booking needs ${item.quantity}.`,
          );
        }
      }

      for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
          const code = await newTicketCode(tx);
          await tx`
            insert into tickets (code, booking_id, event_id, ticket_type_id, holder_name, status)
            values (${code}, ${bookingId}, ${booking.event_id}, ${item.ticket_type_id}, ${booking.name}, 'valid')
          `;
        }
      }
    }

    const updatedRows = await tx`
      update bookings set status = 'confirmed', updated_at = now()
      where id = ${bookingId}
      returning *
    `;
    const issuedRows = await tx`select count(*)::int as count from tickets where booking_id = ${bookingId}`;

    return {
      booking: toPlainRow<BookingRow>(updatedRows[0]),
      issued: Number(issuedRows[0].count),
      eventId: booking.event_id,
    };
  });

  await refreshSoldCounts(result.eventId);
  return { booking: result.booking, issued: result.issued };
}

export async function cancelBooking(bookingId: number, reason = ""): Promise<void> {
  const sql = await getSql();
  const booking = (await sql`select event_id from bookings where id = ${bookingId} limit 1`) as unknown as Array<{
    event_id: number;
  }>;
  if (!booking.length) throw new BookingError("Booking not found.");

  await sql.begin(async (tx) => {
    await tx`update bookings set status = 'cancelled', updated_at = now() where id = ${bookingId}`;
    await tx`update tickets set status = 'void' where booking_id = ${bookingId} and status = 'valid'`;
  });

  await refreshSoldCounts(booking[0].event_id);
  void reason;
}

export async function reopenBooking(bookingId: number): Promise<void> {
  const sql = await getSql();
  const booking = (await sql`select event_id from bookings where id = ${bookingId} limit 1`) as unknown as Array<{
    event_id: number;
  }>;
  if (!booking.length) throw new BookingError("Booking not found.");

  await sql.begin(async (tx) => {
    await tx`update bookings set status = 'pending', updated_at = now() where id = ${bookingId}`;
    await tx`update tickets set status = 'void' where booking_id = ${bookingId} and status <> 'redeemed'`;
  });

  await refreshSoldCounts(booking[0].event_id);
}

/** Checks a ticket in at the door. A ticket can only be redeemed once. */
export async function redeemTicket(
  code: string,
): Promise<{ ok: true; ticket: TicketRow } | { ok: false; reason: string }> {
  const sql = await getSql();
  const normalized = code.trim().toUpperCase();

  // A conditional update makes check-in atomic: two scanners cannot both win.
  const updated = await sql`
    update tickets set status = 'redeemed', redeemed_at = now()
    where code = ${normalized} and status = 'valid'
    returning *
  `;
  if (updated.length) return { ok: true, ticket: toPlainRow<TicketRow>(updated[0]) };

  const rows = await sql`select * from tickets where code = ${normalized} limit 1`;
  if (!rows.length) return { ok: false, reason: "No ticket matches that code." };

  const ticket = toPlainRow<TicketRow>(rows[0]);
  if (ticket.status === "void") return { ok: false, reason: "This ticket was voided or cancelled." };
  return {
    ok: false,
    reason: `Already checked in${ticket.redeemed_at ? ` at ${ticket.redeemed_at}` : ""}.`,
  };
}

async function refreshSoldCounts(eventId: number): Promise<void> {
  const sql = await getSql();
  await sql`
    update ticket_types tt
    set sold = coalesce((
      select count(*) from tickets t
      join bookings b on b.id = t.booking_id
      where t.ticket_type_id = tt.id and t.status <> 'void' and b.status <> 'cancelled'
    ), 0)
    where tt.event_id = ${eventId}
  `;
}

export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 1,
    width: 512,
    color: { dark: "#101010", light: "#E7DCD0" },
    errorCorrectionLevel: "M",
  });
}
