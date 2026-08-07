import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface mt-24">
      <div className="mx-auto max-w-6xl px-5 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-bold">
            Mobi<span className="text-amber">Fix</span>
          </p>
          <p className="text-sm text-muted mt-2 max-w-xs">
            Doorstep mobile repair &amp; accessories — Tirupathur district.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Quick Links</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
            <Link href="/shop" className="hover:text-ink">Shop Accessories</Link>
            <Link href="/repair" className="hover:text-ink">Repair Services</Link>
            <Link href="/repair/book" className="hover:text-ink">Book a Repair</Link>
            <Link href="/cart" className="hover:text-ink">Cart</Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Support</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
            <a href="tel:+910000000000" className="hover:text-ink">Call us</a>
            <a href="https://wa.me/910000000000" target="_blank" className="hover:text-circuit">
              WhatsApp
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Service Area</p>
          <p className="mt-3 text-sm text-muted">Tirupathur &amp; nearby towns</p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-5 text-xs text-muted">
          © {year} MobiFix Tirupathur. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
