import Link from "next/link";
import { updateReservationAction } from "@/app/admin/actions";
import { Empty, Label, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { listReservations } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/format";
import { RESERVATION_STATUS_LABELS, displayPhone, whatsappLink } from "@/lib/site";

const FILTERS = ["all", "new", "confirmed", "declined", "completed"] as const;

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; updated?: string }>;
}) {
  const { status = "all", updated } = await searchParams;
  const reservations = await listReservations(status);
  const counts = await listReservations();

  return (
    <>
      <PageHeader
        title="Reservations"
        subtitle="Table, VIP and event enquiries. Confirming here marks the booking as confirmed — only do it once you have spoken to the guest."
      />

      {updated ? <Notice tone="success">Reservation updated.</Notice> : null}

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const count = filter === "all" ? counts.length : counts.filter((r) => r.status === filter).length;
          const active = status === filter;
          return (
            <Link
              key={filter}
              href={filter === "all" ? "/admin/reservations" : `/admin/reservations?status=${filter}`}
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

      {reservations.length ? (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <article key={reservation.id} className="border border-champagne/10 bg-ink-soft">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-champagne/10 p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl tracking-wide text-champagne">
                      {reservation.name}
                    </h2>
                    <Pill
                      status={reservation.status}
                      label={RESERVATION_STATUS_LABELS[reservation.status]}
                    />
                    <span className="font-mono text-[0.625rem] tracking-[0.1em] text-ash">
                      {reservation.reference}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-ash">
                    {reservation.category} · {formatDate(reservation.date)}
                    {reservation.arrival_time ? ` at ${reservation.arrival_time}` : ""} ·{" "}
                    {reservation.guests} guests · {reservation.seating}
                  </p>
                  <p className="mt-1 text-xs text-ash">
                    {displayPhone(reservation.phone)}
                    {reservation.email ? ` · ${reservation.email}` : ""} · received{" "}
                    {formatDateTime(reservation.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={`tel:${reservation.phone}`}
                    className="btn btn-outline btn-sm"
                  >
                    Call
                  </a>
                  <a
                    href={whatsappLink(
                      reservation.phone,
                      `Hello ${reservation.name}, this is Al Capone Nakuru about your reservation enquiry ${reservation.reference}.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-solid btn-sm"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-[1fr_1.2fr]">
                <div>
                  <Label>Guest requests</Label>
                  <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-ash">
                    {reservation.requests || "No special requests."}
                  </p>
                </div>

                <form action={updateReservationAction} className="flex flex-col gap-3">
                  <input type="hidden" name="id" value={reservation.id} />
                  <input
                    type="hidden"
                    name="return_to"
                    value={status === "all" ? "/admin/reservations?updated=1" : `/admin/reservations?status=${status}&updated=1`}
                  />
                  <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                    <div>
                      <Label>Status</Label>
                      <select
                        name="status"
                        defaultValue={reservation.status}
                        className="field mt-2"
                        aria-label="Reservation status"
                      >
                        <option value="new">New</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="declined">Declined</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <Label>Internal notes</Label>
                      <input
                        name="admin_notes"
                        defaultValue={reservation.admin_notes}
                        className="field mt-2"
                        placeholder="Table number, deposit taken, call notes…"
                        aria-label="Internal notes"
                      />
                    </div>
                  </div>
                  <div>
                    <button type="submit" className="btn btn-solid btn-sm">
                      Save reservation
                    </button>
                  </div>
                </form>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty>No reservation enquiries in this view.</Empty>
      )}
    </>
  );
}
