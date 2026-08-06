"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Script from "next/script";

type CheckoutForm = {
  name: string;
  phone: string;
  address: string;
};

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(data: CheckoutForm) {
    setLoading(true);
    try {
      // 1. Create a Razorpay order on the server
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      const order = await res.json();

      // 2. Open Razorpay checkout
      const rzp = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "MobiFix Tirupathur",
        description: "Order payment",
        order_id: order.id,
        prefill: { name: data.name, contact: data.phone },
        theme: { color: "#F5A623" },
        handler: async function (response: any) {
          // 3. Verify payment + save order
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              items,
              total,
              customer: data,
            }),
          });
          const result = await verifyRes.json();
          if (result.success) {
            clearCart();
            toast.success("Payment successful!");
            router.push(`/orders/${result.orderId}`);
          } else {
            toast.error("Payment verification failed");
          }
        },
      });
      rzp.open();
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="mx-auto max-w-xl px-5 py-14">
        <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="text-sm text-muted">Full name</label>
            <input
              {...register("name", { required: true })}
              className="mt-1 w-full rounded border border-line bg-surface2 px-3 py-2"
            />
            {errors.name && <p className="text-danger text-xs mt-1">Required</p>}
          </div>
          <div>
            <label className="text-sm text-muted">Phone number</label>
            <input
              {...register("phone", { required: true, minLength: 10 })}
              className="mt-1 w-full rounded border border-line bg-surface2 px-3 py-2"
            />
            {errors.phone && <p className="text-danger text-xs mt-1">Enter a valid phone number</p>}
          </div>
          <div>
            <label className="text-sm text-muted">Delivery address</label>
            <textarea
              {...register("address", { required: true })}
              className="mt-1 w-full rounded border border-line bg-surface2 px-3 py-2"
              rows={3}
            />
            {errors.address && <p className="text-danger text-xs mt-1">Required</p>}
          </div>

          <div className="ticket p-4 mt-6 flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-mono text-amber">₹{total}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-amber px-6 py-3 font-semibold text-ink hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Processing..." : `Pay ₹${total}`}
          </button>
        </form>
      </div>
    </>
  );
}
