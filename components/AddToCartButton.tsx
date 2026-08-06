"use client";

import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/firestore";
import toast from "react-hot-toast";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.images?.[0],
    });
    toast.success(`${product.name} added to cart`);
  }

  return (
    <button
      onClick={handleAdd}
      disabled={product.stock <= 0}
      className="rounded-md bg-amber px-6 py-3 font-semibold text-ink hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      Add to Cart
    </button>
  );
}
