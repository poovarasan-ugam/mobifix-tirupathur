"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, updateQty, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <p className="text-muted">Your cart is empty.</p>
        <Link href="/shop" className="text-amber font-semibold mt-4 inline-block">
          Browse accessories →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="font-display text-3xl font-bold mb-8">Your Cart</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="ticket p-4 mt-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-amber font-mono text-sm">₹{item.price}</p>
            </div>
            <input
              type="number"
              min={1}
              value={item.qty}
              onChange={(e) => updateQty(item.productId, Number(e.target.value))}
              className="w-16 rounded border border-line bg-surface2 px-2 py-1 text-center"
            />
            <button
              onClick={() => removeItem(item.productId)}
              className="text-sm text-danger hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="ticket p-6 mt-8 flex items-center justify-between">
        <span className="font-display font-bold text-lg">Total</span>
        <span className="font-mono text-xl text-amber">₹{total}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block text-center rounded-md bg-amber px-6 py-3 font-semibold text-ink transition hover:brightness-110 hover:-translate-y-0.5 active:scale-95"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}
