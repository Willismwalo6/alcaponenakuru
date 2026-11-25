import Link from "next/link";
import { dashboardStats, listBookings, listReservations, listUpcomingEvents } from "@/lib/db";
import { formatDate, formatDateTime, formatKes } from "@/lib/format";
import { displayPhone } from "@/lib/site";
import { Empty, PageHeader, Pill, Stat } from "@/components/admin/ui";

export default async function AdminOverviewPage() {
  const stats = await dashboardStats();
  const bookings = (await listBookings()).slice(0, 5);
  const reservations = (await listReservations()).slice(0, 5);
  const upcoming = await listUpcomingEvents(3);

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Bookings, reservations and the programme at a glance."
        action={{ href: "/admin/events/new", label: "New event" }}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Published events" value={stats.events} href="/admin/events" />
        <Stat label="Pending bookings" value={stats.pendingBookings} href="/admin/bookings?status=pending" />
        <Stat label="Confirmed bookings" value={stats.confirmedBookings} href="/admin/bookings?status=confirmed" />
        <Stat label="Valid tickets" value={stats.ticketsIssued} href="/admin/bookings?status=confirmed" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Stat label="New reservation enquiries" value={stats.newReservations} href="/admin/reservations?status=new" />
        <Stat label="Upcoming events" value={stats.upcoming} href="/admin/events" />
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-wide text-champagne">Latest bookings</h2>
            <Link href="/admin/bookings" className="text-[0.625rem] uppercase tracking-[0.18em] text-ash hover:text-champagne">
              All bookings →
            </Link>
          </div>

          {bookings.length ? (
            <ul className="divide-y divide-champagne/10 border border-champagne/10">
              {bookings.map((booking) => (
                <li key={booking.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="block truncate text-sm text-champagne hover:text-ember"
                    >
                      {booking.name} · {booking.event_title}
                    </Link>
                    <p className="mt-1 text-[0.6875rem] text-ash">
                      {booking.reference} · {formatDateTime(booking.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-ash">{formatKes(booking.total)}</span>
                    <Pill status={booking.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No booking requests yet.</Empty>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-wide text-champagne">Latest enquiries</h2>
            <Link href="/admin/reservations" className="text-[0.625rem] uppercase tracking-[0.18em] text-ash hover:text-champagne">
              All reservations →
            </Link>
          </div>

          {reservations.length ? (
            <ul className="divide-y divide-champagne/10 border border-champagne/10">
              {reservations.map((reservation) => (
                <li key={reservation.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-champagne">
                      {reservation.name} · {reservation.category}
                    </p>
                    <p className="mt-1 text-[0.6875rem] text-ash">
                      {reservation.reference} · {formatDate(reservation.date)} · {reservation.guests} guests ·{" "}
                      {displayPhone(reservation.phone)}
                    </p>
                  </div>
                  <Pill status={reservation.status} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No reservation enquiries yet.</Empty>
          )}
        </section>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-2xl tracking-wide text-champagne">Next up</h2>
        {upcoming.length ? (
          <ul className="divide-y divide-champagne/10 border border-champagne/10">
            {upcoming.map((event) => (
              <li key={event.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <Link href={`/admin/events/${event.id}`} className="text-sm text-champagne hover:text-ember">
                    {event.title}
                  </Link>
                  <p className="mt-1 text-[0.6875rem] text-ash">{formatDateTime(event.starts_at)}</p>
                </div>
                <Pill status={event.status} />
              </li>
            ))}
          </ul>
        ) : (
          <Empty>
            No upcoming events.{" "}
            <Link href="/admin/events/new" className="text-champagne underline">
              Create the first one
            </Link>
            .
          </Empty>
        )}
      </section>
    </>
  );
}
