import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/site/Reveal";
import { getSettings } from "@/lib/db";
import { SITE, mediaSrc, telLink, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story of Al Capone Nakuru — a late-night room in Nakuru for music, tables, VIP experiences and private celebrations.",
  alternates: { canonical: "/about" },
};

const NIGHT_STEPS = [
  {
    step: "Arrive",
    copy: "Doors open and the queue moves. Your booking reference or ticket QR is checked once at the door, then you are in — no waiting for a name to be found on a list.",
  },
  {
    step: "Settle",
    copy: "A reserved table, a booth or a spot on the floor. Bottle service and table packages are arranged before you arrive, so the first hour is spent on the night rather than on logistics.",
  },
  {
    step: "The sound",
    copy: "The room builds through the hours: afrobeat and amapiano early, hip hop and house as the floor fills, and the records that only work after midnight.",
  },
  {
    step: "The close",
    copy: "Last orders, one more round, and a way home. The team helps with transport so the end of the night is as easy as the beginning.",
  },
];

const FAQS = [
  {
    q: "Do I need to book to get in?",
    a: "Walk-ins are welcome when the room has space, but tables, booths and ticketed events are better booked ahead. A reservation enquiry costs nothing and the team replies with availability.",
  },
  {
    q: "How does payment work?",
    a: "Nothing is charged on this website. Tables and tickets are arranged with the club directly — the team confirms your booking, explains the total, and payment is completed through the club's own channel. Only ever pay the number published on this site.",
  },
  {
    q: "When do I get my tickets?",
    a: "Tickets and QR codes are issued once the club confirms your booking. They appear on your booking reference page, one code per seat, and each code scans once at the door.",
  },
  {
    q: "Is there a dress code?",
    a: "Events publish their own dress code where one applies. If you are unsure about a particular night, message the team before you travel and they will tell you straight.",
  },
  {
    q: "Can you host a birthday or a private event?",
    a: "Yes. Birthdays, group nights, company evenings and private celebrations are planned with the team in advance — seating, bottle service and timing agreed before the night. Send a reservation enquiry with the category set to Private Event or Birthday Celebration.",
  },
  {
    q: "What are your opening hours?",
    a: "Hours are published here once the club confirms them, and every event listing shows its own doors time. If a night is not listed, call or message before making the trip.",
  },
];

