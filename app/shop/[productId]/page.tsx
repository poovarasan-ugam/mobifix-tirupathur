import { getProduct } from "@/lib/firestore";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductPage({
  params,
}: {
  params: { productId: string };
}) {
  const product = await getProduct(params.productId);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 grid gap-10 md:grid-cols-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-surface2">
        {product.images?.[0] && (
          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
        )}
      </div>
      <div>
        <p className="ticket-number">SKU-{product.id.slice(0, 6).toUpperCase()}</p>
        <h1 className="font-display text-3xl font-bold mt-2">{product.name}</h1>
        <p className="text-2xl text-amber font-mono mt-4">₹{product.price}</p>
        <p className="text-muted mt-4 leading-relaxed">{product.description}</p>
        <p className="text-sm text-muted mt-2">
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>
        <div className="mt-8">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
