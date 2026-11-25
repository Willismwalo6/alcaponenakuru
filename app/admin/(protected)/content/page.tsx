import Link from "next/link";
import {
  addSlideAction,
  changePasswordAction,
  moveSlideAction,
  removeSlideAction,
  saveSettingsAction,
} from "@/app/admin/actions";
import { Empty, Label, Notice, PageHeader } from "@/components/admin/ui";
import { getMediaById, getSettings, listMedia } from "@/lib/db";
import { mediaSrc } from "@/lib/site";
import type { MediaRow } from "@/lib/types";

const FIELDS: Array<{ key: string; label: string; hint?: string; type?: "text" | "textarea" }> = [
  { key: "site_tagline", label: "Hero tagline" },
  { key: "phone", label: "Public phone number", hint: "Used for calls, WhatsApp fallback and payment instructions." },
  { key: "whatsapp", label: "WhatsApp number", hint: "International format without +, e.g. 254115333111." },
  { key: "email", label: "Email address", hint: "Leave blank to hide the email link." },
  { key: "address", label: "Address", hint: "Shown in the footer, contact page and structured data." },
  { key: "opening_hours", label: "Opening hours", hint: "Leave blank to show 'to be confirmed'." },
  { key: "instagram", label: "Instagram URL" },
  { key: "tiktok", label: "TikTok URL" },
  {
    key: "booking_notice",
    label: "Booking notice",
    hint: "Shown in the ticket booking summary.",
    type: "textarea",
  },
];

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; pw?: string }>;
}) {
  const { saved, pw } = await searchParams;
  const settings = await getSettings();
  const images = await listMedia("image");
  const videos = await listMedia("video");

  let slides: Array<{ mediaId: number }> = [];
  try {
    const parsed = JSON.parse(settings.hero_slides || "[]");
    if (Array.isArray(parsed)) slides = parsed.filter((s) => typeof s?.mediaId === "number");
  } catch {
    slides = [];
  }

  const sliderImages: Array<{ slide: { mediaId: number }; media: MediaRow }> = [];
  for (const slide of slides) {
    const media = await getMediaById(slide.mediaId);
    if (media) sliderImages.push({ slide, media });
  }

  return (
    <>
      <PageHeader
        title="Content & settings"
        subtitle="Everything customers see that is not an event or a booking: contact details, homepage slideshow and notices."
      />

      {saved ? <Notice tone="success">Saved.</Notice> : null}
      {pw === "ok" ? <Notice tone="success">Password updated.</Notice> : null}
      {pw === "wrong" ? <Notice tone="error">Your current password was not correct.</Notice> : null}
      {pw === "short" ? <Notice tone="error">Choose a password of at least 10 characters.</Notice> : null}

      <div className="grid gap-8 xl:grid-cols-[1.2fr_1fr]">
        <section>
          <h2 className="mb-4 font-display text-2xl tracking-wide text-champagne">Site details</h2>
          <form action={saveSettingsAction} className="space-y-5 border border-champagne/10 bg-ink-soft p-5">
            {FIELDS.map((field) => (
              <div key={field.key}>
                <label className="label" htmlFor={field.key}>
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={field.key}
                    name={field.key}
                    className="field min-h-24 resize-y"
                    defaultValue={settings[field.key] ?? ""}
                  />
                ) : (
                  <input
                    id={field.key}
                    name={field.key}
                    className="field"
                    defaultValue={settings[field.key] ?? ""}
                  />
                )}
                {field.hint ? (
                  <p className="mt-1 text-[0.625rem] leading-relaxed text-ash/70">{field.hint}</p>
                ) : null}
              </div>
            ))}

            <div className="border-t border-champagne/10 pt-5">
              <label className="label" htmlFor="hero_video">
                Hero video
              </label>
              <select
                id="hero_video"
                name="hero_video"
                className="field"
                defaultValue={settings.hero_video ?? ""}
              >
                <option value="">No video — use the image slideshow</option>
                {videos.map((video) => (
                  <option key={video.id} value={video.filename}>
                    {video.caption || video.filename}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[0.625rem] leading-relaxed text-ash/70">
                Exactly one hero video. When set it replaces the homepage slideshow. Upload videos in
                the gallery first.
              </p>
            </div>

            <div>
              <label className="label" htmlFor="hero_poster">
                Hero video poster
              </label>
              <select
                id="hero_poster"
                name="hero_poster"
                className="field"
                defaultValue={settings.hero_poster ?? ""}
              >
                <option value="">No poster frame</option>
                {images.map((image) => (
                  <option key={image.id} value={image.filename}>
                    {image.caption || image.filename}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[0.625rem] leading-relaxed text-ash/70">
                An uploaded image shown while the hero video loads.
              </p>
            </div>

            <button type="submit" className="btn btn-solid btn-sm">
              Save settings
            </button>
          </form>
        </section>

        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl tracking-wide text-champagne">Homepage slideshow</h2>
              <span className="text-[0.625rem] uppercase tracking-[0.16em] text-ash">
                {sliderImages.length} slides
              </span>
            </div>

            {sliderImages.length ? (
              <ul className="space-y-3">
                {sliderImages.map(({ slide, media }, index) => (
                  <li key={slide.mediaId} className="flex items-center gap-3 border border-champagne/10 bg-ink-soft p-3">
                    <span className="font-display text-lg text-ash">{String(index + 1).padStart(2, "0")}</span>
                    <img
                      src={mediaSrc(media!.filename)}
                      alt=""
                      className="h-14 w-20 border border-champagne/10 object-cover"
                    />
                    <p className="min-w-0 flex-1 truncate text-xs text-ash">
                      {media!.caption || media!.filename}
                    </p>
                    <div className="flex items-center gap-2">
                      <form action={moveSlideAction}>
                        <input type="hidden" name="media_id" value={slide.mediaId} />
                        <input type="hidden" name="direction" value="up" />
                        <button
                          type="submit"
                          className="px-2 text-xs text-ash hover:text-champagne"
                          aria-label="Move slide up"
                        >
                          ↑
                        </button>
                      </form>
                      <form action={moveSlideAction}>
                        <input type="hidden" name="media_id" value={slide.mediaId} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          className="px-2 text-xs text-ash hover:text-champagne"
                          aria-label="Move slide down"
                        >
                          ↓
                        </button>
                      </form>
                      <form action={removeSlideAction}>
                        <input type="hidden" name="media_id" value={slide.mediaId} />
                        <button
                          type="submit"
                          className="px-2 text-[0.625rem] uppercase tracking-[0.14em] text-ash hover:text-champagne"
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>
                No slides selected — the homepage falls back to the bundled placeholder set.
              </Empty>
            )}

            <div className="mt-6 border border-champagne/10 p-4">
              <Label>Add an image to the slideshow</Label>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {images.slice(0, 12).map((image) => {
                  const inSlides = slides.some((slide) => slide.mediaId === image.id);
                  return (
                    <form key={image.id} action={addSlideAction}>
                      <input type="hidden" name="media_id" value={image.id} />
                      <button
                        type="submit"
                        disabled={inSlides}
                        className="group block w-full disabled:cursor-not-allowed disabled:opacity-40"
                        title={inSlides ? "Already in slideshow" : "Add to slideshow"}
                      >
                        <img
                          src={mediaSrc(image.filename)}
                          alt=""
                          className="aspect-square w-full border border-champagne/10 object-cover group-hover:border-champagne/50"
                        />
                      </button>
                    </form>
                  );
                })}
              </div>
              <p className="mt-3 text-[0.625rem] text-ash/70">
                Upload more images in the{" "}
                <Link href="/admin/gallery" className="text-champagne underline">
                  gallery
                </Link>
                .
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-2xl tracking-wide text-champagne">Account</h2>
            <form action={changePasswordAction} className="space-y-4 border border-champagne/10 bg-ink-soft p-5">
              <div>
                <label className="label" htmlFor="current_password">Current password</label>
                <input
                  id="current_password"
                  name="current_password"
                  type="password"
                  className="field"
                  required
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="label" htmlFor="new_password">New password</label>
                <input
                  id="new_password"
                  name="new_password"
                  type="password"
                  className="field"
                  required
                  minLength={10}
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="btn btn-outline btn-sm">
                Change password
              </button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
