import Link from "next/link";
import { Empty, PageHeader, Pill } from "@/components/admin/ui";
import { listBookings } from "@/lib/db";
import { formatDateTime, formatKes } from "@/lib/format";
import { BOOKING_STATUS_LABELS, displayPhone } from "@/lib/site";

const FILTERS = ["all", "pending", "confirmed", "cancelled"] as const;

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "all" } = await searchParams;
  const bookings = await listBookings(status);
  const all = await listBookings();

  return (
    <>
      <PageHeader
        title="Bookings"
        subtitle="Ticket booking requests. Confirming a booking issues its QR tickets — confirm only after payment is completed with the club."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const count = filter === "all" ? all.length : all.filter((b) => b.status === filter).length;
          const active = status === filter;
          return (
            <Link
              key={filter}
              href={filter === "all" ? "/admin/bookings" : `/admin/bookings?status=${filter}`}
              className={[
                "border px-3 py-2 text-[0.625rem] font-semibold uppercase tracking-[0.16em] transition-colors",
                active
                  ? "border-champagne/50 bg-graphite/60 text-champagne"
                  : "border-champagne/15 text-ash hover:text-champagne",
              ].join(" ")}
            >
              {filter} ({count})
            </Link>
          );
        })}
      </div>

      {bookings.length ? (
        <div className="overflow-x-auto border border-champagne/10">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-champagne/10 bg-graphite/40 text-[0.5625rem] uppercase tracking-[0.18em] text-ash">
                <th className="px-4 py-3 font-semibold">Reference</th>
                <th className="px-4 py-3 font-semibold">Guest</th>
                <th className="px-4 py-3 font-semibold">Event</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Received</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-champagne/10">
              {bookings.map((booking) => (
                <tr key={booking.id} className="align-top">
                  <td className="px-4 py-3 font-mono text-xs text-champagne">{booking.reference}</td>
                  <td className="px-4 py-3">
                    <p className="text-champagne">{booking.name}</p>
                    <p className="text-[0.6875rem] text-ash">{displayPhone(booking.phone)}</p>
                  </td>
                  <td className="px-4 py-3 text-ash">{booking.event_title}</td>
                  <td className="px-4 py-3 text-champagne">{formatKes(booking.total)}</td>
                  <td className="px-4 py-3">
                    <Pill status={booking.status} label={BOOKING_STATUS_LABELS[booking.status]} />
                  </td>
                  <td className="px-4 py-3 text-[0.6875rem] text-ash">
                    {formatDateTime(booking.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/bookings/${booking.id}`} className="btn btn-outline btn-sm">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No bookings in this view.</Empty>
      )}
    </>
  );
}
