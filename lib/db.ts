import bcrypt from "bcryptjs";
import postgres, { type Sql } from "postgres";
import { assertProductionEnv } from "./env";
import type {
  Admin,
  BookingItemRow,
  BookingRow,
  BookingWithEvent,
  EventRow,
  EventWithTickets,
  MediaRow,
  ReservationRow,
  TicketRow,
  TicketTypeRow,
} from "./types";

assertProductionEnv();

/* ------------------------------------------------------------------ */
/* Connection                                                          */
/* ------------------------------------------------------------------ */

let ready: Promise<Sql> | null = null;

function createClient(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add the Supabase pooler connection string (transaction mode, port 6543) to the environment.",
    );
  }
  const local = /localhost|127\.0\.0\.1/.test(url) || /sslmode=disable/.test(url);
  return postgres(url, {
    // The Supabase transaction-mode pooler cannot use prepared statements.
    prepare: false,
    ssl: local ? false : "require",
    max: 3,
    idle_timeout: 20,
    connect_timeout: 15,
    onnotice: () => {},
  });
}

/**
 * Returns a shared Postgres client, creating it and seeding defaults once per
 * server process. Every query helper below goes through this, so callers never
 * deal with connection state.
 */
export function getSql(): Promise<Sql> {
  if (!ready) {
    ready = (async () => {
      const sql = createClient();
      await seed(sql);
      return sql;
    })().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

/* ------------------------------------------------------------------ */
/* Row shaping                                                         */
/* ------------------------------------------------------------------ */

const DATE_ONLY_KEYS = new Set(["date"]);

/**
 * Postgres returns timestamps as Date objects. The rest of the app works with
 * ISO strings (and YYYY-MM-DD for the reservation `date` column), so normalise
 * every row before it leaves this module.
 */
export function toPlainRow<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (value instanceof Date) {
      out[key] = DATE_ONLY_KEYS.has(key) ? value.toISOString().slice(0, 10) : value.toISOString();
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

function plainAll<T>(rows: readonly Record<string, unknown>[]): T[] {
  return rows.map((row) => toPlainRow<T>(row));
}

/* ------------------------------------------------------------------ */
/* Seeding (idempotent; runs once per server process)                  */
/* ------------------------------------------------------------------ */

const DEFAULT_SETTINGS: Record<string, string> = {
  site_tagline: "Nakuru's nightlife destination.",
  phone: "0115333111",
  whatsapp: "254115333111",
  email: "",
  address: "Nakuru, Kenya",
  instagram: "",
  tiktok: "",
  opening_hours: "",
  booking_notice:
    "Bookings are confirmed by the Al Capone team. Complete payment at the club or via the WhatsApp line — never send money to any other number.",
  hero_slides: "",
  hero_video: "",
  hero_poster: "",
};

async function seed(sql: Sql) {
  const entries = Object.entries(DEFAULT_SETTINGS);
  await sql`
    insert into settings (key, value)
    select k, v from unnest(${entries.map(([key]) => key)}::text[], ${entries.map(([, value]) => value)}::text[]) as t(k, v)
    on conflict (key) do nothing
  `;

  const admins = await sql`select id from admins limit 1`;
  if (admins.length) return;

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.warn(
      "[al-capone] ADMIN_PASSWORD is not set, so no admin account was created. Set it (and ADMIN_EMAIL) in the environment and restart, or add an admin row in Supabase.",
    );
    return;
  }

  const email = (process.env.ADMIN_EMAIL || "admin@alcaponenakuru.co.ke").toLowerCase();
  const name = process.env.ADMIN_NAME || "Al Capone Manager";
  await sql`
    insert into admins (email, name, password_hash, role)
    values (${email}, ${name}, ${bcrypt.hashSync(password, 10)}, 'owner')
    on conflict (email) do nothing
  `;
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export async function getSettings(): Promise<Record<string, string>> {
  const sql = await getSql();
  const rows = await sql`select key, value from settings`;
  const out: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) out[String(row.key)] = String(row.value ?? "");
  return out;
}

export async function getSetting(key: string): Promise<string> {
  const sql = await getSql();
  const rows = await sql`select value from settings where key = ${key} limit 1`;
  if (!rows.length) return DEFAULT_SETTINGS[key] ?? "";
  return String(rows[0].value ?? "");
}

export async function setSetting(key: string, value: string): Promise<void> {
  const sql = await getSql();
  await sql`
    insert into settings (key, value) values (${key}, ${value})
    on conflict (key) do update set value = excluded.value
  `;
}

/* ------------------------------------------------------------------ */
/* Admins                                                              */
/* ------------------------------------------------------------------ */

export async function getAdminByEmail(email: string): Promise<Admin | undefined> {
  const sql = await getSql();
  const rows = await sql`select * from admins where email = ${email.toLowerCase()} limit 1`;
  return rows.length ? toPlainRow<Admin>(rows[0]) : undefined;
}

export async function getAdminById(id: number): Promise<Admin | undefined> {
  const sql = await getSql();
  const rows = await sql`select * from admins where id = ${id} limit 1`;
  return rows.length ? toPlainRow<Admin>(rows[0]) : undefined;
}

export async function updateAdminPassword(id: number, hash: string): Promise<void> {
  const sql = await getSql();
  await sql`update admins set password_hash = ${hash} where id = ${id}`;
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

export async function listEvents(
  opts: { publishedOnly?: boolean; limit?: number } = {},
): Promise<EventRow[]> {
  const sql = await getSql();
  const limit = opts.limit && opts.limit > 0 ? Math.floor(opts.limit) : null;
  const rows = opts.publishedOnly
    ? await sql`select * from events where status in ('published','sold_out') order by starts_at asc limit ${limit}::int`
    : await sql`select * from events order by starts_at asc limit ${limit}::int`;
  return plainAll<EventRow>(rows);
}

export async function listUpcomingEvents(limit = 3): Promise<EventRow[]> {
  const sql = await getSql();
  const rows = await sql`
    select * from events
    where status in ('published','sold_out') and starts_at >= now()
    order by featured desc, starts_at asc
    limit ${Math.floor(limit)}
  `;
  return plainAll<EventRow>(rows);
}

export async function getEventBySlug(slug: string): Promise<EventWithTickets | undefined> {
  const sql = await getSql();
  const rows = await sql`select * from events where slug = ${slug} limit 1`;
  if (!rows.length) return undefined;
  const event = toPlainRow<EventRow>(rows[0]);
  return { ...event, ticket_types: await getTicketTypes(event.id) };
}

export async function getEventById(id: number): Promise<EventRow | undefined> {
  const sql = await getSql();
  const rows = await sql`select * from events where id = ${id} limit 1`;
  return rows.length ? toPlainRow<EventRow>(rows[0]) : undefined;
}

export async function getTicketTypes(eventId: number, activeOnly = true): Promise<TicketTypeRow[]> {
  const sql = await getSql();
  const rows = activeOnly
    ? await sql`select * from ticket_types where event_id = ${eventId} and active = true order by sort_order asc, id asc`
    : await sql`select * from ticket_types where event_id = ${eventId} order by sort_order asc, id asc`;
  return plainAll<TicketTypeRow>(rows);
}

/* ------------------------------------------------------------------ */
/* Reservations                                                        */
/* ------------------------------------------------------------------ */

export async function listReservations(status?: string): Promise<ReservationRow[]> {
  const sql = await getSql();
  const rows =
    status && status !== "all"
      ? await sql`select * from reservations where status = ${status} order by created_at desc`
      : await sql`select * from reservations order by created_at desc`;
  return plainAll<ReservationRow>(rows);
}

export async function getReservationByReference(reference: string): Promise<ReservationRow | undefined> {
  const sql = await getSql();
  const rows = await sql`select * from reservations where reference = ${reference.toUpperCase()} limit 1`;
  return rows.length ? toPlainRow<ReservationRow>(rows[0]) : undefined;
}

/* ------------------------------------------------------------------ */
/* Bookings and tickets                                                */
/* ------------------------------------------------------------------ */

const BOOKING_WITH_EVENT = `
  select b.*, e.title as event_title, e.slug as event_slug, e.starts_at as event_starts_at
  from bookings b join events e on e.id = b.event_id
`;

export async function listBookings(status?: string): Promise<BookingWithEvent[]> {
  const sql = await getSql();
  const rows =
    status && status !== "all"
      ? await sql`${sql.unsafe(BOOKING_WITH_EVENT)} where b.status = ${status} order by b.created_at desc`
      : await sql`${sql.unsafe(BOOKING_WITH_EVENT)} order by b.created_at desc`;
  return plainAll<BookingWithEvent>(rows);
}

export async function getBookingByReference(reference: string): Promise<BookingWithEvent | undefined> {
  const sql = await getSql();
  const rows = await sql`${sql.unsafe(BOOKING_WITH_EVENT)} where b.reference = ${reference.toUpperCase()} limit 1`;
  return rows.length ? toPlainRow<BookingWithEvent>(rows[0]) : undefined;
}

export async function getBookingById(id: number): Promise<BookingWithEvent | undefined> {
  const sql = await getSql();
  const rows = await sql`${sql.unsafe(BOOKING_WITH_EVENT)} where b.id = ${id} limit 1`;
  return rows.length ? toPlainRow<BookingWithEvent>(rows[0]) : undefined;
}

export async function getBookingItems(bookingId: number): Promise<BookingItemRow[]> {
  const sql = await getSql();
  const rows = await sql`select * from booking_items where booking_id = ${bookingId} order by id asc`;
  return plainAll<BookingItemRow>(rows);
}

export async function getTicketsForBooking(bookingId: number): Promise<TicketRow[]> {
  const sql = await getSql();
  const rows = await sql`select * from tickets where booking_id = ${bookingId} order by id asc`;
  return plainAll<TicketRow>(rows);
}

export async function getTicketByCode(code: string): Promise<TicketRow | undefined> {
  const sql = await getSql();
  const rows = await sql`select * from tickets where code = ${code.toUpperCase()} limit 1`;
  return rows.length ? toPlainRow<TicketRow>(rows[0]) : undefined;
}

/** Reference + the matching booking line for a single ticket's detail page. */
export async function getTicketBookingDetails(
  ticketTypeId: number,
  bookingId: number,
): Promise<{ reference: string; name: string; label: string | null; price: number | null } | undefined> {
  const sql = await getSql();
  const rows = await sql`
    select b.reference, b.name, i.label, i.unit_price as price
    from bookings b
    left join booking_items i on i.booking_id = b.id and i.ticket_type_id = ${ticketTypeId}
    where b.id = ${bookingId}
    limit 1
  `;
  return rows.length
    ? (rows[0] as unknown as { reference: string; name: string; label: string | null; price: number | null })
    : undefined;
}

export async function getBookingReferenceForTicket(bookingId: number): Promise<string | undefined> {
  const sql = await getSql();
  const rows = await sql`select reference from bookings where id = ${bookingId} limit 1`;
  return rows.length ? String(rows[0].reference) : undefined;
}

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

export async function listMedia(kind?: string): Promise<MediaRow[]> {
  const sql = await getSql();
  const rows = kind
    ? await sql`select * from media where kind = ${kind} order by created_at desc`
    : await sql`select * from media order by created_at desc`;
  return plainAll<MediaRow>(rows);
}

export async function getMediaById(id: number): Promise<MediaRow | undefined> {
  const sql = await getSql();
  const rows = await sql`select * from media where id = ${id} limit 1`;
  return rows.length ? toPlainRow<MediaRow>(rows[0]) : undefined;
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export async function dashboardStats(): Promise<{
  events: number;
  pendingBookings: number;
  confirmedBookings: number;
  ticketsIssued: number;
  newReservations: number;
  upcoming: number;
}> {
  const sql = await getSql();
  const rows = await sql`
    select
      (select count(*) from events where status in ('published','sold_out'))::int as events,
      (select count(*) from bookings where status = 'pending')::int as pending_bookings,
      (select count(*) from bookings where status = 'confirmed')::int as confirmed_bookings,
      (select count(*) from tickets where status = 'valid')::int as tickets_issued,
      (select count(*) from reservations where status = 'new')::int as new_reservations,
      (select count(*) from events where status in ('published','sold_out') and starts_at >= now())::int as upcoming
  `;
  const row = rows[0] as unknown as {
    events: number;
    pending_bookings: number;
    confirmed_bookings: number;
    tickets_issued: number;
    new_reservations: number;
    upcoming: number;
  };
  return {
    events: Number(row.events ?? 0),
    pendingBookings: Number(row.pending_bookings ?? 0),
    confirmedBookings: Number(row.confirmed_bookings ?? 0),
    ticketsIssued: Number(row.tickets_issued ?? 0),
    newReservations: Number(row.new_reservations ?? 0),
    upcoming: Number(row.upcoming ?? 0),
  };
}
