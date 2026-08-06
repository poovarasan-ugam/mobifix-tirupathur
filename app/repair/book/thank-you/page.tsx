import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <div className="ticket p-8 mt-4">
        <p className="ticket-number">REQUEST RECEIVED</p>
        <h1 className="font-display text-2xl font-bold mt-4">
          We&apos;ll call you shortly!
        </h1>
        <p className="text-muted mt-2">
          A technician will confirm your slot within 2 hours. Keep your phone
          reachable.
        </p>
      </div>
      <Link href="/" className="text-amber font-semibold mt-6 inline-block">
        Back to home →
      </Link>
    </div>
  );
}
