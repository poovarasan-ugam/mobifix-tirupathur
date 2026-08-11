import Link from "next/link";
import Image from "next/image";
import { getProducts, getTestimonials } from "@/lib/firestore";
import ProductCard from "@/components/ProductCard";
import PromoBanner from "@/components/PromoBanner";
import Reveal from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";
import RepairIcon from "@/components/RepairIcon";
import FeatureIcon from "@/components/FeatureIcon";
import Testimonials from "@/components/Testimonials";

const shopCategories = [
  { icon: "case" as const, label: "Phone Cases", q: "case", color: "#EC4899" },
  { icon: "charging" as const, label: "Chargers", q: "charger", color: "#4F46E5" },
  { icon: "earphones" as const, label: "Earphones", q: "earphone", color: "#10B981" },
  { icon: "protector" as const, label: "Screen Protectors", q: "protector", color: "#F5A623" },
  { icon: "cable" as const, label: "Cables", q: "cable", color: "#06B6D4" },
  { icon: "powerbank" as const, label: "Power Banks", q: "power bank", color: "#8B5CF6" },
];

const repairCategories = [
  { icon: "screen" as const, label: "Screen Replacement" },
  { icon: "battery" as const, label: "Battery" },
  { icon: "charging" as const, label: "Charging Port" },
  { icon: "water" as const, label: "Water Damage" },
  { icon: "camera" as const, label: "Camera" },
  { icon: "software" as const, label: "Software Issues" },
];

const brands = ["Samsung", "Apple", "Xiaomi", "Vivo", "Oppo", "Realme", "OnePlus", "Motorola"];

const whyUs = [
  {
    icon: "genuine" as const,
    label: "Genuine Products",
    desc: "Every case, charger, and accessory we sell is genuine — never a cheap knockoff that fails in a few weeks.",
    image: "https://images.unsplash.com/photo-1573739022854-abceaeb585dc?w=800&q=80&auto=format&fit=crop",
  },
  {
    icon: "doorstep" as const,
    label: "Doorstep Delivery",
    desc: "Order online and get it delivered straight to your home or office across Tirupathur — no shop visit needed.",
    image: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&q=80&auto=format&fit=crop",
  },
  {
    icon: "certified" as const,
    label: "Certified Technicians",
    desc: "Need a repair too? Every job is handled by a trained specialist who knows your device inside out.",
    image: "https://images.unsplash.com/photo-1611396000732-f8c9a933424f?w=800&q=80&auto=format&fit=crop",
  },
  {
    icon: "inspection" as const,
    label: "Free Inspection",
    desc: "Before any repair work begins, we run a full diagnostic and give you a clear, fixed quote — no surprises.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&auto=format&fit=crop",
  },
];

const bookingSteps = [
  { label: "Book Online", desc: "Tell us the issue and pick a time." },
  { label: "Technician Assigned", desc: "Confirmed within 2 hours." },
  { label: "Doorstep Visit", desc: "We arrive fully equipped." },
  { label: "Repair Completed", desc: "Most fixes done in 30–45 min." },
  { label: "Payment", desc: "Pay only after you approve." },
];

export const revalidate = 60;

