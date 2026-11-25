import Link from "next/link";
import { notFound } from "next/navigation";
import {
  cancelBookingAction,
  confirmBookingAction,
  reopenBookingAction,
} from "@/app/admin/actions";
import { Empty, Label, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { getBookingById, getBookingItems, getTicketsForBooking } from "@/lib/db";
import { formatDateTime, formatKes } from "@/lib/format";
import { BOOKING_STATUS_LABELS, displayPhone, whatsappLink } from "@/lib/site";

type Params = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    confirmed?: string;
    cancelled?: string;
    reopened?: string;
    error?: string;
  }>;
};

export default async function AdminBookingDetailPage({ params, searchParams }: Params) {
  const { id } = await params;
  const flags = await searchParams;

  const booking = await getBookingById(Number(id));
  if (!booking) notFound();

  const items = await getBookingItems(booking.id);
  const tickets = await getTicketsForBooking(booking.id);
  const isConfirmed = booking.status === "confirmed" || booking.status === "checked_in";

  return (
    <>
      <PageHeader
        title={booking.reference}
        subtitle={`${booking.name} · ${booking.event_title}`}
        action={{ href: `/bookings/${booking.reference}`, label: "Customer view" }}
      />

      <div className="mb-6">
        <Link href="/admin/bookings" className="text-[0.625rem] uppercase tracking-[0.18em] text-ash hover:text-champagne">
          ← All bookings
        </Link>
      </div>

      {flags.confirmed ? (
        <Notice tone="success">Booking confirmed — {tickets.length} ticket(s) issued with QR codes.</Notice>
      ) : null}
      {flags.cancelled ? <Notice tone="success">Booking cancelled and tickets voided.</Notice> : null}
      {flags.reopened ? <Notice tone="success">Booking reopened as pending; tickets voided.</Notice> : null}
      {flags.error ? (
        <Notice tone="error">
          {flags.error === "confirm" || flags.error === "cancel"
            ? "That action could not be completed. Check the booking status."
            : flags.error}
        </Notice>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-8">
          <section className="border border-champagne/10 bg-ink-soft p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Pill status={booking.status} label={BOOKING_STATUS_LABELS[booking.status]} />
                <span className="text-[0.6875rem] uppercase tracking-[0.16em] text-ash">
                  {tickets.length} ticket(s)
                </span>
              </div>
              <span className="text-[0.6875rem] text-ash">Received {formatDateTime(booking.created_at)}</span>
            </div>

            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <Label>Guest</Label>
                <p className="mt-1 text-champagne">{booking.name}</p>
              </div>
              <div>
                <Label>Phone</Label>
                <p className="mt-1 text-champagne">{displayPhone(booking.phone)}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="mt-1 break-all text-champagne">{booking.email}</p>
              </div>
              <div>
                <Label>Event date</Label>
                <p className="mt-1 text-champagne">{formatDateTime(booking.event_starts_at)}</p>
              </div>
              {booking.notes ? (
                <div className="sm:col-span-2">
                  <Label>Notes from guest</Label>
                  <p className="mt-1 whitespace-pre-line text-ash">{booking.notes}</p>
                </div>
              ) : null}
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={whatsappLink(
                  booking.phone,
                  `Hello ${booking.name}, this is Al Capone Nakuru about your booking ${booking.reference}.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm"
              >
                WhatsApp guest
              </a>
              <a href={`tel:${booking.phone}`} className="btn btn-outline btn-sm">
                Call
              </a>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-display text-2xl tracking-wide text-champagne">Items</h2>
            <ul className="divide-y divide-champagne/10 border border-champagne/10">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                  <span className="text-ash">
                    {item.label} <span className="text-ash/60">× {item.quantity}</span>
                  </span>
                  <span className="text-champagne">{formatKes(item.unit_price * item.quantity)}</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-4 bg-graphite/30 p-4 text-sm">
                <span className="text-[0.625rem] uppercase tracking-[0.18em] text-ash">Total</span>
                <span className="font-display text-2xl text-champagne">{formatKes(booking.total)}</span>
              </li>
            </ul>
            <p className="mt-3 text-[0.6875rem] leading-relaxed text-ash">
              Payment is collected offline by the club. Nothing is charged through this website.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-2xl tracking-wide text-champagne">Tickets</h2>
            {tickets.length ? (
              <ul className="divide-y divide-champagne/10 border border-champagne/10">
                {tickets.map((ticket) => (
                  <li key={ticket.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-mono text-xs tracking-[0.12em] text-champagne">{ticket.code}</p>
                      <p className="mt-1 text-[0.625rem] uppercase tracking-[0.16em] text-ash">
                        {ticket.holder_name} · issued {formatDateTime(ticket.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Pill status={ticket.status} />
                      {ticket.redeemed_at ? (
                        <span className="text-[0.625rem] text-ash">
                          {formatDateTime(ticket.redeemed_at)}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>Tickets are issued when the booking is confirmed.</Empty>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="border border-champagne/10 bg-ink-soft p-5">
            <h2 className="font-display text-xl tracking-wide text-champagne">Actions</h2>
            <p className="mt-2 text-xs leading-relaxed text-ash">
              Confirm only after the guest has paid the club. Confirming issues one QR ticket per seat
              and cannot create duplicates.
            </p>

            <div className="mt-5 space-y-3">
              {booking.status !== "confirmed" ? (
                <form action={confirmBookingAction}>
                  <input type="hidden" name="id" value={booking.id} />
                  <button type="submit" className="btn btn-solid w-full" disabled={booking.status === "cancelled"}>
                    Confirm booking &amp; issue tickets
                  </button>
                </form>
              ) : null}

              {isConfirmed ? (
                <form action={reopenBookingAction}>
                  <input type="hidden" name="id" value={booking.id} />
                  <button type="submit" className="btn btn-outline w-full">
                    Reopen as pending
                  </button>
                </form>
              ) : null}

              {booking.status !== "cancelled" ? (
                <form action={cancelBookingAction}>
                  <input type="hidden" name="id" value={booking.id} />
                  <button type="submit" className="btn btn-outline w-full border-crimson/40">
                    Cancel booking
                  </button>
                </form>
              ) : null}
            </div>
          </div>

          <div className="border border-champagne/10 p-5 text-xs leading-relaxed text-ash">
            <Label>Reference</Label>
            <p className="mt-2 font-mono text-sm tracking-[0.12em] text-champagne">{booking.reference}</p>
            <Label>Event</Label>
            <Link href={`/events/${booking.event_slug}`} className="mt-2 block text-champagne hover:text-ember">
              {booking.event_title}
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
