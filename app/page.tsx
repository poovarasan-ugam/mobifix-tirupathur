import Link from "next/link";
import { getProducts } from "@/lib/firestore";
import ProductCard from "@/components/ProductCard";
import PromoBanner from "@/components/PromoBanner";
import Reveal from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";

const services = [
  { code: "SCR-01", label: "Screen Replacement", desc: "Cracked or dead display, fixed on-site." },
  { code: "BAT-02", label: "Battery Replacement", desc: "Draining fast? Swapped in under 30 min." },
  { code: "WTR-03", label: "Water Damage", desc: "Diagnosis & board-level cleaning." },
  { code: "CHG-04", label: "Charging Port", desc: "Loose or dead port, repaired at your door." },
];

export const revalidate = 60;

export default async function Home() {
  const products = await getProducts();
  const featured = products.slice(0, 8);
  return (
    <div>
      {/* ---- Hero: styled as a filled-out job ticket ---- */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-20 md:pt-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <Reveal>
            <span className="inline-block rounded-full border border-line px-3 py-1 text-xs text-circuit font-mono">
              Serving Tirupathur district
            </span>
            <h1 className="mt-5 font-display text-4xl md:text-5xl font-bold leading-tight">
              We come to you.
              <br />
              Your phone doesn&apos;t.
            </h1>
            <p className="mt-4 text-muted max-w-md">
              MobiFix sends a certified technician to your doorstep for
              phone repairs, and delivers genuine accessories straight to
              your home — no shop visit needed.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/repair/book"
                className="rounded-md bg-amber px-6 py-3 font-semibold text-ink transition hover:brightness-110 hover:-translate-y-0.5 active:scale-95"
              >
                Book a Repair
              </Link>
              <Link
                href="/shop"
                className="rounded-md border border-line px-6 py-3 font-semibold text-ink transition hover:border-circuit hover:text-circuit hover:-translate-y-0.5 active:scale-95"
              >
                Shop Accessories
              </Link>
            </div>
          </Reveal>

          {/* the ticket itself */}
          <Parallax strength={18}>
            <Reveal delay={0.15} className="ticket p-6 mt-6">
              <div className="flex items-center justify-between pt-2">
                <span className="ticket-number">TICKET #MF-0000</span>
                <span className="text-xs text-muted">STATUS: OPEN</span>
              </div>
              <div className="mt-4 space-y-3 border-t border-dashed border-line pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Service</span>
                  <span>Doorstep visit</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Technician</span>
                  <span>Assigned within 2 hrs</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Coverage</span>
                  <span>Tirupathur &amp; nearby</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Inspection</span>
                  <span className="text-circuit">Free</span>
                </div>
              </div>
            </Reveal>
          </Parallax>
        </div>
      </section>

      <PromoBanner />

      {/* ---- Services grid, styled as ticket stubs ---- */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <h2 className="font-display text-2xl font-bold mb-2">Common repairs</h2>
        <p className="text-muted mb-8">Fixed pricing, quoted before we start.</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.code} delay={i * 0.06} className="ticket p-5 mt-4">
              <p className="ticket-number">{s.code}</p>
              <p className="mt-3 font-display font-bold">{s.label}</p>
              <p className="mt-1 text-sm text-muted">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-2xl font-bold">Popular accessories</h2>
            <Link href="/shop" className="text-sm font-semibold text-circuit hover:underline">
              View all →
            </Link>
          </div>
          <p className="text-muted mb-8">
            Genuine parts &amp; accessories, delivered across Tirupathur.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.05}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
