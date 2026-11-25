"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, SITE, telLink, whatsappLink } from "@/lib/site";

type Props = {
  phone: string;
  whatsapp: string;
};

export default function Header({ phone, whatsapp }: Props) {
  const pathname = usePathname();
  const overHero = pathname === "/";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={[
        "z-40 w-full",
        overHero ? "absolute inset-x-0 top-0" : "relative",
      ].join(" ")}
    >
      <div className="shell flex items-center justify-between gap-4 py-5 md:py-6">
        <Link href="/" aria-label={`${SITE.name} home`} className="group shrink-0">
          <span className="block font-display text-[1.6rem] leading-none tracking-[0.16em] text-champagne md:text-[2.1rem]">
            AL CAPONE
          </span>
          <span className="mt-1 block text-[0.5rem] font-semibold uppercase tracking-[0.42em] text-ash transition-colors group-hover:text-champagne md:text-[0.5625rem]">
            Nakuru
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "relative text-[0.6875rem] font-semibold uppercase tracking-[0.22em] transition-colors",
                    isActive(item.href) ? "text-champagne" : "text-ash hover:text-champagne",
                  ].join(" ")}
                >
                  {item.label}
                  <span
                    className={[
                      "absolute -bottom-2 left-0 h-px w-full origin-left bg-crimson transition-transform duration-300",
                      isActive(item.href) ? "scale-x-100" : "scale-x-0",
                    ].join(" ")}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href={telLink(phone)}
            className="hidden text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-ash transition-colors hover:text-champagne xl:inline"
          >
            {phone}
          </a>
          <Link
            href="/tickets"
            className={[
              "btn btn-sm",
              isActive("/tickets") ? "btn-solid" : "btn-outline",
            ].join(" ")}
          >
            Tickets
          </Link>
        </div>
      </div>

      <div className="shell">
        <div className="h-px w-full bg-champagne/10" />
      </div>

      {/* Mobile / tablet: the same links, kept visible in a transparent, swipeable bar. */}
      <div className="lg:hidden">
        <div className="shell no-scrollbar overflow-x-auto">
          <ul className="flex min-w-max items-center gap-6 py-3.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "text-[0.625rem] font-semibold uppercase tracking-[0.2em] transition-colors",
                    isActive(item.href) ? "text-champagne" : "text-ash hover:text-champagne",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={whatsappLink(whatsapp, "Hello Al Capone, I'd like to make an enquiry.")}
                target="_blank"
                rel="noreferrer"
                className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-ash transition-colors hover:text-champagne"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
        <div className="shell">
          <div className="h-px w-full bg-champagne/10" />
        </div>
      </div>
    </header>
  );
}
