"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-base/90 backdrop-blur">
      <div className="hazard-edge" />
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Mobi<span className="text-amber">Fix</span>
        </Link>
        <div className="hidden gap-8 md:flex">
          <Link href="/shop" className="text-sm text-muted hover:text-ink">
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
            {count > 0 && (
              <span className="ml-1 rounded-full bg-amber px-1.5 py-0.5 text-xs font-bold text-base">
                {count}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
