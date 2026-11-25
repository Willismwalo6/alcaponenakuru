import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "@/components/site/PrintButton";
import { qrDataUrl } from "@/lib/bookings";
import { getBookingByReference, getBookingItems, getSettings, getTicketsForBooking } from "@/lib/db";
import { formatDateLong, formatDateTime, formatKes, formatTime } from "@/lib/format";
import { BOOKING_STATUS_LABELS, bookingWhatsappMessage, siteUrl, telLink, whatsappLink } from "@/lib/site";

type Params = { params: Promise<{ reference: string }> };

export const metadata: Metadata = {
  title: "Your booking",
  robots: { index: false, follow: false },
};

export default async function BookingPage({ params }: Params) {
  const { reference } = await params;
  const booking = await getBookingByReference(reference);
  if (!booking) notFound();

  const settings = await getSettings();
  const items = await getBookingItems(booking.id);
  const tickets = await getTicketsForBooking(booking.id);
  const phone = settings.phone;
  const whatsapp = settings.whatsapp;

  const qrCodes = await Promise.all(
    tickets
      .filter((t) => t.status === "valid")
      .map(async (ticket) => ({
        ticket,
        qr: await qrDataUrl(`${siteUrl()}/tickets/${ticket.code}`),
      })),
  );

  const statusLabel = BOOKING_STATUS_LABELS[booking.status] ?? booking.status;
  const isConfirmed = booking.status === "confirmed" || booking.status === "checked_in";
  const message = bookingWhatsappMessage({
    reference: booking.reference,
    eventTitle: booking.event_title,
    total: booking.total,
    phone: booking.phone,
  });

  return (
    <>
      <section className="border-b border-champagne/10 bg-ink-soft print:bg-white">
        <div className="shell py-12 md:py-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/tickets"
              className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-ash hover:text-champagne print:hidden"
            >
              ← All events
            </Link>
            <span
              className={[
                "tag",
                isConfirmed ? "tag-live" : booking.status === "cancelled" ? "" : "border-champagne/40",
              ].join(" ")}
            >
              {statusLabel}
            </span>
          </div>

          <p className="eyebrow mt-8">Booking reference</p>
          <h1 className="display-xl mt-3 text-champagne print:text-ink">{booking.reference}</h1>
          <p className="mt-4 text-sm text-ash">
            {booking.event_title} · {formatDateLong(booking.event_starts_at)} ·{" "}
            {formatTime(booking.event_starts_at)}
          </p>
        </div>
      </section>

      <section className="shell grid gap-10 py-12 md:py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="display-md text-champagne">Your request</h2>
          <ul className="mt-6 divide-y divide-champagne/10 border-y border-champagne/10">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                <span className="text-ash">
                  {item.label} <span className="text-ash/60">× {item.quantity}</span>
                </span>
                <span className="text-champagne">{formatKes(item.unit_price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-ash">
              Total
            </span>
            <span className="font-display text-3xl leading-none text-champagne">
              {formatKes(booking.total)}
            </span>
          </div>

          <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="label mb-1">Name</dt>
              <dd className="text-champagne">{booking.name}</dd>
            </div>
            <div>
              <dt className="label mb-1">Phone</dt>
              <dd className="text-champagne">{booking.phone}</dd>
            </div>
            <div>
              <dt className="label mb-1">Email</dt>
              <dd className="break-all text-champagne">{booking.email}</dd>
            </div>
            <div>
              <dt className="label mb-1">Requested</dt>
              <dd className="text-champagne">{formatDateTime(booking.created_at)}</dd>
            </div>
            {booking.notes ? (
              <div className="sm:col-span-2">
                <dt className="label mb-1">Notes</dt>
                <dd className="whitespace-pre-line text-ash">{booking.notes}</dd>
              </div>
            ) : null}
          </dl>

          {booking.status === "cancelled" ? (
            <div className="mt-8 border border-crimson/40 bg-crimson/10 p-5">
              <p className="font-display text-xl text-champagne">This booking was cancelled</p>
              <p className="mt-2 text-sm text-ash">
                Contact the club if you think this is a mistake or you&apos;d like to book again.
              </p>
            </div>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          {isConfirmed ? (
            <div className="border border-champagne/20 bg-ink-soft p-6">
              <span className="tag tag-live">Confirmed</span>
              <h2 className="font-display text-2xl tracking-wide text-champagne mt-4">You&apos;re on the list</h2>
              <p className="mt-2 text-sm leading-relaxed text-ash">
                Show the QR code{tickets.length > 1 ? "s" : ""} below at the door. Each code scans once.
              </p>
              <div className="mt-5 flex gap-3">
                <PrintButton />
              </div>
            </div>
          ) : booking.status === "pending" ? (
            <div className="border border-champagne/20 bg-ink-soft p-6">
              <span className="tag border-champagne/40">Awaiting confirmation</span>
              <h2 className="font-display text-2xl tracking-wide text-champagne mt-4">
                Complete payment with the club
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ash">
                Your request is saved. Payment is arranged directly with Al Capone — this site takes no
                payment and issues no tickets until the club confirms.
              </p>
              <ol className="mt-5 space-y-3 text-sm text-ash">
                <li className="flex gap-3">
                  <span className="text-champagne">01</span>
                  Message or call the club with your reference.
                </li>
                <li className="flex gap-3">
                  <span className="text-champagne">02</span>
                  Pay the total of {formatKes(booking.total)} using the club&apos;s own payment channel.
                </li>
                <li className="flex gap-3">
                  <span className="text-champagne">03</span>
                  The team confirms your booking and your QR tickets appear on this page.
                </li>
              </ol>

              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={whatsappLink(whatsapp, message)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-solid w-full"
                >
                  Send booking on WhatsApp
                </a>
                <a href={telLink(phone)} className="btn btn-outline w-full">
                  Call {phone}
                </a>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-ash/70">
                Only ever pay through the club&apos;s official number {phone}. Never send money to any
                other number.
              </p>
            </div>
          ) : null}

          <div className="mt-6 border border-champagne/10 p-5 text-xs leading-relaxed text-ash print:hidden">
            <p className="text-[0.5625rem] uppercase tracking-[0.24em] text-champagne">Keep this page</p>
            <p className="mt-2">
              Bookmark or screenshot this reference. You can reopen it any time from{" "}
              <Link href="/bookings/lookup" className="text-champagne underline decoration-champagne/30">
                Find my booking
              </Link>
              .
            </p>
          </div>
        </aside>
      </section>

      {isConfirmed && qrCodes.length ? (
        <section className="border-t border-champagne/10 print:border-0">
          <div className="shell py-12 md:py-16">
            <div className="flex items-end justify-between gap-4">
              <h2 className="display-md text-champagne">Your tickets</h2>
              <span className="text-[0.625rem] uppercase tracking-[0.2em] text-ash">
                {qrCodes.length} {qrCodes.length === 1 ? "ticket" : "tickets"}
              </span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {qrCodes.map(({ ticket, qr }) => (
                <article
                  key={ticket.id}
                  className="flex flex-col border border-champagne/15 bg-ink-soft p-5 print:break-inside-avoid"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.5625rem] uppercase tracking-[0.24em] text-ash">Al Capone</p>
                      <p className="mt-1 font-display text-xl leading-none text-champagne">
                        {booking.event_title}
                      </p>
                    </div>
                    <span className="tag tag-live">Admit one</span>
                  </div>

                  <img
                    src={qr}
                    alt={`QR code for ticket ${ticket.code}`}
                    width={220}
                    height={220}
                    className="mx-auto my-5 h-44 w-44 bg-champagne p-1"
                  />

                  <p className="text-center font-mono text-sm tracking-[0.14em] text-champagne">
                    {ticket.code}
                  </p>
                  <p className="mt-1 text-center text-xs text-ash">{ticket.holder_name}</p>
                  <p className="mt-4 border-t border-champagne/10 pt-3 text-center text-[0.5625rem] uppercase tracking-[0.2em] text-ash">
                    {formatDateLong(booking.event_starts_at)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
