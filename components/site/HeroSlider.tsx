"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type Slide = { src: string; alt: string; placeholder?: boolean };

type Props = {
  slides: Slide[];
  video?: string;
  poster?: string;
  interval?: number;
};

export default function HeroSlider({ slides, video, poster, interval = 6500 }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const reduce = useReducedMotion();
  const total = slides.length;

  const go = useCallback(
    (next: number) => {
      if (!total) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (video || paused || reduce || total < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, interval);
    return () => window.clearInterval(id);
  }, [video, paused, reduce, total, interval]);

  if (video) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-ink">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={video}
          poster={poster || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Al Capone atmosphere video"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/45 to-ink" />
        <button
          type="button"
          onClick={() => {
            const el = videoRef.current;
            if (!el) return;
            if (el.paused) {
              void el.play();
              setPlaying(true);
            } else {
              el.pause();
              setPlaying(false);
            }
          }}
          className="absolute bottom-6 right-6 z-20 border border-champagne/25 bg-ink/70 px-3 py-2 text-[0.5625rem] font-semibold uppercase tracking-[0.2em] text-champagne backdrop-blur transition-colors hover:border-champagne/60"
        >
          {playing ? "Pause video" : "Play video"}
        </button>
      </div>
    );
  }

  if (!total) {
    return <div className="absolute inset-0 bg-gradient-to-br from-graphite via-ink to-ink" />;
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-ink"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.img
            src={slides[index].src}
            alt={slides[index].alt}
            className="h-full w-full object-cover"
            decoding="async"
            fetchPriority={index === 0 ? "high" : "auto"}
            initial={{ scale: 1.04 }}
            animate={{ scale: reduce ? 1.04 : 1.13 }}
            transition={{ duration: reduce ? 0 : 9, ease: "linear" }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/40 to-ink" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,transparent_0%,rgba(16,16,16,0.55)_75%)]" />

      <div className="absolute bottom-6 left-0 right-0 z-20">
        <div className="shell flex items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-[0.5625rem] font-semibold tracking-[0.24em] text-ash">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.src + i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => go(i)}
                  className={[
                    "h-px w-8 transition-all duration-500",
                    i === index ? "bg-champagne" : "bg-champagne/30 hover:bg-champagne/60",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous slide"
              className="flex h-10 w-10 items-center justify-center border border-champagne/25 text-champagne transition-colors hover:border-champagne/70 hover:bg-champagne/10"
            >
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                <path d="M13 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next slide"
              className="flex h-10 w-10 items-center justify-center border border-champagne/25 text-champagne transition-colors hover:border-champagne/70 hover:bg-champagne/10"
            >
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <p className="absolute bottom-6 right-6 z-10 hidden text-[0.5rem] font-semibold uppercase tracking-[0.24em] text-ash/50 xl:block">
        Placeholder imagery
      </p>
    </div>
  );
}
