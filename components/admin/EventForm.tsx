import { saveEventAction } from "@/app/admin/actions";
import { toLocalInput } from "@/lib/format";
import { mediaSrc } from "@/lib/site";
import type { EventRow, MediaRow } from "@/lib/types";

export default function EventForm({
  event,
  media,
}: {
  event?: EventRow;
  media: MediaRow[];
}) {
  const images = media.filter((m) => m.kind === "image");

  return (
    <form action={saveEventAction} className="space-y-6 border border-champagne/10 bg-ink-soft p-6">
      {event ? <input type="hidden" name="id" value={event.id} /> : null}
      {event ? <input type="hidden" name="slug" value={event.slug} /> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label" htmlFor="title">Event title</label>
          <input
            id="title"
            name="title"
            className="field"
            required
            defaultValue={event?.title ?? ""}
            placeholder="e.g. Friday Sessions"
          />
        </div>

        <div className="md:col-span-2">
          <label className="label" htmlFor="tagline">Short line (shown on cards)</label>
          <input
            id="tagline"
            name="tagline"
            className="field"
            defaultValue={event?.tagline ?? ""}
            placeholder="One line that sells the night"
          />
        </div>

        <div className="md:col-span-2">
          <label className="label" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            className="field min-h-40 resize-y"
            defaultValue={event?.description ?? ""}
            placeholder="What happens on the night, dress code, table notes…"
          />
        </div>

        <div>
          <label className="label" htmlFor="starts_at">Starts</label>
          <input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            className="field"
            required
            defaultValue={toLocalInput(event?.starts_at ?? "")}
          />
        </div>

        <div>
          <label className="label" htmlFor="doors_at">Doors open</label>
          <input
            id="doors_at"
            name="doors_at"
            type="datetime-local"
            className="field"
            defaultValue={toLocalInput(event?.doors_at ?? "")}
          />
        </div>

        <div>
          <label className="label" htmlFor="ends_at">Ends (optional)</label>
          <input
            id="ends_at"
            name="ends_at"
            type="datetime-local"
            className="field"
            defaultValue={toLocalInput(event?.ends_at ?? "")}
          />
        </div>

        <div>
          <label className="label" htmlFor="venue">Venue</label>
          <input
            id="venue"
            name="venue"
            className="field"
            defaultValue={event?.venue ?? "Al Capone, Nakuru"}
          />
        </div>

        <div>
          <label className="label" htmlFor="dress_code">Dress code</label>
          <input id="dress_code" name="dress_code" className="field" defaultValue={event?.dress_code ?? ""} />
        </div>

        <div>
          <label className="label" htmlFor="age_limit">Entry / age</label>
          <input id="age_limit" name="age_limit" className="field" defaultValue={event?.age_limit ?? "18+"} />
        </div>

        <div>
          <label className="label" htmlFor="status">Status</label>
          <select id="status" name="status" className="field" defaultValue={event?.status ?? "draft"}>
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published</option>
            <option value="sold_out">Sold out</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="cover">Cover image</label>
          <select id="cover" name="cover" className="field" defaultValue={event?.cover ?? ""}>
            <option value="">No image</option>
            {images.map((image) => (
              <option key={image.id} value={image.filename}>
                {image.caption || image.filename}
              </option>
            ))}
          </select>
          {event?.cover ? (
            <img
              src={mediaSrc(event.cover)}
              alt=""
              className="mt-3 h-20 w-32 border border-champagne/10 object-cover"
            />
          ) : null}
        </div>

        <label className="flex items-center gap-3 text-sm text-ash">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={Boolean(event?.featured)}
            className="h-4 w-4 accent-[#a51f2b]"
          />
          Feature on the homepage
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-champagne/10 pt-5">
        <button type="submit" className="btn btn-solid btn-sm">
          {event ? "Save changes" : "Create event"}
        </button>
        <span className="text-[0.6875rem] text-ash">
          Drafts are hidden from the public site.
        </span>
      </div>
    </form>
  );
}
