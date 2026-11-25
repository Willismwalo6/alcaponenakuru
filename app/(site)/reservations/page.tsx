import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/site/Reveal";
import ReservationForm from "@/components/site/ReservationForm";
import ReservationStatusLookup from "@/components/site/ReservationStatusLookup";
import { getSettings } from "@/lib/db";
import { RESERVATION_CATEGORIES, SITE, telLink, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Reservations",
  description:
    "Request a table at Al Capone Nakuru — VIP tables, birthdays, group bookings and private events. The team confirms every reservation directly.",
  alternates: { canonical: "/reservations" },
};

export default async function ReservationsPage() {
  const settings = await getSettings();
  const phone = settings.phone || SITE.defaultPhone;
  const whatsapp = settings.whatsapp || SITE.defaultWhatsapp;

  return (
    <>
      <section className="border-b border-champagne/10 bg-ink-soft">
        <div className="shell py-16 md:py-24">
          <Reveal>
            <p className="eyebrow">Reservations</p>
            <h1 className="display-xl mt-4 max-w-3xl text-champagne">
              Reserve the night<span className="text-ember">.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-ash md:text-base">
              Tables, booths, birthdays and private events. Send your details and the Al Capone team
              will confirm availability with you directly — every enquiry gets a reference and a
              human reply.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="shell grid gap-12 py-14 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <ReservationForm whatsapp={whatsapp} />

        <aside className="space-y-8">
          <div className="border border-champagne/10 p-6">
            <h3 className="font-display text-2xl tracking-wide text-champagne">What we host</h3>
            <ul className="mt-4 space-y-3 text-sm text-ash">
              {RESERVATION_CATEGORIES.map((category) => (
                <li key={category} className="flex items-center gap-3">
                  <span className="h-px w-5 bg-crimson" />
                  {category}
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-champagne/10 pt-5">
              <p className="text-xs leading-relaxed text-ash">
                Prefer to talk it through? Call{" "}
                <a href={telLink(phone)} className="text-champagne hover:text-ember">
                  {phone}
                </a>{" "}
                or send a WhatsApp message with your date and guest count.
              </p>
              <a
                href={whatsappLink(
                  whatsapp,
                  "Hello Al Capone, I'd like to reserve a table. Date: ___, Guests: ___",
                )}
                target="_blank"
                rel="noreferrer"
                className="btn btn-solid btn-sm mt-4"
              >
                WhatsApp reservations
              </a>
            </div>
          </div>

          <div className="border border-champagne/10 p-6">
            <h3 className="font-display text-2xl tracking-wide text-champagne">Good to know</h3>
            <ul className="mt-4 space-y-3 text-xs leading-relaxed text-ash">
              <li>
                An enquiry is not a confirmed table. We confirm availability with you on the number
                you provide.
              </li>
              <li>
                Table minimums, deposits and package pricing are explained by the team before anything
                is agreed.
              </li>
              <li>
                For birthdays and private events, send the details early — the best spots go first.
              </li>
              <li>Entry is 18+ unless an event states otherwise.</li>
            </ul>
          </div>

          <ReservationStatusLookup />

          <div className="border border-champagne/10 p-6">
            <h3 className="font-display text-2xl tracking-wide text-champagne">Buying tickets?</h3>
            <p className="mt-2 text-xs leading-relaxed text-ash">
              Event tickets are booked separately, with their own categories and confirmation flow.
            </p>
            <Link href="/tickets" className="btn btn-outline btn-sm mt-4">
              Go to tickets
            </Link>
          </div>
        </aside>
      </section>

      <section className="border-t border-champagne/10 bg-ink-soft">
        <div className="shell py-16 md:py-20">
          <Reveal>
            <p className="eyebrow">After you send</p>
            <h2 className="display-md mt-4 text-champagne">What happens next</h2>
          </Reveal>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "You get a reference",
                copy: "Every enquiry is saved with an RS- reference, so there is a record of what you asked for and when.",
              },
              {
                step: "02",
                title: "The team replies",
                copy: "Availability, table options and any minimum spend are explained on the phone number you provide. Nothing is agreed until you say yes.",
              },
              {
                step: "03",
                title: "The table is held",
                copy: "Once confirmed, your name is on the door for that date, with the seating and any bottle service arranged in advance.",
              },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 0.07}>
                <div className="border-t border-champagne/15 pt-5">
                  <span className="font-display text-3xl text-champagne/30">{item.step}</span>
                  <h3 className="mt-3 font-display text-xl tracking-wide text-champagne">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ash">{item.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
