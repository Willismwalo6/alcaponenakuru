"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/verify", label: "Check-in" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/content", label: "Content & settings" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard" className="border-t border-champagne/10 px-2 py-3 lg:px-2">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {ITEMS.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                className={[
                  "block whitespace-nowrap px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] transition-colors",
                  active
                    ? "bg-crimson/20 text-champagne"
                    : "text-ash hover:bg-graphite/50 hover:text-champagne",
                ].join(" ")}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
