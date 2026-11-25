import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/site/Reveal";
import { getSettings } from "@/lib/db";
import { SITE, telLink, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Al Capone Nakuru — phone, WhatsApp, location and enquiries for tables, tickets and private events.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getSettings();
  const phone = settings.phone || SITE.defaultPhone;
  const whatsapp = settings.whatsapp || SITE.defaultWhatsapp;
  const address = settings.address || "Nakuru, Kenya";
  const mapsQuery = encodeURIComponent(`${address}`);

  return (
    <>
      <section className="border-b border-champagne/10 bg-ink-soft">
        <div className="shell py-16 md:py-24">
          <Reveal>
            <p className="eyebrow">Contact</p>
            <h1 className="display-xl mt-4 max-w-3xl text-champagne">
              Talk to us<span className="text-ember">.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-ash md:text-base">
              Tables, tickets, birthdays or a private buy-out — the fastest way to reach the team is a
              call or a WhatsApp message.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="shell grid gap-12 py-14 md:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <Reveal>
            <dl className="space-y-7 text-sm">
              <div>
                <dt className="label mb-1">Phone</dt>
                <dd>
                  <a href={telLink(phone)} className="font-display text-3xl tracking-wide text-champagne hover:text-ember">
                    {phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="label mb-1">WhatsApp</dt>
                <dd>
                  <a
                    href={whatsappLink(whatsapp, "Hello Al Capone, I have an enquiry.")}
                    target="_blank"
                    rel="noreferrer"
                    className="text-champagne hover:text-ember"
                  >
                    Message the club on WhatsApp
                  </a>
                </dd>
              </div>
              <div>
                <dt className="label mb-1">Address</dt>
                <dd className="text-champagne">{address}</dd>
              </div>
              <div>
                <dt className="label mb-1">Hours</dt>
                <dd className="text-ash">
                  {settings.opening_hours || "Opening hours to be confirmed — call ahead."}
                </dd>
              </div>
              {settings.email ? (
                <div>
                  <dt className="label mb-1">Email</dt>
                  <dd>
                    <a href={`mailto:${settings.email}`} className="break-all text-champagne hover:text-ember">
                      {settings.email}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappLink(whatsapp, "Hello Al Capone, please share directions to the club.")}
                target="_blank"
                rel="noreferrer"
                className="btn btn-solid"
              >
                Directions on WhatsApp
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
              >
                Open in Maps
              </a>
            </div>
          </Reveal>
        </div>

        <div className="space-y-6">
          <Reveal delay={0.08}>
            <div className="border border-champagne/10 p-6">
              <h2 className="font-display text-2xl tracking-wide text-champagne">What do you need?</h2>
              <div className="mt-5 grid gap-3">
                <Link
                  href="/reservations"
                  className="flex items-center justify-between border border-champagne/10 px-4 py-4 text-sm text-champagne transition-colors hover:border-champagne/40"
                >
                  <span>Table, VIP or celebration</span>
                  <span className="text-ash">→</span>
                </Link>
                <Link
                  href="/tickets"
                  className="flex items-center justify-between border border-champagne/10 px-4 py-4 text-sm text-champagne transition-colors hover:border-champagne/40"
                >
                  <span>Event tickets</span>
                  <span className="text-ash">→</span>
                </Link>
                <Link
                  href="/events"
                  className="flex items-center justify-between border border-champagne/10 px-4 py-4 text-sm text-champagne transition-colors hover:border-champagne/40"
                >
                  <span>What&apos;s on</span>
                  <span className="text-ash">→</span>
                </Link>
                <Link
                  href="/bookings/lookup"
                  className="flex items-center justify-between border border-champagne/10 px-4 py-4 text-sm text-champagne transition-colors hover:border-champagne/40"
                >
                  <span>Find my booking</span>
                  <span className="text-ash">→</span>
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="border border-champagne/10 p-6">
              <h2 className="font-display text-2xl tracking-wide text-champagne">Private events</h2>
              <p className="mt-3 text-sm leading-relaxed text-ash">
                Planning something bigger — a full celebration, a company night or a buy-out? Send a
                reservation enquiry with the category set to Private Event and the team will come back
                with options.
              </p>
              <Link href="/reservations" className="btn btn-outline btn-sm mt-5">
                Start an enquiry
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="border border-champagne/10 bg-graphite/30 p-6">
              <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.24em] text-ash">
                Before you travel
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ash">
                {SITE.legalName} publishes confirmed opening hours, line-ups and event details on this
                site. If something is not listed yet, call {phone} to check before making the trip.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-champagne/10">
        <div className="shell grid gap-10 py-16 md:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="eyebrow">FAQ</p>
              <h2 className="display-lg mt-4 text-champagne">
                Quick
                <br />
                answers
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-ash">
                The things people ask before a night out. Anything else, the phone is faster than a
                form.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.08}>
            <div className="divide-y divide-champagne/10 border-y border-champagne/10">
              {[
                {
                  q: "How do I book a table?",
                  a: "Use the reservations page and tell us the date, the size of your party and the kind of night you want. The team replies with availability and table options on the number you leave.",
                },
                {
                  q: "Can I pay online?",
                  a: "No card or mobile-money payment is taken on this website. Payment for tables and tickets is completed directly with the club after the team confirms your booking.",
                },
                {
                  q: "How do I get my event tickets?",
                  a: "Send a booking request from the event page. Once the club confirms and payment is settled, a QR ticket per seat appears on your booking reference page, ready to show at the door.",
                },
                {
                  q: "I lost my reference — what now?",
                  a: "Open Find my booking and enter the reference with the phone number you used. If that does not work, message the club with your name and the event date and the team will trace it.",
                },
                {
                  q: "Do you host private events?",
                  a: "Yes — birthdays, group nights, company evenings and private celebrations. Send an enquiry with the category set to Private Event and the team will plan it with you in advance.",
                },
                {
                  q: "What time should I arrive?",
                  a: "Each event lists its own doors time. If nothing is listed for the night you have in mind, call ahead before travelling — opening hours are published once the club confirms them.",
                },
              ].map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-sm font-semibold text-champagne marker:content-none">
                    {item.q}
                    <span className="shrink-0 font-display text-xl leading-none text-ash transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ash">{item.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
