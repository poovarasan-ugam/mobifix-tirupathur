export default function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="mx-auto max-w-6xl px-5 py-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg font-bold">
            Mobi<span className="text-amber">Fix</span>
          </p>
          <p className="text-sm text-muted mt-1">
            Doorstep mobile repair &amp; accessories — Tirupathur district.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-muted">
          <a href="tel:+910000000000" className="hover:text-ink">
            Call
          </a>
          <a
            href="https://wa.me/910000000000"
            target="_blank"
            className="hover:text-circuit"
          >
            WhatsApp
          </a>
          <span>Service area: Tirupathur &amp; nearby towns</span>
        </div>
      </div>
    </footer>
  );
}
