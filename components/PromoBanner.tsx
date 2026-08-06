"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const slides = [
  {
    title: "Free Doorstep Inspection",
    subtitle: "No visit charge, no repair charge until you approve the quote.",
    cta: "Book a Repair",
    href: "/repair/book",
    from: "#F5A623",
    to: "#FB923C",
  },
  {
    title: "Same-Day Screen Replacement",
    subtitle: "Most repairs finish in 30–45 minutes, right at your door.",
    cta: "See Repair Services",
    href: "/repair",
    from: "#4F46E5",
    to: "#7C3AED",
  },
  {
    title: "Flat ₹50 Off Your First Order",
    subtitle: "Cases, chargers, earphones & more — delivered across Tirupathur.",
    cta: "Shop Accessories",
    href: "/shop",
    from: "#059669",
    to: "#10B981",
  },
  {
    title: "Genuine Accessories, Delivered",
    subtitle: "No more hunting shops — order online, get it at your doorstep.",
    cta: "Browse Shop",
    href: "/shop",
    from: "#1F2937",
    to: "#374151",
  },
];

export default function PromoBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[index];

  return (
    <section className="mx-auto max-w-6xl px-5 pb-16">
      <div
        className="relative overflow-hidden rounded-2xl p-8 md:p-12 transition-colors duration-700"
        style={{
          background: `linear-gradient(135deg, ${slide.from}, ${slide.to})`,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="max-w-lg"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white">
              {slide.title}
            </h3>
            <p className="mt-2 text-white/85">{slide.subtitle}</p>
            <Link
              href={slide.href}
              className="mt-6 inline-block rounded-md bg-white px-6 py-2.5 font-semibold text-ink transition hover:brightness-95 hover:-translate-y-0.5 active:scale-95"
            >
              {slide.cta}
            </Link>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex gap-2">
          {slides.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setIndex(i)}
              aria-label={`Show promo ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
