"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { relativeTime, type Testimonial } from "@/lib/firestore";
import Reveal from "@/components/motion/Reveal";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber tracking-tight" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-line">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopAutoScroll() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function startAutoScroll() {
    stopAutoScroll();
    timerRef.current = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + 320, behavior: "smooth" });
    }, 3500);
  }

  useEffect(() => {
    if (testimonials.length === 0) return;
    startAutoScroll();
    return stopAutoScroll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;

  const avgRating = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;

  return (
    <section className="mx-auto max-w-6xl px-5 pb-24">
      <Reveal>
        <div className="text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            Loved by Customers Across Tirupathur
          </h2>
          <p className="text-muted mt-2">
            {testimonials.length} customer review{testimonials.length !== 1 && "s"}, {avgRating.toFixed(1)}★ average.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <span className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold">
            ⭐ {avgRating.toFixed(1)}/5 average rating
          </span>
          <span className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold">
            💬 {testimonials.length} customer review{testimonials.length !== 1 && "s"}
          </span>
          <span className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold">
            🏠 Doorstep service across Tirupathur
          </span>
          <span className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold">
            🛡️ Genuine parts
          </span>
        </div>
      </Reveal>

      <div
        ref={trackRef}
        onMouseEnter={stopAutoScroll}
        onMouseLeave={startAutoScroll}
        onFocus={stopAutoScroll}
        onBlur={startAutoScroll}
        className="mt-10 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="ticket snap-start shrink-0 w-[300px] p-5 transition hover:-translate-y-1"
          >
            <Stars rating={t.rating} />
            <p className="mt-3 text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-4 pt-4 border-t border-line">
              <p className="font-semibold text-sm">{t.customerName}</p>
              <p className="text-xs text-muted mt-0.5">📍 {t.location}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="rounded bg-surface2 px-2 py-0.5 text-[11px] text-muted">{t.device}</span>
                <span className="rounded bg-surface2 px-2 py-0.5 text-[11px] text-muted">{t.service}</span>
              </div>
              <p className="text-[11px] text-muted mt-2">{relativeTime(t.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <p className="font-display text-lg font-semibold">Ready to get your phone repaired?</p>
        <p className="text-muted mt-1">Book a certified technician and get a free inspection first.</p>
        <Link
          href="/repair/book"
          className="mt-5 inline-block rounded-md bg-amber px-8 py-3 font-semibold text-ink transition hover:brightness-110 hover:-translate-y-0.5 active:scale-95"
        >
          Book Repair Now
        </Link>
      </div>
    </section>
  );
}
