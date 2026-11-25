import {
  addSlideAction,
  deleteMediaAction,
  updateMediaAction,
  uploadMediaAction,
} from "@/app/admin/actions";
import { Empty, Label, Notice, PageHeader } from "@/components/admin/ui";
import { listMedia } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { mediaSrc } from "@/lib/site";

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ uploaded?: string; saved?: string; deleted?: string; error?: string }>;
}) {
  const flags = await searchParams;
  const media = await listMedia();

  return (
    <>
      <PageHeader
        title="Gallery"
        subtitle="Upload the venue's own photography and video. Uploads go to Supabase Storage and appear on the site immediately."
      />

      {flags.uploaded ? <Notice tone="success">Media uploaded.</Notice> : null}
      {flags.saved ? <Notice tone="success">Media updated.</Notice> : null}
      {flags.deleted ? <Notice tone="success">Media deleted.</Notice> : null}
      {flags.error === "type" ? (
        <Notice tone="error">Unsupported file type. Use JPG, PNG, WebP, AVIF, GIF, MP4, WebM or MOV.</Notice>
      ) : null}
      {flags.error === "size" ? <Notice tone="error">That file is larger than 45 MB.</Notice> : null}
      {flags.error === "file" ? <Notice tone="error">Choose a file to upload.</Notice> : null}
      {flags.error === "upload" ? (
        <Notice tone="error">
          The file could not be uploaded. Check SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and that the
          public media bucket exists.
        </Notice>
      ) : null}

      <form
        action={uploadMediaAction}
        className="mb-10 grid gap-4 border border-champagne/10 bg-ink-soft p-5 md:grid-cols-[1.2fr_1fr_auto] md:items-end"
      >
        <div>
          <Label>File</Label>
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm,video/quicktime"
            required
            className="mt-2 block w-full text-xs text-ash file:mr-3 file:cursor-pointer file:border-0 file:bg-crimson file:px-3 file:py-2 file:text-[0.625rem] file:font-semibold file:uppercase file:tracking-[0.16em] file:text-white"
          />
        </div>
        <div>
          <Label>Caption (used as alt text)</Label>
          <input name="caption" className="field mt-2" placeholder="e.g. Main floor on a Saturday" />
        </div>
        <button type="submit" className="btn btn-solid btn-sm md:mb-0.5">
          Upload
        </button>
      </form>

      {media.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {media.map((item) => (
            <article key={item.id} className="border border-champagne/10 bg-ink-soft">
              <div className="aspect-video overflow-hidden bg-ink">
                {item.kind === "video" ? (
                  <video src={mediaSrc(item.filename)} controls preload="none" className="h-full w-full object-cover" />
                ) : (
                  <img src={mediaSrc(item.filename)} alt={item.caption} className="h-full w-full object-cover" />
                )}
              </div>

              <form action={updateMediaAction} className="space-y-3 p-4">
                <input type="hidden" name="id" value={item.id} />
                <input
                  name="caption"
                  className="field"
                  defaultValue={item.caption}
                  placeholder="Caption"
                  aria-label="Caption"
                />
                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-[0.6875rem] text-ash">
                    <input
                      type="checkbox"
                      name="featured"
                      defaultChecked={Boolean(item.featured)}
                      className="h-4 w-4 accent-[#a51f2b]"
                    />
                    Featured
                  </label>
                  <div className="flex items-center gap-3">
                    <button type="submit" className="btn btn-outline btn-sm">
                      Save
                    </button>
                    <button
                      type="submit"
                      formAction={deleteMediaAction}
                      formNoValidate
                      className="text-[0.625rem] uppercase tracking-[0.16em] text-ash hover:text-champagne"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-[0.5625rem] uppercase tracking-[0.16em] text-ash/60">
                  {item.kind} · {formatDateTime(item.created_at)}
                </p>
              </form>

              {item.kind === "image" ? (
                <form action={addSlideAction} className="border-t border-champagne/10 p-4">
                  <input type="hidden" name="media_id" value={item.id} />
                  <button type="submit" className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-champagne hover:text-ember">
                    + Add to homepage slideshow
                  </button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <Empty>No media uploaded yet. Upload photography to populate the gallery and hero.</Empty>
      )}
    </>
  );
}
