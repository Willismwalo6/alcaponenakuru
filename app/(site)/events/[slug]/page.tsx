import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookingForm from "@/components/site/BookingForm";
import Reveal from "@/components/site/Reveal";
import EventCard from "@/components/site/EventCard";
import { getEventBySlug, getSettings, getTicketTypes, listUpcomingEvents } from "@/lib/db";
import { formatDateLong, formatKes, formatTime, isPast } from "@/lib/format";
import { mediaSrc, whatsappLink } from "@/lib/site";
import type { EventWithTickets } from "@/lib/types";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.tagline || `Tickets and tables for ${event.title} at Al Capone Nakuru.`,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      title: `${event.title} — Al Capone Nakuru`,
      description: event.tagline || `Tickets and tables for ${event.title}.`,
      images: [{ url: mediaSrc(event.cover || "hero-2.jpg") }],
    },
  };
}

export default async function EventDetailPage({ params }: Params) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event || !["published", "sold_out"].includes(event.status)) notFound();

  const settings = await getSettings();
  const activeTypes = event.ticket_types.filter((t) => t.active);
  const allSoldOut = activeTypes.length > 0 && activeTypes.every((t) => t.capacity > 0 && t.sold >= t.capacity);
  const past = isPast(event.starts_at);

  const relatedEvents = await listUpcomingEvents(4);
  const related = await Promise.all(
    relatedEvents
      .filter((e) => e.id !== event.id)
      .slice(0, 3)
      .map(
        async (e): Promise<EventWithTickets> => ({
          ...e,
          ticket_types: await getTicketTypes(e.id),
        }),
      ),
  );

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description || event.tagline,
    startDate: event.starts_at,
    ...(past ? {} : { eventStatus: "https://schema.org/EventScheduled" }),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "Al Capone Nakuru",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Nakuru",
        addressCountry: "KE",
      },
    },
    image: [mediaSrc(event.cover || "hero-2.jpg")],
    offers: activeTypes.map((t) => ({
      "@type": "Offer",
      name: t.name,
      price: t.price,
      priceCurrency: "KES",
      availability: t.capacity > 0 && t.sold >= t.capacity
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    })),
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-champagne/10">
        <div className="absolute inset-0">
          <img
            src={mediaSrc(event.cover || "hero-2.jpg")}
            alt={event.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/60" />
        </div>

        <div className="shell relative py-16 md:py-24">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/events"
              className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-ash hover:text-champagne"
            >
              ← All events
            </Link>
            {event.is_placeholder ? <span className="tag">Sample event</span> : null}
            {past ? <span className="tag">Past event</span> : null}
            {allSoldOut && !past ? <span className="tag tag-live">Sold out</span> : null}
          </div>

          <h1 className="display-xl mt-6 max-w-4xl text-champagne">{event.title}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ash md:text-base">{event.tagline}</p>

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-champagne/15 pt-6 text-sm">
            <div>
              <dt className="text-[0.5625rem] uppercase tracking-[0.24em] text-ash">Date</dt>
              <dd className="mt-1 text-champagne">{formatDateLong(event.starts_at)}</dd>
            </div>
            <div>
              <dt className="text-[0.5625rem] uppercase tracking-[0.24em] text-ash">Doors</dt>
              <dd className="mt-1 text-champagne">{formatTime(event.doors_at || event.starts_at)}</dd>
            </div>
            <div>
              <dt className="text-[0.5625rem] uppercase tracking-[0.24em] text-ash">Venue</dt>
              <dd className="mt-1 text-champagne">{event.venue}</dd>
            </div>
            {event.dress_code ? (
              <div>
                <dt className="text-[0.5625rem] uppercase tracking-[0.24em] text-ash">Dress code</dt>
                <dd className="mt-1 text-champagne">{event.dress_code}</dd>
              </div>
            ) : null}
            {event.age_limit ? (
              <div>
                <dt className="text-[0.5625rem] uppercase tracking-[0.24em] text-ash">Entry</dt>
                <dd className="mt-1 text-champagne">{event.age_limit}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </section>

      <section className="shell grid gap-14 py-16 md:py-20 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          <div className="prose-invert max-w-2xl">
            <h2 className="display-md text-champagne">The night</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ash md:text-base">
              {event.description || "Details for this event will be published soon."}
            </p>
          </div>

          {activeTypes.length ? (
            <div className="mt-10 surface p-6">
              <h3 className="font-display text-2xl tracking-wide text-champagne">Ticket categories</h3>
              <ul className="mt-4 divide-y divide-champagne/10">
                {activeTypes.map((t) => {
                  const remaining = t.capacity ? Math.max(0, t.capacity - t.sold) : null;
                  return (
                    <li key={t.id} className="flex items-start justify-between gap-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-champagne">{t.name}</p>
                        {t.description ? (
                          <p className="mt-1 text-xs leading-relaxed text-ash">{t.description}</p>
                        ) : null}
                        {remaining !== null && remaining === 0 ? (
                          <p className="mt-1 text-[0.625rem] uppercase tracking-[0.18em] text-ember">
                            Sold out
                          </p>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-sm text-champagne">{formatKes(t.price)}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-ash/70">
                Prices are set by the venue. A booking request is not a payment — the club confirms
                availability and collects payment directly.
              </p>
            </div>
          ) : null}
        </Reveal>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="surface p-6">
            <h2 className="font-display text-2xl tracking-wide text-champagne">Book your place</h2>
            <p className="mt-3 text-sm leading-relaxed text-ash">
              {past
                ? "This event has already taken place."
                : allSoldOut
                  ? "Tickets for this event are sold out. Message the team about table availability."
                  : "Send a booking request and choose your categories. The team will confirm with you and arrange payment."}
            </p>

            {!past && !allSoldOut ? (
              <Link href={`/events/${event.slug}/book`} className="btn btn-solid mt-6 w-full">
                Continue to booking
              </Link>
            ) : null}

            <a
              href={whatsappLink(
                settings.whatsapp,
                `Hello Al Capone, I'd like to ask about ${event.title}.`,
              )}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline mt-3 w-full"
            >
              Ask on WhatsApp
            </a>
            <Link href="/reservations" className="btn btn-outline mt-3 w-full">
              Reserve a table instead
            </Link>

            <div className="mt-6 border-t border-champagne/10 pt-5 text-xs leading-relaxed text-ash">
              <p className="text-[0.5625rem] uppercase tracking-[0.24em] text-champagne">
                Good to know
              </p>
              <ul className="mt-3 space-y-2">
                <li>Bring your confirmation reference or ticket QR to the door.</li>
                <li>Tickets are issued only after the club confirms your booking.</li>
                <li>Tables can be added to any booking — just ask.</li>
              </ul>
            </div>
          </div>
        </aside>
      </section>

      {related.length ? (
        <section className="border-t border-champagne/10">
          <div className="shell py-16">
            <h2 className="display-md text-champagne">More nights</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((e, i) => (
                <EventCard key={e.id} event={e} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
    </>
  );
}
