import type { Metadata } from "next";
import GalleryGrid, { type GalleryItem } from "@/components/site/GalleryGrid";
import Reveal from "@/components/site/Reveal";
import { listMedia } from "@/lib/db";
import { mediaSrc } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Inside Al Capone Nakuru — photography and video from the club, updated by the venue.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const media = await listMedia();
  const items: GalleryItem[] = media.map((m) => ({
    id: m.id,
    src: mediaSrc(m.filename),
    kind: m.kind,
    alt: m.caption || "Al Capone Nakuru",
    caption: m.caption,
  }));

  const photos = items.filter((i) => i.kind === "image");
  const videos = items.filter((i) => i.kind === "video");

  return (
    <>
      <section className="border-b border-champagne/10 bg-ink-soft">
        <div className="shell py-16 md:py-24">
          <Reveal>
            <p className="eyebrow">Gallery</p>
            <h1 className="display-xl mt-4 text-champagne">
              Inside Al Capone
              <span className="text-ember">.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-ash md:text-base">
              The room, the tables, the nights. Photography and video are managed by the club and
              updated as the season goes on.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="shell py-14 md:py-20">
        {videos.length ? (
          <div className="mb-14">
            <h2 className="display-md text-champagne">Video</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {videos.map((item) => (
                <div key={item.id} className="border border-champagne/10 bg-graphite/30">
                  <video
                    src={item.src}
                    controls
                    preload="none"
                    playsInline
                    className="aspect-video w-full bg-ink"
                  />
                  {item.caption ? (
                    <p className="px-4 py-3 text-xs text-ash">{item.caption}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <h2 className="display-md text-champagne">Photography</h2>
        <div className="mt-6">
          <GalleryGrid items={photos} />
        </div>

        <p className="mt-8 text-[0.625rem] uppercase tracking-[0.2em] text-ash/60">
          Preview imagery is placeholder art direction — the venue&apos;s own photography replaces it
          from the dashboard.
        </p>
      </section>
    </>
  );
}
