"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type GalleryItem = {
  id: number;
  src: string;
  kind: "image" | "video";
  alt: string;
  caption?: string;
};

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  const total = items.length;

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (dir: number) => setActive((current) => (current === null ? null : (current + dir + total) % total)),
    [total],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, step]);

  if (!total) {
    return (
      <div className="border border-dashed border-champagne/20 p-12 text-center">
        <p className="font-display text-2xl text-champagne">Gallery coming soon</p>
        <p className="mt-3 text-sm text-ash">
          Photos and videos will appear here once they are uploaded from the dashboard.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(i)}
            className="group relative block w-full break-inside-avoid overflow-hidden border border-champagne/10 bg-graphite/40 text-left"
            aria-label={`Open ${item.alt}`}
          >
            {item.kind === "video" ? (
              <video
                src={item.src}
                muted
                playsInline
                preload="none"
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={item.src}
                alt={item.alt}
                loading={i < 3 ? "eager" : "lazy"}
                className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
              />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-90" />
            {item.kind === "video" ? (
              <span className="absolute left-3 top-3 tag">Video</span>
            ) : null}
            <span className="absolute inset-x-3 bottom-3 text-[0.5625rem] uppercase tracking-[0.2em] text-champagne/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {item.caption || "View"}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active !== null && items[active] ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex flex-col bg-ink/97 backdrop-blur"
            role="dialog"
            aria-modal="true"
            aria-label="Gallery viewer"
          >
            <div className="flex items-center justify-between px-5 py-4 md:px-8">
              <span className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-ash">
                {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close viewer"
                className="flex h-10 w-10 items-center justify-center border border-champagne/25 text-champagne hover:border-champagne/70"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M1 1L15 15M15 1L1 15" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </button>
            </div>

            <div className="flex flex-1 items-center justify-center px-4 pb-4">
              {items[active].kind === "video" ? (
                <video
                  src={items[active].src}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[78vh] max-w-full"
                />
              ) : (
                <img
                  src={items[active].src}
                  alt={items[active].alt}
                  className="max-h-[78vh] max-w-full object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-champagne/10 px-5 py-4 md:px-8">
              <p className="max-w-xl text-xs leading-relaxed text-ash">
                {items[active].caption || items[active].alt}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous item"
                  className="flex h-10 w-10 items-center justify-center border border-champagne/25 text-champagne hover:border-champagne/70"
                >
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                    <path d="M13 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next item"
                  className="flex h-10 w-10 items-center justify-center border border-champagne/25 text-champagne hover:border-champagne/70"
                >
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                    <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
