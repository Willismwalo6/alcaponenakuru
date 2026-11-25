import Link from "next/link";
import { notFound } from "next/navigation";
import EventForm from "@/components/admin/EventForm";
import { Empty, Label, Notice, PageHeader, Pill } from "@/components/admin/ui";
import {
  deleteEventAction,
  deleteTicketTypeAction,
  saveTicketTypeAction,
} from "@/app/admin/actions";
import { getEventById, getTicketTypes, listMedia } from "@/lib/db";
import { formatDateTime, formatKes } from "@/lib/format";
import { mediaSrc } from "@/lib/site";

type Params = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> };

export default async function AdminEventDetailPage({ params, searchParams }: Params) {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const event = await getEventById(Number(id));
  if (!event) notFound();

  const ticketTypes = await getTicketTypes(event.id, false);
  const media = await listMedia("image");
  const booked = ticketTypes.reduce((sum, t) => sum + t.sold, 0);

  return (
    <>
      <PageHeader
        title={event.title}
        subtitle={`${formatDateTime(event.starts_at)} · /events/${event.slug}`}
        action={{ href: `/events/${event.slug}`, label: "View on site" }}
      />

      <div className="mb-6">
        <Link href="/admin/events" className="text-[0.625rem] uppercase tracking-[0.18em] text-ash hover:text-champagne">
          ← All events
        </Link>
      </div>

      {saved ? <Notice tone="success">Changes saved.</Notice> : null}
      {error === "bookings" ? (
        <Notice tone="error">
          This event has bookings attached, so it cannot be deleted. Cancel the bookings first or set
          the event to archived.
        </Notice>
      ) : null}
      {error ? <Notice tone="error">Something was missing — check the required fields.</Notice> : null}

      <div className="grid gap-8 xl:grid-cols-[1.6fr_1fr]">
        <div>
          <h2 className="mb-4 font-display text-2xl tracking-wide text-champagne">Event details</h2>
          <EventForm event={event} media={media} />
        </div>

        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl tracking-wide text-champagne">Ticket categories</h2>
              <span className="text-[0.625rem] uppercase tracking-[0.18em] text-ash">
                {booked} sold
              </span>
            </div>

            {ticketTypes.length ? (
              <div className="space-y-3">
                {ticketTypes.map((type) => (
                  <form
                    key={type.id}
                    action={saveTicketTypeAction}
                    className="border border-champagne/10 bg-ink-soft p-4"
                  >
                    <input type="hidden" name="id" value={type.id} />
                    <input type="hidden" name="event_id" value={event.id} />

                    <div className="flex items-center justify-between gap-3">
                      <input
                        name="name"
                        className="field"
                        defaultValue={type.name}
                        aria-label="Category name"
                      />
                      <Pill status={type.active ? "published" : "draft"} label={type.active ? "on sale" : "hidden"} />
                    </div>

                    <input
                      name="description"
                      className="field mt-2"
                      defaultValue={type.description}
                      placeholder="Short description"
                      aria-label="Category description"
                    />

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <Label>Price (KES)</Label>
                        <input
                          name="price"
                          type="number"
                          min={0}
                          className="field mt-1"
                          defaultValue={type.price}
                          aria-label="Price"
                        />
                      </div>
                      <div>
                        <Label>Capacity (0 = unlimited)</Label>
                        <input
                          name="capacity"
                          type="number"
                          min={0}
                          className="field mt-1"
                          defaultValue={type.capacity}
                          aria-label="Capacity"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-xs text-ash">
                        <input
                          type="checkbox"
                          name="active"
                          defaultChecked={Boolean(type.active)}
                          className="h-4 w-4 accent-[#a51f2b]"
                        />
                        Visible on site
                      </label>
                      <div className="flex items-center gap-2">
                        <button type="submit" className="btn btn-outline btn-sm">
                          Save
                        </button>
                        <button
                          type="submit"
                          formAction={deleteTicketTypeAction}
                          formNoValidate
                          className="text-[0.625rem] uppercase tracking-[0.16em] text-ash hover:text-champagne"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-[0.625rem] text-ash/70">
                      {formatKes(type.price)} · {type.sold} sold
                      {type.capacity > 0 ? ` of ${type.capacity}` : ""}
                    </p>
                  </form>
                ))}
              </div>
            ) : (
              <Empty>No ticket categories yet. Add one below.</Empty>
            )}

            <form action={saveTicketTypeAction} className="mt-4 border border-dashed border-champagne/20 p-4">
              <input type="hidden" name="event_id" value={event.id} />
              <h3 className="text-[0.5625rem] font-semibold uppercase tracking-[0.22em] text-champagne">
                Add category
              </h3>
              <input name="name" className="field mt-3" placeholder="e.g. VIP" required aria-label="New category name" />
              <input name="description" className="field mt-2" placeholder="Short description" aria-label="New category description" />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  name="price"
                  type="number"
                  min={0}
                  className="field"
                  placeholder="Price KES"
                  aria-label="New category price"
                />
                <input
                  name="capacity"
                  type="number"
                  min={0}
                  className="field"
                  placeholder="Capacity"
                  aria-label="New category capacity"
                />
              </div>
              <label className="mt-3 flex items-center gap-2 text-xs text-ash">
                <input type="checkbox" name="active" defaultChecked className="h-4 w-4 accent-[#a51f2b]" />
                Visible on site
              </label>
              <button type="submit" className="btn btn-solid btn-sm mt-3">
                Add category
              </button>
            </form>
          </section>

          <section className="border border-crimson/30 p-4">
            <h2 className="font-display text-xl tracking-wide text-champagne">Danger zone</h2>
            <p className="mt-2 text-xs leading-relaxed text-ash">
              Deleting an event also deletes its ticket categories. Events with bookings cannot be
              deleted — archive them instead.
            </p>
            <form action={deleteEventAction} className="mt-4">
              <input type="hidden" name="id" value={event.id} />
              <input type="hidden" name="slug" value={event.slug} />
              <button type="submit" className="btn btn-outline btn-sm border-crimson/50">
                Delete event
              </button>
            </form>
          </section>

          <section className="border border-champagne/10 p-4">
            <h2 className="font-display text-xl tracking-wide text-champagne">Cover preview</h2>
            {event.cover ? (
              <img
                src={mediaSrc(event.cover)}
                alt=""
                className="mt-3 aspect-video w-full border border-champagne/10 object-cover"
              />
            ) : (
              <p className="mt-3 text-xs text-ash">No cover image selected.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
