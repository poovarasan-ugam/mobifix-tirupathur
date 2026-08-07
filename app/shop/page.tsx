import { getProducts } from "@/lib/firestore";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/motion/Reveal";

export const revalidate = 60; // re-fetch products every 60s

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const allProducts = await getProducts();
  const q = searchParams.q?.trim().toLowerCase();
  const products = q
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    : allProducts;

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="font-display text-3xl font-bold">Accessories</h1>
      <p className="text-muted mt-2">
        {q ? (
          <>
            {products.length} result{products.length !== 1 && "s"} for &ldquo;{searchParams.q}&rdquo;
          </>
        ) : (
          <>Genuine parts &amp; accessories, delivered across Tirupathur.</>
        )}
      </p>

      {products.length === 0 ? (
        <p className="text-muted mt-10">
          {q
            ? "No matching products — try a different search."
            : "No products yet — add some from the admin panel."}
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-10">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.05}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
