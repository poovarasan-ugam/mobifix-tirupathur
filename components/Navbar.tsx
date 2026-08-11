"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import SearchBar from "@/components/SearchBar";

export default function Navbar() {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-6xl px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="font-display text-xl font-bold tracking-tight shrink-0">
            Mobi<span className="text-amber">Fix</span>
          </Link>

          <div className="hidden md:block flex-1 max-w-sm">
            <SearchBar compact />
          </div>

          <div className="hidden gap-8 md:flex">
            <Link href="/shop" className="text-sm font-semibold text-ink hover:text-amber whitespace-nowrap">
              Shop
            </Link>
            <Link href="/repair" className="text-sm text-muted hover:text-ink whitespace-nowrap">
              Repair Services
            </Link>
            <Link href="/repair/book" className="text-sm text-muted hover:text-ink whitespace-nowrap">
              Book a Repair
            </Link>
          </div>

          <div className="flex items-center gap-4 shrink-0">
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
        </div>

        <div className="mt-3 md:hidden">
          <SearchBar compact />
        </div>
      </div>
    </header>
  );
}
