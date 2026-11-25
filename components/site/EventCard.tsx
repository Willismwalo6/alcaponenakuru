import Link from "next/link";
import { dayNumber, formatTime, monthShort } from "@/lib/format";
import { formatKes } from "@/lib/format";
import { mediaSrc } from "@/lib/site";
import type { EventWithTickets } from "@/lib/types";

export default function EventCard({ event, index = 0 }: { event: EventWithTickets; index?: number }) {
  const prices = event.ticket_types.filter((t) => t.active).map((t) => t.price);
  const from = prices.length ? Math.min(...prices) : null;

  return (
    <article className="group relative flex flex-col border border-champagne/10 bg-ink-soft transition-colors hover:border-champagne/25">
      <Link href={`/events/${event.slug}`} className="relative block aspect-[4/5] overflow-hidden">
        <img
          src={mediaSrc(event.cover || "hero-2.jpg")}
          alt={`${event.title} at Al Capone Nakuru`}
          loading={index === 0 ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
        <div className="absolute left-0 top-0 flex items-stretch bg-ink/85 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center px-4 py-3">
            <span className="font-display text-3xl leading-none text-champagne">
              {dayNumber(event.starts_at)}
            </span>
            <span className="mt-1 text-[0.5625rem] font-semibold tracking-[0.2em] text-ash">
              {monthShort(event.starts_at)}
            </span>
          </div>
          <div className="w-px bg-champagne/15" />
          <div className="flex flex-col justify-center px-4 py-3">
            <span className="text-[0.5625rem] font-semibold uppercase tracking-[0.2em] text-ash">
              Doors
            </span>
            <span className="mt-1 font-display text-xl leading-none text-champagne">
              {formatTime(event.doors_at || event.starts_at)}
            </span>
          </div>
        </div>
        {event.is_placeholder ? (
          <span className="absolute right-3 top-3 border border-champagne/25 bg-ink/80 px-2 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-ash">
            Sample event
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h3 className="display-md text-champagne">
          <Link href={`/events/${event.slug}`} className="transition-colors hover:text-ember">
            {event.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ash">{event.tagline}</p>

        <div className="mt-6 flex items-center justify-between border-t border-champagne/10 pt-4">
          <div>
            <span className="block text-[0.5625rem] font-semibold uppercase tracking-[0.2em] text-ash">
              Tickets from
            </span>
            <span className="mt-1 block text-sm font-semibold text-champagne">
              {from === null ? "Coming soon" : formatKes(from)}
            </span>
          </div>
          <Link
            href={`/events/${event.slug}`}
            className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-champagne transition-colors group-hover:text-ember"
          >
            Details →
          </Link>
        </div>
      </div>
    </article>
  );
}
