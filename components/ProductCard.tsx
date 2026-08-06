import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/firestore";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.id}`} className="ticket p-4 mt-4 block group">
      <div className="relative aspect-square w-full overflow-hidden rounded bg-surface2">
        {product.images?.[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition group-hover:scale-105"
          />
        )}
      </div>
      <p className="ticket-number mt-3">SKU-{product.id.slice(0, 6).toUpperCase()}</p>
      <p className="mt-1 font-display font-semibold">{product.name}</p>
      <p className="mt-1 text-amber font-mono">₹{product.price}</p>
    </Link>
  );
}
