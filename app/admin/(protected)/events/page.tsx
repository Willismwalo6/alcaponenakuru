import Link from "next/link";
import { getTicketTypes, listEvents } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { Empty, Notice, PageHeader, Pill } from "@/components/admin/ui";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { deleted } = await searchParams;
  const events = await listEvents();
  const rows = await Promise.all(
    events.map(async (event) => ({ event, types: await getTicketTypes(event.id, false) })),
  );

  return (
    <>
      <PageHeader
        title="Events"
        subtitle="Create and manage the programme. Drafts stay private until published."
        action={{ href: "/admin/events/new", label: "New event" }}
      />

      {deleted ? <Notice tone="success">Event deleted.</Notice> : null}

      {rows.length ? (
        <ul className="divide-y divide-champagne/10 border border-champagne/10">
          {rows.map(({ event, types }) => {
            const sold = types.reduce((sum, t) => sum + t.sold, 0);
            return (
              <li key={event.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="text-sm font-semibold text-champagne hover:text-ember"
                    >
                      {event.title}
                    </Link>
                    <Pill status={event.status} />
                    {event.is_placeholder ? <Pill status="draft" label="placeholder" /> : null}
                  </div>
                  <p className="mt-1 text-[0.6875rem] text-ash">
                    {formatDateTime(event.starts_at)} · {types.length} categories · {sold} tickets sold
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <Link
                    href={`/events/${event.slug}`}
                    className="text-[0.625rem] uppercase tracking-[0.18em] text-ash hover:text-champagne"
                  >
                    View
                  </Link>
                  <Link href={`/admin/events/${event.id}`} className="btn btn-outline btn-sm">
                    Manage
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty>
          No events yet.{" "}
          <Link href="/admin/events/new" className="text-champagne underline">
            Create your first event
          </Link>
          .
        </Empty>
      )}
    </>
  );
}