export default async function AboutPage() {
  const settings = await getSettings();
  const phone = settings.phone || SITE.defaultPhone;
  const whatsapp = settings.whatsapp || SITE.defaultWhatsapp;

  return (
    <>
      <section className="relative overflow-hidden border-b border-champagne/10">
        <div className="absolute inset-0">
          <img
            src={mediaSrc("about-1.jpg")}
            alt="Placeholder artwork — low-lit interior"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/60" />
        </div>
        <div className="shell relative py-20 md:py-32">
          <Reveal>
            <p className="eyebrow">About</p>
            <h1 className="display-xl mt-5 max-w-3xl text-champagne">
              Nakuru after
              <br />
              dark<span className="text-ember">.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-ash md:text-base">
              Al Capone is a nightlife room in Nakuru built around a simple idea: the night should be
              yours. The music, the seating, the service — arranged so you can settle in and stay.
            </p>
          </Reveal>
        </div>
      </section>

      {/* The story */}
      <section className="shell grid gap-12 py-20 md:py-28 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow">The story</p>
            <h2 className="display-lg mt-4 text-champagne">
              Named for an era,
              <br />
              <span className="text-ember">built for Nakuru</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <blockquote className="mt-8 border-l border-crimson pl-5">
              <p className="font-display text-2xl leading-tight tracking-wide text-champagne">
                &ldquo;Your night. Your rules.&rdquo;
              </p>
              <footer className="mt-3 text-[0.625rem] uppercase tracking-[0.24em] text-ash">
                The only house rule that matters
              </footer>
            </blockquote>
          </Reveal>
        </div>

        <Reveal delay={0.08}>
          <div className="space-y-5 text-sm leading-relaxed text-ash md:text-base">
            <p>
              There is a particular hour in Nakuru when the day lets go. The traffic thins out, the
              heat lifts, and the city starts deciding where the night will happen. Al Capone was
              built for that hour.
            </p>
            <p>
              The name is borrowed from an era rather than a man: the 1920s, back rooms, low light,
              music played loud enough to keep the street guessing. We kept the mood and left the
              mythology where it belongs. There is no founding legend printed on this page — this room
              is writing its story one Friday, one birthday, one full floor at a time.
            </p>
            <p>
              What we can tell you is how a night is put together. The door is quick: a booking
              reference or a ticket QR, checked once, no queue games. The floor is arranged so you can
              stand in the middle of it or sit above it. The bar keeps pace with the room, and the table
              you reserved is yours for the night rather than until the next walk-in.
            </p>
            <p>
              The sound moves with the hours — afrobeat and amapiano early, hip hop and house as the
              room fills, and the records that only work after midnight. Guest selectors are announced
              here as they are confirmed, never before.
            </p>
            <p>
              And the occasions matter as much as the music. Birthdays that take over a corner. Groups
              that need a table long enough for everyone. Private celebrations planned with the team in
              advance so nobody spends the night solving logistics. That is the whole idea: you bring
              the people, we handle the night.
            </p>
            <p className="border-l border-crimson pl-4 text-champagne/80">
              This page describes how the venue operates. Details such as opening hours, resident
              line-ups and floor specifics are published on this site once confirmed by the club.
            </p>
          </div>
        </Reveal>
      </section>

      {/* A night, start to finish */}
      <section className="border-y border-champagne/10 bg-ink-soft">
        <div className="shell py-20 md:py-24">
          <Reveal>
            <p className="eyebrow">A night, start to finish</p>
            <h2 className="display-lg mt-4 text-champagne">How the evening runs</h2>
          </Reveal>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {NIGHT_STEPS.map((item, i) => (
              <Reveal key={item.step} delay={i * 0.07}>
                <div className="border-t border-champagne/15 pt-5">
                  <span className="font-display text-3xl text-champagne/30">
                    0{i + 1}
                  </span>
                  <h3 className="mt-3 font-display text-xl tracking-wide text-champagne">
                    {item.step}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-ash">{item.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The room */}
      <section className="shell grid gap-12 py-20 md:py-28 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow">The room</p>
            <h2 className="display-lg mt-4 text-champagne">Built for the night</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-ash md:text-base">
              <p>
                Dark rooms, warm light and a floor that fills as the night goes on. Al Capone is laid
                out for movement and conversation: a bar that keeps pace, tables that belong to the
                evening, and a sound system that carries the room.
              </p>
              <p>
                We host the kind of nights that make a week worth it — long Fridays, big Saturdays,
                birthdays that take over a corner, and private celebrations planned properly in
                advance.
              </p>
              <p>
                Seating runs from a table for two to a full booth, with VIP space set apart from the
                floor for the nights that ask for it. Everything is arranged with the team beforehand,
                so the room already knows you are coming.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <div className="grid grid-cols-2 gap-3">
            <div className="aspect-[3/4] overflow-hidden border border-champagne/10">
              <img
                src={mediaSrc("gallery-4.jpg")}
                alt="Placeholder artwork — lounge seating"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-10 aspect-[3/4] overflow-hidden border border-champagne/10">
              <img
                src={mediaSrc("hero-3.jpg")}
                alt="Placeholder artwork — bar detail"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </Reveal>
      </section>

      {/* How we host */}
      <section className="border-y border-champagne/10 bg-ink-soft">
        <div className="shell py-20 md:py-24">
          <Reveal>
            <p className="eyebrow">How we host</p>
            <h2 className="display-lg mt-4 text-champagne">Four things we take seriously</h2>
          </Reveal>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                title: "The music",
                copy: "Afrobeat, amapiano, hip hop and house, carried by selectors who read the room.",
              },
              {
                n: "02",
                title: "The table",
                copy: "Reserved seating for the night, with bottle service arranged before you arrive.",
              },
              {
                n: "03",
                title: "The occasion",
                copy: "Birthdays, groups and private events hosted with a plan agreed in advance.",
              },
              {
                n: "04",
                title: "The door",
                copy: "Booking references and QR tickets keep entry quick and the room comfortable.",
              },
            ].map((item, i) => (
              <Reveal key={item.n} delay={i * 0.07}>
                <div className="border-t border-champagne/15 pt-5">
                  <span className="font-display text-3xl text-champagne/30">{item.n}</span>
                  <h3 className="mt-3 font-display text-xl tracking-wide text-champagne">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ash">{item.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="shell grid gap-10 py-20 md:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow">Questions</p>
            <h2 className="display-lg mt-4 text-champagne">
              Before
              <br />
              you come
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ash">
              The short answers. If yours is not here, a call or a WhatsApp message reaches the team
              directly.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.08}>
          <div className="divide-y divide-champagne/10 border-y border-champagne/10">
            {FAQS.map((item) => (
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
      </section>

      {/* Visit */}
      <section className="border-t border-champagne/10">
        <div className="shell grid gap-10 py-20 md:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow">Visit</p>
              <h2 className="display-lg mt-4 text-champagne">Find us in Nakuru</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <dl className="mt-8 grid gap-6 text-sm sm:grid-cols-2">
                <div>
                  <dt className="label mb-1">Address</dt>
                  <dd className="text-champagne">{settings.address || "Nakuru, Kenya"}</dd>
                </div>
                <div>
                  <dt className="label mb-1">Phone</dt>
                  <dd>
                    <a href={telLink(phone)} className="text-champagne hover:text-ember">
                      {phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="label mb-1">Hours</dt>
                  <dd className="text-ash">
                    {settings.opening_hours || "To be confirmed — call ahead before travelling."}
                  </dd>
                </div>
                <div>
                  <dt className="label mb-1">Tables</dt>
                  <dd className="text-ash">VIP tables, booths and group seating by reservation.</dd>
                </div>
              </dl>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/reservations" className="btn btn-solid">
                  Book a table
                </Link>
                <a
                  href={whatsappLink(whatsapp, "Hello Al Capone, I'd like to visit. Please share directions.")}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                >
                  Message us
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <div className="relative h-full min-h-[300px] overflow-hidden border border-champagne/10">
              <img
                src={mediaSrc("gallery-5.jpg")}
                alt="Placeholder artwork — bar top"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-display text-2xl text-champagne">Al Capone</p>
                <p className="mt-1 text-[0.625rem] uppercase tracking-[0.24em] text-ash">
                  {settings.address || "Nakuru, Kenya"} · {phone}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
