import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookingForm from "@/components/site/BookingForm";
import { getEventBySlug, getSettings } from "@/lib/db";
import { formatDateLong, formatTime } from "@/lib/format";
import { mediaSrc } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return {
    title: event ? `Book tickets — ${event.title}` : "Book tickets",
    robots: { index: false, follow: true },
  };
}

export default async function BookEventPage({ params }: Params) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event || !["published", "sold_out"].includes(event.status)) notFound();

  const settings = await getSettings();
  const activeTypes = event.ticket_types.filter((t) => t.active);

  return (
    <>
      <section className="border-b border-champagne/10 bg-ink-soft">
        <div className="shell py-12 md:py-16">
          <Link
            href={`/events/${event.slug}`}
            className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-ash hover:text-champagne"
          >
            ← Back to event
          </Link>

          <div className="mt-6 grid gap-6 md:grid-cols-[160px_1fr] md:items-center">
            <div className="aspect-[4/3] overflow-hidden border border-champagne/10 md:aspect-square">
              <img
                src={mediaSrc(event.cover || "hero-2.jpg")}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="eyebrow">Booking request</p>
              <h1 className="display-lg mt-3 text-champagne">{event.title}</h1>
              <p className="mt-3 text-sm text-ash">
                {formatDateLong(event.starts_at)} · Doors {formatTime(event.doors_at || event.starts_at)} ·{" "}
                {event.venue}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-12 md:py-16">
        {activeTypes.length ? (
          <BookingForm
            event={{ id: event.id, title: event.title, slug: event.slug }}
            ticketTypes={activeTypes}
            notice={settings.booking_notice}
          />
        ) : (
          <div className="border border-dashed border-champagne/20 p-10 text-center">
            <p className="font-display text-3xl text-champagne">Booking not open</p>
            <p className="mx-auto mt-3 max-w-md text-sm text-ash">
              Ticket categories for this event have not been published. Message the team and they will
              help you directly.
            </p>
            <Link href="/reservations" className="btn btn-outline mt-6">
              Reserve a table
            </Link>
          </div>
        )}

        <div className="mt-12 grid gap-6 border-t border-champagne/10 pt-8 text-xs leading-relaxed text-ash md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Send your request",
              copy: "Pick categories and quantities, add your contact details and submit. Nothing is charged online.",
            },
            {
              step: "02",
              title: "The team confirms",
              copy: "Al Capone checks availability and contacts you with payment instructions and the final total.",
            },
            {
              step: "03",
              title: "Receive your tickets",
              copy: "Once payment is completed with the club, your booking is confirmed and QR tickets appear on your reference page.",
            },
          ].map((item) => (
            <div key={item.step}>
              <p className="font-display text-2xl text-champagne/40">{item.step}</p>
              <h2 className="mt-2 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-champagne">
                {item.title}
              </h2>
              <p className="mt-2 text-ash">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
