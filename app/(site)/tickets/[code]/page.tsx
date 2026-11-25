import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById, getTicketBookingDetails, getTicketByCode } from "@/lib/db";
import { formatDateTime, formatKes } from "@/lib/format";

type Params = { params: Promise<{ code: string }> };

export const metadata: Metadata = {
  title: "Ticket",
  robots: { index: false, follow: false },
};

export default async function TicketPage({ params }: Params) {
  const { code } = await params;
  const ticket = await getTicketByCode(code);
  if (!ticket) notFound();

  const event = await getEventById(ticket.event_id);
  const booking = await getTicketBookingDetails(ticket.ticket_type_id, ticket.booking_id);

  const valid = ticket.status === "valid";

  return (
    <section className="shell max-w-2xl py-16 md:py-24">
      <p className="eyebrow">Ticket</p>
      <h1 className="display-lg mt-4 text-champagne">
        {valid ? "Valid ticket" : ticket.status === "redeemed" ? "Already checked in" : "Void ticket"}
      </h1>

      <div className="mt-8 border border-champagne/20 bg-ink-soft p-6">
        <div className="flex items-center justify-between gap-4">
          <span className={valid ? "tag tag-live" : "tag"}>
            {valid ? "Valid" : ticket.status === "redeemed" ? "Checked in" : "Void"}
          </span>
          <span className="font-mono text-xs tracking-[0.14em] text-ash">{ticket.code}</span>
        </div>

        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="label mb-1">Event</dt>
            <dd className="text-champagne">{event?.title ?? "—"}</dd>
          </div>
          <div>
            <dt className="label mb-1">Holder</dt>
            <dd className="text-champagne">{ticket.holder_name}</dd>
          </div>
          <div>
            <dt className="label mb-1">Category</dt>
            <dd className="text-champagne">
              {booking?.label ?? "—"}
              {booking?.price ? ` · ${formatKes(booking.price)}` : ""}
            </dd>
          </div>
          <div>
            <dt className="label mb-1">Venue</dt>
            <dd className="text-champagne">{event?.venue ?? "Al Capone, Nakuru"}</dd>
          </div>
          <div>
            <dt className="label mb-1">Issued</dt>
            <dd className="text-champagne">{formatDateTime(ticket.created_at)}</dd>
          </div>
          <div>
            <dt className="label mb-1">Checked in</dt>
            <dd className="text-champagne">
              {ticket.redeemed_at ? formatDateTime(ticket.redeemed_at) : "Not yet"}
            </dd>
          </div>
          <div>
            <dt className="label mb-1">Booking reference</dt>
            <dd className="text-champagne">{booking?.reference ?? "—"}</dd>
          </div>
        </dl>

        {!valid ? (
          <p className="mt-6 border border-crimson/40 bg-crimson/10 px-4 py-3 text-xs text-champagne">
            {ticket.status === "redeemed"
              ? "This ticket has already been checked in and cannot be used again."
              : "This ticket was voided. Contact the club if you believe this is an error."}
          </p>
        ) : null}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ash">
        Door staff verify and check in tickets from the staff dashboard. Ticket payment is settled
        directly with the club — no payment is processed on this website.
      </p>

      <Link href="/tickets" className="btn btn-outline btn-sm mt-8">
        Back to tickets
      </Link>
    </section>
  );
}
