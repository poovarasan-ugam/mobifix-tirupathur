import Link from "next/link";
import Image from "next/image";
import { discountPercent, isNewProduct, type Product } from "@/lib/firestore";

export default function ProductCard({ product }: { product: Product }) {
  const isNew = isNewProduct(product);
  const discount = discountPercent(product);

  return (
    <Link href={`/shop/${product.id}`} className="ticket p-4 mt-4 block group">
      <div className="relative aspect-square w-full overflow-hidden rounded bg-surface2">
        {isNew && (
          <span className="absolute top-2 left-2 z-10 rounded bg-circuit px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
            NEW
          </span>
        )}
        {discount != null && (
          <span className="absolute top-2 right-2 z-10 rounded bg-green-600 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
            {discount}% OFF
          </span>
        )}
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
      <p className="mt-1 font-mono">
        {product.originalPrice != null && product.originalPrice > product.price && (
          <span className="text-muted line-through mr-1.5">₹{product.originalPrice}</span>
        )}
        <span className="text-amber">₹{product.price}</span>
      </p>
    </Link>
  );
}
