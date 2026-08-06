import Link from "next/link";

const services = [
  { code: "SCR-01", label: "Screen Replacement", desc: "Cracked or dead display, fixed on-site." },
  { code: "BAT-02", label: "Battery Replacement", desc: "Draining fast? Swapped in under 30 min." },
  { code: "WTR-03", label: "Water Damage", desc: "Diagnosis & board-level cleaning." },
  { code: "CHG-04", label: "Charging Port", desc: "Loose or dead port, repaired at your door." },
];

export default function Home() {
  return (
    <div>
      {/* ---- Hero: styled as a filled-out job ticket ---- */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-20 md:pt-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
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
                className="rounded-md bg-amber px-6 py-3 font-semibold text-ink hover:brightness-110"
              >
                Book a Repair
              </Link>
              <Link
                href="/shop"
                className="rounded-md border border-line px-6 py-3 font-semibold text-ink hover:border-circuit hover:text-circuit"
              >
                Shop Accessories
              </Link>
            </div>
          </div>

          {/* the ticket itself */}
          <div className="ticket p-6 mt-6">
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
          </div>
        </div>
      </section>

      {/* ---- Services grid, styled as ticket stubs ---- */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <h2 className="font-display text-2xl font-bold mb-2">Common repairs</h2>
        <p className="text-muted mb-8">Fixed pricing, quoted before we start.</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div key={s.code} className="ticket p-5 mt-4">
              <p className="ticket-number">{s.code}</p>
              <p className="mt-3 font-display font-bold">{s.label}</p>
              <p className="mt-1 text-sm text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="ticket p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="font-display text-xl font-bold">
              Need accessories instead?
            </h3>
            <p className="text-muted mt-1">
              Cases, chargers, earphones &amp; more — delivered across Tirupathur.
            </p>
          </div>
          <Link
            href="/shop"
            className="rounded-md bg-circuit px-6 py-3 font-semibold text-white whitespace-nowrap hover:brightness-110"
          >
            Browse Shop
          </Link>
        </div>
      </section>
    </div>
  );
}
