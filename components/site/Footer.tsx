import Link from "next/link";
import { NAV_ITEMS, SITE, telLink, whatsappLink } from "@/lib/site";

type Props = {
  settings: Record<string, string>;
};

export default function Footer({ settings }: Props) {
  const phone = settings.phone || SITE.defaultPhone;
  const whatsapp = settings.whatsapp || SITE.defaultWhatsapp;
  const address = settings.address || "Nakuru, Kenya";
  const hours = settings.opening_hours;
  const instagram = settings.instagram;
  const tiktok = settings.tiktok;
  const email = settings.email;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-champagne/10 bg-ink">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="font-display text-4xl tracking-[0.14em] text-champagne">
              AL CAPONE
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ash">
              {SITE.tagline} {SITE.city}&apos;s nightlife destination for events, tables and
              celebrations.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/tickets" className="btn btn-solid btn-sm">
                Buy Tickets
              </Link>
              <Link href="/reservations" className="btn btn-outline btn-sm">
                Book a Table
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-[0.625rem] font-semibold uppercase tracking-[0.28em] text-champagne">
              Explore
            </h3>
            <ul className="mt-5 space-y-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-ash transition-colors hover:text-champagne"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/tickets" className="text-sm text-ash transition-colors hover:text-champagne">
                  Tickets
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[0.625rem] font-semibold uppercase tracking-[0.28em] text-champagne">
              Visit
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-ash">
              <li>{address}</li>
              <li>
                <a href={telLink(phone)} className="transition-colors hover:text-champagne">
                  {phone}
                </a>
              </li>
              <li>{hours ? hours : "Opening hours to be confirmed"}</li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-champagne">
                  Directions &amp; enquiries
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[0.625rem] font-semibold uppercase tracking-[0.28em] text-champagne">
              Connect
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-ash">
              <li>
                <a
                  href={whatsappLink(whatsapp, "Hello Al Capone, I'd like to make an enquiry.")}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-champagne"
                >
                  WhatsApp
                </a>
              </li>
              {instagram ? (
                <li>
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-champagne"
                  >
                    Instagram
                  </a>
                </li>
              ) : (
                <li className="text-ash/60">Instagram — link to be added</li>
              )}
              {tiktok ? (
                <li>
                  <a
                    href={tiktok}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-champagne"
                  >
                    TikTok
                  </a>
                </li>
              ) : null}
              {email ? (
                <li>
                  <a href={`mailto:${email}`} className="transition-colors hover:text-champagne">
                    {email}
                  </a>
                </li>
              ) : (
                <li className="text-ash/60">Email — address to be added</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-champagne/10 pt-6 text-[0.6875rem] uppercase tracking-[0.18em] text-ash md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {SITE.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/contact" className="transition-colors hover:text-champagne">
              Contact
            </Link>
            <Link href="/admin" className="transition-colors hover:text-champagne">
              Staff login
            </Link>
          </div>
        </div>
        <p className="mt-4 text-[0.625rem] leading-relaxed tracking-wide text-ash/50">
          Preview build — photography and programme entries are editable placeholders until the
          venue&apos;s own media is uploaded.
        </p>
      </div>
    </footer>
  );
}
