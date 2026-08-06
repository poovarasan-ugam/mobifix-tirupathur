import { getProducts } from "@/lib/firestore";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60; // re-fetch products every 60s

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="font-display text-3xl font-bold">Accessories</h1>
      <p className="text-muted mt-2">
        Genuine parts &amp; accessories, delivered across Tirupathur.
      </p>

      {products.length === 0 ? (
        <p className="text-muted mt-10">
          No products yet — add some from the admin panel.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-10">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
