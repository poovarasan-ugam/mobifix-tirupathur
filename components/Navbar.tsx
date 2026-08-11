"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Mobi<span className="text-amber">Fix</span>
        </Link>
        <div className="hidden gap-8 md:flex">
          <Link href="/shop" className="text-sm font-semibold text-ink hover:text-amber">
            Shop
          </Link>
          <Link href="/repair" className="text-sm text-muted hover:text-ink">
            Repair Services
          </Link>
          <Link href="/repair/book" className="text-sm text-muted hover:text-ink">
            Book a Repair
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative text-sm font-medium text-ink hover:text-amber"
          >
            Cart
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="ml-1 inline-block rounded-full bg-amber px-1.5 py-0.5 text-xs font-bold text-ink"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </nav>
    </header>
  );
}
