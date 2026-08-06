import Link from "next/link";

export default function OrderConfirmationPage({
  params,
}: {
  params: { orderId: string };
}) {
  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <div className="ticket p-8 mt-4">
        <p className="ticket-number">ORDER #{params.orderId.slice(0, 8).toUpperCase()}</p>
        <h1 className="font-display text-2xl font-bold mt-4">Order confirmed!</h1>
        <p className="text-muted mt-2">
          We&apos;ve received your payment and your order is being prepared for
          delivery.
        </p>
      </div>
      <Link href="/shop" className="text-amber font-semibold mt-6 inline-block">
        Continue shopping →
      </Link>
    </div>
  );
}
