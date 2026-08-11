"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/lib/firestore";
import FeatureIcon from "@/components/FeatureIcon";

export default function HeroShowcase({ products }: { products: Product[] }) {
  const items = products.slice(0, 6);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-xl bg-surface2 flex flex-col items-center justify-center text-center p-8">
        <p className="font-display text-lg font-bold">New accessories dropping soon</p>
        <p className="text-sm text-muted mt-2">Check back shortly, or browse what&apos;s already up.</p>
        <Link
          href="/shop"
          className="mt-5 rounded-md bg-amber px-5 py-2 text-sm font-semibold text-ink transition hover:brightness-110"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  const product = items[index];

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-xl bg-surface2">
      <AnimatePresence mode="wait">
        <motion.div
          key={product.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          {product.images?.[0] && (
            <Image src={product.images[0]} alt={product.name} fill className="object-cover" priority />
          )}
        </motion.div>
      </AnimatePresence>

      {items.length > 1 && (
        <div className="absolute top-4 left-4 flex gap-1.5 z-10">
          {items.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setIndex(i)}
              aria-label={`Show ${p.name}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      <div className="absolute top-4 right-4 ticket px-4 py-2.5 flex items-center gap-2.5 shadow-lg">
        <span className="h-8 w-8 shrink-0 rounded-full bg-circuit/10 text-circuit flex items-center justify-center">
          <FeatureIcon kind="doorstep" className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-semibold leading-none">Free Doorstep Delivery</p>
          <p className="text-[11px] text-muted mt-1">Across Tirupathur</p>
        </div>
      </div>

      <Link
        href={`/shop/${product.id}`}
        className="absolute bottom-4 left-4 right-4 ticket px-4 py-3 flex items-center justify-between gap-3 shadow-lg transition hover:-translate-y-0.5"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{product.name}</p>
          <p className="text-amber font-mono text-sm mt-0.5">₹{product.price}</p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-circuit">Shop →</span>
      </Link>
    </div>
  );
}
