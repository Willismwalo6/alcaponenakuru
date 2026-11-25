import type { Metadata } from "next";
import Link from "next/link";
import EventCard from "@/components/site/EventCard";
import Reveal from "@/components/site/Reveal";
import { getTicketTypes, listEvents } from "@/lib/db";
import { isPast } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import type { EventWithTickets } from "@/lib/types";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming nights at Al Capone Nakuru — events, ticket categories and table packages, updated by the venue.",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const published = await listEvents({ publishedOnly: true });
  const all = await Promise.all(
    published.map(
      async (event): Promise<EventWithTickets> => ({
        ...event,
        ticket_types: await getTicketTypes(event.id),
      }),
    ),
  );

  const upcoming = all.filter((e) => !isPast(e.starts_at));
  const past = all.filter((e) => isPast(e.starts_at));

  return (
    <>
      <section className="border-b border-champagne/10 bg-ink-soft">
        <div className="shell py-16 md:py-24">
          <Reveal>
            <p className="eyebrow">Programme</p>
            <h1 className="display-xl mt-4 text-champagne">Events</h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-ash md:text-base">
              Every night has its own shape. Browse what&apos;s coming up, choose your ticket
              category and send a booking request — the team confirms and takes payment directly.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="shell py-16 md:py-24">
        <div className="flex items-end justify-between gap-6">
          <h2 className="display-lg text-champagne">Upcoming</h2>
          <span className="text-[0.625rem] uppercase tracking-[0.2em] text-ash">
            {upcoming.length} {upcoming.length === 1 ? "night" : "nights"}
          </span>
        </div>

        {upcoming.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event, i) => (
              <Reveal key={event.id} delay={i * 0.06}>
                <EventCard event={event} index={i} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-10 border border-dashed border-champagne/20 p-10 text-center">
            <p className="font-display text-3xl text-champagne">No upcoming events published</p>
            <p className="mx-auto mt-3 max-w-md text-sm text-ash">
              New nights are added here as the programme is confirmed. Message the team to be told
              first.
            </p>
            <a
              href={whatsappLink("", "Hello Al Capone, please let me know about upcoming events.")}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline mt-6"
            >
              Ask on WhatsApp
            </a>
          </div>
        )}

        {all.some((e) => e.is_placeholder) ? (
          <p className="mt-6 text-[0.625rem] uppercase tracking-[0.2em] text-ash/60">
            Some listings are sample events for setup — manage them in the dashboard.
          </p>
        ) : null}

        {past.length ? (
          <div className="mt-20">
            <h2 className="display-md text-champagne/80">Past nights</h2>
            <ul className="mt-6 divide-y divide-champagne/10 border-y border-champagne/10">
              {past.map((event) => (
                <li key={event.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <Link
                      href={`/events/${event.slug}`}
                      className="font-display text-xl tracking-wide text-champagne/80 hover:text-champagne"
                    >
                      {event.title}
                    </Link>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ash">
                      {new Date(event.starts_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        timeZone: "Africa/Nairobi",
                      })}
                    </p>
                  </div>
                  <span className="tag">Closed</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </>
  );
}
