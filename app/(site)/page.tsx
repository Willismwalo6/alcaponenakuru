import Link from "next/link";
import type { Metadata } from "next";
import HeroSlider, { type Slide } from "@/components/site/HeroSlider";
import Reveal from "@/components/site/Reveal";
import EventCard from "@/components/site/EventCard";
import { getMediaById, getSettings, getTicketTypes, listMedia, listUpcomingEvents } from "@/lib/db";
import { SITE, mediaSrc, telLink, whatsappLink } from "@/lib/site";
import type { EventWithTickets, HeroSlide } from "@/lib/types";

export const metadata: Metadata = {
  title: `${SITE.legalName} — Your Night. Your Rules.`,
  description:
    "Al Capone is Nakuru's nightlife destination. Explore events, book tables and VIP experiences, and reserve your night out in Nakuru.",
  alternates: { canonical: "/" },
};

function parseSlides(raw: string): HeroSlide[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    if (Array.isArray(parsed)) return parsed.filter((s) => typeof s?.mediaId === "number");
  } catch {
    // fall through to defaults
  }
  return [];
}

export default async function HomePage() {
  const settings = await getSettings();
  const phone = settings.phone || SITE.defaultPhone;
  const whatsapp = settings.whatsapp || SITE.defaultWhatsapp;

  const configured = parseSlides(settings.hero_slides);
  const fallback: Slide[] = ["hero-1.jpg", "hero-2.jpg", "hero-3.jpg", "hero-4.jpg", "hero-5.jpg"].map(
    (file) => ({ src: mediaSrc(file), alt: "Placeholder artwork — nightlife atmosphere" }),
  );

  const configuredSlides = await Promise.all(
    configured.map(async (slide): Promise<Slide | null> => {
      const media = await getMediaById(slide.mediaId);
      if (!media) return null;
      return {
        src: mediaSrc(media.filename),
        alt: media.caption || `${SITE.legalName} atmosphere`,
        placeholder: true,
      };
    }),
  );
  const slides: Slide[] = configured.length
    ? configuredSlides.filter((slide): slide is Slide => Boolean(slide))
    : fallback;

  const upcomingEvents = await listUpcomingEvents(3);
  const upcoming = await Promise.all(
    upcomingEvents.map(
      async (event): Promise<EventWithTickets> => ({
        ...event,
        ticket_types: await getTicketTypes(event.id),
      }),
    ),
  );

  const gallery = (await listMedia("image")).slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-16 pt-32 md:pb-20">
        <HeroSlider
          slides={slides.length ? slides : fallback}
          video={settings.hero_video || undefined}
          poster={settings.hero_poster ? mediaSrc(settings.hero_poster) : undefined}
        />

        <div className="shell relative z-10">
          <Reveal>
            <p className="eyebrow">Nakuru · Nightlife</p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="display-xl mt-5 text-champagne">
              <span className="block">AL CAPONE</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-2 font-display text-[clamp(1.6rem,4.4vw,3.25rem)] leading-none tracking-[0.04em] text-champagne/90">
              YOUR NIGHT. <span className="text-ember">YOUR RULES.</span>
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ash md:text-base">
              {settings.site_tagline || SITE.tagline} Events, tables, VIP experiences and private
              celebrations — all under one roof in Nakuru.
            </p>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/events" className="btn btn-solid">
                Explore Events
              </Link>
              <Link href="/reservations" className="btn btn-outline">
                Book Your Table
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-champagne/10 pt-6 text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-ash">
              <span>Tables &amp; VIP</span>
              <span className="h-1 w-1 rounded-full bg-crimson" />
              <span>Live events</span>
              <span className="h-1 w-1 rounded-full bg-crimson" />
              <span>Private celebrations</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-champagne/10 bg-graphite/40 py-4">
        <div className="flex w-max animate-[marquee_38s_linear_infinite] items-center gap-8 whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, dupe) => (
            <div key={dupe} className="flex items-center gap-8" aria-hidden={dupe === 1}>
              {["Nakuru", "Late Nights", "VIP Tables", "Bottle Service", "Celebrations", "Live Sets"].map(
                (word) => (
                  <span key={word} className="flex items-center gap-8">
                    <span className="font-display text-xl tracking-[0.2em] text-champagne/60">
                      {word.toUpperCase()}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-crimson" />
                  </span>
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming events */}
      <section className="shell py-20 md:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="eyebrow">01 — Programme</p>
            <h2 className="display-lg mt-4 text-champagne">Upcoming nights</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href="/events"
              className="link-underline text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-champagne"
            >
              View all events
            </Link>
          </Reveal>
        </div>

        {upcoming.length ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event, i) => (
              <Reveal key={event.id} delay={i * 0.08}>
                <EventCard event={event} index={i} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-12 border border-dashed border-champagne/20 p-10 text-center">
            <p className="font-display text-3xl text-champagne">No events published yet</p>
            <p className="mx-auto mt-3 max-w-md text-sm text-ash">
              The programme for this season has not been announced. Follow us or message the team to
              hear about the next night first.
            </p>
            <a
              href={whatsappLink(whatsapp, "Hello Al Capone, please let me know about upcoming events.")}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline mt-6"
            >
              Ask on WhatsApp
            </a>
          </div>
        )}

        {upcoming.some((e) => e.is_placeholder) ? (
          <p className="mt-6 text-[0.625rem] uppercase tracking-[0.2em] text-ash/60">
            Sample programme shown while the site is being set up — replace in the dashboard.
          </p>
        ) : null}
      </section>

      {/* How booking works */}
      <section className="border-y border-champagne/10 bg-ink-soft">
        <div className="shell py-16 md:py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <Reveal>
              <p className="eyebrow">Booking</p>
              <h2 className="display-md mt-4 text-champagne">Three steps to the door</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <Link
                href="/tickets"
                className="link-underline text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-champagne"
              >
                See upcoming nights
              </Link>
            </Reveal>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Send the request",
                copy: "Pick your event, ticket categories and quantities, then leave your name and number. Tables and booths go through the reservations page instead.",
              },
              {
                step: "02",
                title: "The team confirms",
                copy: "The club checks availability and comes back to you with the total and payment instructions. Nothing is charged online, ever.",
              },
              {
                step: "03",
                title: "Collect your tickets",
                copy: "Once payment is settled with the club, your booking is confirmed and one QR ticket per seat appears on your reference page.",
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

          <p className="mt-8 max-w-2xl text-xs leading-relaxed text-ash/80">
            No payment is taken on this site. The club confirms every booking and arranges payment
            directly — and QR tickets are only issued after confirmation.
          </p>
        </div>
      </section>

      {/* Experience */}
      <section className="border-t border-champagne/10">
        <div className="shell grid gap-12 py-20 md:py-28 lg:grid-cols-2 lg:items-center lg:gap-20">
          <Reveal>
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={mediaSrc("about-1.jpg")}
                  alt="Placeholder artwork — interior"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-4 hidden border border-champagne/15 bg-ink px-6 py-5 sm:block">
                <p className="font-display text-4xl leading-none text-champagne">Nakuru</p>
                <p className="mt-2 text-[0.5625rem] uppercase tracking-[0.24em] text-ash">
                  Nightlife, done properly
                </p>
              </div>
              <span className="absolute left-4 top-4 tag bg-ink/70">Placeholder image</span>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="eyebrow">02 — The experience</p>
              <h2 className="display-lg mt-4 text-champagne">
                A room built for <span className="text-ember">the night</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-ash md:text-base">
                Al Capone brings Nakuru a late-night room with intention: considered lighting, a bar
                that keeps pace, and seating that belongs to the night rather than the afternoon.
                Come for the music, stay for the table service.
              </p>
            </Reveal>

            <div className="mt-9 grid gap-6 sm:grid-cols-3">
              {[
                { title: "Tables & VIP", copy: "Reserve seating for the night, from a table for two to a full booth." },
                { title: "Bottle service", copy: "Table packages arranged with the team in advance." },
                { title: "Celebrations", copy: "Birthdays, groups and private events hosted end to end." },
              ].map((item, i) => (
                <Reveal key={item.title} delay={0.12 + i * 0.06}>
                  <div className="border-t border-champagne/15 pt-4">
                    <h3 className="font-display text-xl tracking-wide text-champagne">{item.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-ash">{item.copy}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.24}>
              <Link href="/about" className="btn btn-outline mt-9">
                About Al Capone
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Story teaser */}
      <section className="shell grid gap-10 py-20 md:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow">The story</p>
          <h2 className="display-lg mt-4 text-champagne">
            Named for an era,
            <br />
            <span className="text-ember">built for Nakuru</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="space-y-4 text-sm leading-relaxed text-ash md:text-base">
            <p>
              There is a particular hour in Nakuru when the day lets go. The traffic thins out, the
              heat lifts, and the city starts deciding where the night will happen. Al Capone was
              built for that hour.
            </p>
            <p>
              The name is borrowed from an era rather than a man: the 1920s, back rooms, low light,
              music played loud enough to keep the street guessing. We kept the mood and left the
              mythology where it belongs — this room writes its story one night at a time.
            </p>
            <p>
              The rest is in how the evening runs: a door that moves, a table that is yours for the
              night, a bar that keeps pace, and a floor that builds from afrobeat and amapiano into
              hip hop and house.
            </p>
            <Link href="/about" className="btn btn-outline mt-2">
              Read the full story
            </Link>
          </div>
        </Reveal>
      </section>

      {/* VIP reservation preview */}
      <section className="relative overflow-hidden border-y border-champagne/10 bg-ink-soft">
        <div className="shell grid gap-0 lg:grid-cols-2">
          <div className="order-2 flex flex-col justify-center py-16 lg:order-1 lg:py-24 lg:pr-16">
            <Reveal>
              <p className="eyebrow">03 — Reservations</p>
              <h2 className="display-lg mt-4 text-champagne">
                Your table,
                <br />
                <span className="text-ember">your terms</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-ash md:text-base">
                Tell us the date, the size of your party and how you want the night to feel. The team
                will come back to you with availability and table options — no queue at the door, no
                guesswork.
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <ul className="mt-7 space-y-3 text-sm text-ash">
                {["VIP tables and booths", "Birthday and group hosting", "Private event enquiries"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="h-px w-6 bg-crimson" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </Reveal>
            <Reveal delay={0.22}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/reservations" className="btn btn-solid">
                  Reserve a table
                </Link>
                <a
                  href={whatsappLink(whatsapp, "Hello Al Capone, I'd like to reserve a table.")}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                >
                  WhatsApp
                </a>
              </div>
            </Reveal>
          </div>

          <div className="relative order-1 min-h-[320px] lg:order-2 lg:min-h-[560px]">
            <img
              src={mediaSrc("hero-4.jpg")}
              alt="Placeholder artwork — VIP table setting"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-soft via-ink-soft/20 to-transparent lg:from-ink-soft" />
            <span className="absolute bottom-4 right-4 tag bg-ink/70">Placeholder image</span>
          </div>
        </div>
      </section>

      {/* Featured photography */}
      <section className="shell py-20 md:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="eyebrow">04 — Inside</p>
            <h2 className="display-lg mt-4 text-champagne">The room, after dark</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href="/gallery"
              className="link-underline text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-champagne"
            >
              Open gallery
            </Link>
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {gallery.slice(0, 6).map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <Link
                href="/gallery"
                className={[
                  "group relative block overflow-hidden border border-champagne/10",
                  i === 0 ? "col-span-2 aspect-[16/10] md:col-span-1 md:aspect-square" : "aspect-square",
                ].join(" ")}
              >
                <img
                  src={mediaSrc(item.filename)}
                  alt={item.caption || "Al Capone Nakuru"}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-ink/20 transition-opacity group-hover:opacity-0" />
              </Link>
            </Reveal>
          ))}
        </div>
        <p className="mt-4 text-[0.625rem] uppercase tracking-[0.2em] text-ash/60">
          Placeholder imagery — upload the venue&apos;s own photos in the dashboard.
        </p>
      </section>

      {/* Sound */}
      <section className="border-y border-champagne/10 bg-graphite/30">
        <div className="shell grid gap-12 py-20 md:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <div className="aspect-square overflow-hidden border border-champagne/10">
              <img
                src={mediaSrc("gallery-2.jpg")}
                alt="Placeholder artwork — DJ booth"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <p className="eyebrow">05 — The sound</p>
              <h2 className="display-lg mt-4 text-champagne">Music until close</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-ash md:text-base">
                The line-up changes with the night: afrobeat, amapiano, hip hop and house, carried by
                resident selectors and guests. Guest DJ announcements are published here as they are
                confirmed.
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mt-8 border border-dashed border-champagne/20 p-5">
                <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.24em] text-ash">
                  Line-up announcements
                </p>
                <p className="mt-2 text-sm text-ash">
                  No guest DJs have been confirmed yet. Announced line-ups will be added here — nothing
                  on this page is a claim about a specific act.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.22}>
              <Link href="/events" className="btn btn-outline mt-7">
                See what&apos;s on
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Celebrations */}
      <section className="shell py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow">06 — Celebrations</p>
              <h2 className="display-lg mt-4 text-champagne">
                Birthdays, groups,
                <br />
                <span className="text-ember">private nights</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-ash md:text-base">
                Bring the whole table. We host birthdays, group nights out and private celebrations
                with reserved seating, bottle service and a plan agreed with the team before you
                arrive.
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/reservations" className="btn btn-solid">
                  Plan a celebration
                </Link>
                <a href={telLink(phone)} className="btn btn-outline">
                  Call {phone}
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-[3/4] overflow-hidden border border-champagne/10">
                <img
                  src={mediaSrc("gallery-6.jpg")}
                  alt="Placeholder artwork — celebration"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-8 aspect-[3/4] overflow-hidden border border-champagne/10">
                <img
                  src={mediaSrc("hero-5.jpg")}
                  alt="Placeholder artwork — champagne service"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Social */}
      <section className="border-t border-champagne/10">
        <div className="shell py-20 md:py-24">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <Reveal>
              <p className="eyebrow">07 — Social</p>
              <h2 className="display-lg mt-4 text-champagne">Follow the night</h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-ash">
                {settings.instagram
                  ? "Photos, recaps and announcements land on our social channels first."
                  : "Social links appear here once the venue's official accounts are added in the dashboard."}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-wrap gap-3">
                {settings.instagram ? (
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline"
                  >
                    Instagram
                  </a>
                ) : null}
                {settings.tiktok ? (
                  <a href={settings.tiktok} target="_blank" rel="noreferrer" className="btn btn-outline">
                    TikTok
                  </a>
                ) : null}
                <a
                  href={whatsappLink(whatsapp, "Hello Al Capone, I'd like to know more.")}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-solid"
                >
                  WhatsApp us
                </a>
              </div>
            </Reveal>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {["gallery-1.jpg", "gallery-3.jpg", "gallery-4.jpg", "gallery-5.jpg"].map((file, i) => (
              <Reveal key={file} delay={i * 0.05}>
                <div className="aspect-square overflow-hidden border border-champagne/10">
                  <img
                    src={mediaSrc(file)}
                    alt="Placeholder artwork — nightlife atmosphere"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="border-t border-champagne/10 bg-ink-soft">
        <div className="shell grid gap-10 py-20 md:py-24 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="eyebrow">08 — Find us</p>
              <h2 className="display-lg mt-4 text-champagne">Nakuru</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <dl className="mt-8 space-y-5 text-sm">
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
                    {settings.opening_hours || "Opening hours to be confirmed — call ahead."}
                  </dd>
                </div>
              </dl>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/contact" className="btn btn-outline">
                  Contact &amp; directions
                </Link>
                <a
                  href={whatsappLink(whatsapp, "Hello Al Capone, please share directions to the club.")}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-solid"
                >
                  Get directions
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <div className="relative h-full min-h-[320px] overflow-hidden border border-champagne/10">
              <img
                src={mediaSrc("gallery-3.jpg")}
                alt="Al Capone Nakuru"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-ink/50" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <p className="font-display text-3xl leading-none text-champagne">Al Capone</p>
                <p className="mt-2 text-[0.625rem] uppercase tracking-[0.24em] text-champagne/70">
                  {settings.address || "Nakuru, Kenya"}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
