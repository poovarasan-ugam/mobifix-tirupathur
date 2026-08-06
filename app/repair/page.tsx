import Link from "next/link";

const steps = [
  { n: "01", label: "Book online", desc: "Tell us the issue, your address, and a preferred time." },
  { n: "02", label: "Technician arrives", desc: "We come to your home or office, fully equipped." },
  { n: "03", label: "Free diagnosis", desc: "We inspect first and quote a fixed price before starting." },
  { n: "04", label: "Fixed on the spot", desc: "Most repairs finish in 30–45 minutes, right in front of you." },
];

export default function RepairPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <span className="inline-block rounded-full border border-line px-3 py-1 text-xs text-circuit font-mono">
        Doorstep service
      </span>
      <h1 className="font-display text-3xl md:text-4xl font-bold mt-4">
        Mobile repair that comes to you
      </h1>
      <p className="text-muted mt-3 max-w-xl">
        No need to drop your phone off anywhere. Our technician visits your
        home or workplace anywhere in Tirupathur district.
      </p>
      <Link
        href="/repair/book"
        className="mt-6 inline-block rounded-md bg-amber px-6 py-3 font-semibold text-base hover:brightness-110"
      >
        Book a Repair
      </Link>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-14">
        {steps.map((s) => (
          <div key={s.n} className="ticket p-5 mt-4">
            <p className="ticket-number">STEP {s.n}</p>
            <p className="mt-3 font-display font-bold">{s.label}</p>
            <p className="mt-1 text-sm text-muted">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
