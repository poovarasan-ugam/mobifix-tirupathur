import { getProduct, isNewProduct } from "@/lib/firestore";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";

export default async function ProductPage({
  params,
}: {
  params: { productId: string };
}) {
  const product = await getProduct(params.productId);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 grid gap-10 md:grid-cols-2">
      <ProductGallery images={product.images} alt={product.name} />
      <div>
        <div className="flex items-center gap-2">
          <p className="ticket-number">SKU-{product.id.slice(0, 6).toUpperCase()}</p>
          {isNewProduct(product) && (
            <span className="rounded bg-circuit px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
              NEW
            </span>
          )}
        </div>
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
