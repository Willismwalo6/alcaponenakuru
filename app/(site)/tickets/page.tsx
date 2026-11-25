import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/site/Reveal";
import { getSettings, getTicketTypes, listUpcomingEvents } from "@/lib/db";
import { dayNumber, formatKes, formatTime, monthShort } from "@/lib/format";
import { mediaSrc, whatsappLink } from "@/lib/site";
import type { EventWithTickets } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tickets",
  description:
    "Book tickets for Al Capone Nakuru. Choose your event, categories and quantities, then complete payment directly with the club.",
  alternates: { canonical: "/tickets" },
};

export default async function TicketsPage() {
  const settings = await getSettings();
  const upcoming = await listUpcomingEvents(8);
  const events = await Promise.all(
    upcoming.map(
      async (event): Promise<EventWithTickets> => ({
        ...event,
        ticket_types: await getTicketTypes(event.id),
      }),
    ),
  );

  return (
    <>
      <section className="border-b border-champagne/10 bg-ink-soft">
        <div className="shell py-16 md:py-24">
          <Reveal>
            <p className="eyebrow">Tickets</p>
            <h1 className="display-xl mt-4 max-w-3xl text-champagne">
              Book the night<span className="text-ember">.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-ash md:text-base">
              Requests are confirmed by the Al Capone team. Choose your event and categories, submit
              your details, and the club will arrange payment with you — no card details or online
              payment are taken on this site.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="shell py-16 md:py-20">
        <h2 className="display-md text-champagne">Choose an event</h2>

        {events.length ? (
          <ul className="mt-8 divide-y divide-champagne/10 border-y border-champagne/10">
            {events.map((event) => {
              const active = event.ticket_types.filter((t) => t.active);
              const prices = active.map((t) => t.price);
              const from = prices.length ? Math.min(...prices) : null;
              const soldOut = active.length > 0 && active.every((t) => t.capacity > 0 && t.sold >= t.capacity);

              return (
                <li key={event.id} className="flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:gap-8">
                  <div className="flex shrink-0 items-center gap-4">
                    <div className="flex h-16 w-16 flex-col items-center justify-center border border-champagne/15">
                      <span className="font-display text-2xl leading-none text-champagne">
                        {dayNumber(event.starts_at)}
                      </span>
                      <span className="mt-1 text-[0.5rem] font-semibold tracking-[0.18em] text-ash">
                        {monthShort(event.starts_at)}
                      </span>
                    </div>
                    <div className="h-16 w-16 overflow-hidden border border-champagne/10 sm:hidden">
                      <img
                        src={mediaSrc(event.cover || "hero-2.jpg")}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-2xl tracking-wide text-champagne">
                      <Link href={`/events/${event.slug}`} className="hover:text-ember">
                        {event.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ash">
                      Doors {formatTime(event.doors_at || event.starts_at)} · {active.length} categories
                      {from !== null ? ` · from ${formatKes(from)}` : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    {soldOut ? <span className="tag tag-live">Sold out</span> : null}
                    <Link
                      href={`/events/${event.slug}/book`}
                      className={soldOut ? "btn btn-outline btn-sm" : "btn btn-solid btn-sm"}
                    >
                      {soldOut ? "View event" : "Book tickets"}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-8 border border-dashed border-champagne/20 p-10 text-center">
            <p className="font-display text-3xl text-champagne">No events on sale</p>
            <p className="mx-auto mt-3 max-w-md text-sm text-ash">
              Tickets go on sale as each night is confirmed. Message the team to hear first.
            </p>
            <a
              href={whatsappLink(settings.whatsapp, "Hello Al Capone, please tell me when tickets go on sale.")}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline mt-6"
            >
              Ask on WhatsApp
            </a>
          </div>
        )}

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { title: "Booking request", copy: "Submit categories and quantities. No payment is taken online and nothing is charged automatically." },
            { title: "Club confirmation", copy: "The team confirms availability and gives you payment instructions for the club's own channels." },
            { title: "QR tickets", copy: "After payment is completed with the club, your tickets and QR codes are issued against your reference." },
          ].map((item) => (
            <div key={item.title} className="surface p-6">
              <h3 className="font-display text-xl tracking-wide text-champagne">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ash">{item.copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border border-champagne/10 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-2xl tracking-wide text-champagne">Already booked?</p>
            <p className="mt-1 text-sm text-ash">Open your reference page to see status and QR tickets.</p>
          </div>
          <Link href="/bookings/lookup" className="btn btn-outline">
            Find my booking
          </Link>
        </div>
      </section>
    </>
  );
}