export default async function Home() {
  const products = await getProducts();
  const featured = products.slice(0, 8);
  const testimonials = await getTestimonials();
  return (
    <div>
      {/* ---- Hero ---- */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-14 md:pt-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <Reveal>
            <span className="inline-block rounded-full border border-line px-3 py-1 text-xs text-circuit font-mono">
              Delivering across Tirupathur district
            </span>
            <h1 className="mt-5 font-display text-4xl md:text-5xl font-bold leading-tight">
              Genuine mobile accessories,
              <br />
              delivered to your door.
            </h1>
            <p className="mt-4 text-muted max-w-md">
              Cases, chargers, earphones, cables &amp; more — genuine
              products delivered fast across Tirupathur. Need a repair too?
              We do doorstep phone repair as well.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="rounded-md bg-amber px-6 py-3 font-semibold text-ink transition hover:brightness-110 hover:-translate-y-0.5 active:scale-95"
              >
                Shop Now
              </Link>
              <Link
                href="/repair/book"
                className="rounded-md border border-line px-6 py-3 font-semibold text-ink transition hover:border-circuit hover:text-circuit hover:-translate-y-0.5 active:scale-95"
              >
                Book a Repair
              </Link>
            </div>
          </Reveal>

          {/* hero visual */}
          <Parallax strength={18}>
            <Reveal delay={0.15} className="relative mt-6">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1628911771814-5d61388efbf7?w=1200&q=80&auto=format&fit=crop"
                  alt="Genuine mobile accessories — earphones and phone"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 ticket px-4 py-2.5 flex items-center gap-2.5 shadow-lg">
                  <span className="h-8 w-8 shrink-0 rounded-full bg-circuit/10 text-circuit flex items-center justify-center">
                    <FeatureIcon kind="doorstep" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold leading-none">Free Doorstep Delivery</p>
                    <p className="text-[11px] text-muted mt-1">Across Tirupathur</p>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 ticket px-4 py-2.5 flex items-center gap-2.5 shadow-lg">
                  <span className="h-8 w-8 shrink-0 rounded-full bg-amber/15 text-amber flex items-center justify-center">
                    <FeatureIcon kind="genuine" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold leading-none">Genuine Products</p>
                    <p className="text-[11px] text-muted mt-1">Never knockoffs</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </Parallax>
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

      {/* ---- Shop by category ---- */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <h2 className="font-display text-2xl font-bold mb-2">Shop by category</h2>
        <p className="text-muted mb-8">Genuine accessories for every phone.</p>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {shopCategories.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.05}>
              <Link
                href={`/shop?q=${encodeURIComponent(c.q)}`}
                className="flex flex-col items-center gap-3 rounded-xl border border-line bg-surface p-5 text-center transition hover:-translate-y-1 hover:shadow-lg hover:border-transparent"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${c.color}1A`, color: c.color }}
                >
                  <RepairIcon kind={c.icon} />
                </div>
                <p className="font-display font-semibold text-sm">{c.label}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- Brand trust strip ---- */}
      <Reveal className="mx-auto max-w-6xl px-5 pb-16">
        <p className="text-center text-xs uppercase tracking-wider text-muted mb-5">
          Accessories &amp; repairs for all major brands
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {brands.map((b) => (
            <span
              key={b}
              className="rounded-lg border border-line bg-surface px-5 py-2.5 font-display text-sm font-bold text-muted transition hover:-translate-y-0.5 hover:border-circuit hover:text-circuit hover:shadow-md"
            >
              {b}
            </span>
          ))}
        </div>
      </Reveal>

      <PromoBanner />

      {/* ---- Why choose MobiFix ---- */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <h2 className="font-display text-2xl font-bold mb-2">Why choose MobiFix</h2>
        <p className="text-muted mb-8">What you get with every order.</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.06} className="ticket mt-4">
              <div className="relative aspect-[4/3] w-full bg-surface2">
                <Image src={f.image} alt={f.label} fill className="object-cover" />
                <div className="absolute -bottom-5 left-4 h-11 w-11 rounded-full bg-amber/15 text-amber flex items-center justify-center ring-4 ring-surface">
                  <FeatureIcon kind={f.icon} />
                </div>
              </div>
              <div className="p-5 pt-7">
                <p className="font-display font-bold">{f.label}</p>
                <p className="mt-1.5 text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- Repair services (secondary) ---- */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="ticket p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="ticket-number">ALSO AVAILABLE</span>
              <h2 className="mt-2 font-display text-xl font-bold">Need a repair instead?</h2>
              <p className="mt-1 text-sm text-muted">
                Doorstep phone repair — free inspection, fixed pricing.
              </p>
            </div>
            <Link
              href="/repair/book"
              className="shrink-0 rounded-md bg-amber px-6 py-2.5 font-semibold text-ink transition hover:brightness-110 hover:-translate-y-0.5 active:scale-95"
            >
              Book a Repair
            </Link>
          </div>
          <div className="grid gap-4 grid-cols-3 sm:grid-cols-6 mt-8">
            {repairCategories.map((c) => (
              <div key={c.label} className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-circuit/10 text-circuit">
                  <RepairIcon kind={c.icon} className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Booking process timeline ---- */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <h2 className="font-display text-2xl font-bold mb-2">How repair booking works</h2>
        <p className="text-muted mb-10">From tap to fixed, in five steps.</p>
        <div className="relative">
          <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-line" />
          <div className="grid gap-8 md:grid-cols-5">
            {bookingSteps.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08} className="relative flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-circuit text-white flex items-center justify-center font-display font-bold relative z-10">
                  {i + 1}
                </div>
                <p className="mt-3 font-semibold text-sm">{s.label}</p>
                <p className="mt-1 text-xs text-muted">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Testimonials testimonials={testimonials} />

      {/* ---- Coverage ---- */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <Reveal className="ticket p-8 md:p-10 grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <span className="ticket-number">SERVICE AREA</span>
            <h2 className="mt-2 font-display text-2xl font-bold">Currently serving Tirupathur &amp; nearby areas</h2>
            <p className="mt-3 text-muted">
              We deliver accessories and offer doorstep repair across
              Tirupathur town and the surrounding district. Tell us your
              locality at checkout or booking — we&apos;ll confirm coverage.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-md border border-line px-5 py-2.5 font-semibold text-sm text-ink transition hover:border-circuit hover:text-circuit"
            >
              Check availability →
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 200 160" width="220" height="176" className="text-circuit">
              <circle cx="100" cy="90" r="55" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.15" />
              <circle cx="100" cy="90" r="38" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
              <circle cx="100" cy="90" r="21" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
              <path
                d="M100 55 C112 55 121 64 121 76 C121 92 100 116 100 116 C100 116 79 92 79 76 C79 64 88 55 100 55 Z"
                fill="currentColor"
              />
              <circle cx="100" cy="75" r="7" fill="white" />
            </svg>
          </div>
        </Reveal>
      </section>

      {/* ---- CTA banner ---- */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <Reveal
          className="rounded-2xl p-10 md:p-14 text-center"
          style={{ background: "linear-gradient(135deg, #F5A623, #4F46E5)" }}
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
            Genuine accessories, delivered fast.
          </h2>
          <p className="mt-2 text-white/90">Browse cases, chargers, earphones &amp; more.</p>
          <Link
            href="/shop"
            className="mt-6 inline-block rounded-md bg-white px-8 py-3 font-semibold text-ink transition hover:brightness-95 hover:-translate-y-0.5 active:scale-95"
          >
            Shop Now
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
