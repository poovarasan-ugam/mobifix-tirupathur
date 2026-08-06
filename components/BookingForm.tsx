"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createBooking } from "@/lib/firestore";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const schema = z.object({
  customerName: z.string().min(2, "Enter your name"),
  phone: z.string().min(10, "Enter a valid 10-digit phone number"),
  address: z.string().min(5, "Enter your full address"),
  locality: z.string().min(2, "Enter your locality/town"),
  deviceType: z.string().min(2, "e.g. iPhone 12, Redmi Note 11"),
  issueDescription: z.string().min(5, "Briefly describe the issue"),
  preferredTime: z.string().min(2, "e.g. Today evening, Tomorrow 10am"),
});

type FormData = z.infer<typeof schema>;

export default function BookingForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      await createBooking(data);
      toast.success("Booking received! We'll call you shortly.");
      reset();
      router.push("/repair/book/thank-you");
    } catch (err) {
      toast.error("Something went wrong. Please try again or call us directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="text-sm text-muted">Full name</label>
        <input
          {...register("customerName")}
          className="mt-1 w-full rounded border border-line bg-surface2 px-3 py-2"
          placeholder="Your name"
        />
        {errors.customerName && <p className="text-danger text-xs mt-1">{errors.customerName.message}</p>}
      </div>

      <div>
        <label className="text-sm text-muted">Phone number</label>
        <input
          {...register("phone")}
          className="mt-1 w-full rounded border border-line bg-surface2 px-3 py-2"
          placeholder="10-digit mobile number"
        />
        {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone.message}</p>}
      </div>

      <div>
        <label className="text-sm text-muted">Device</label>
        <input
          {...register("deviceType")}
          className="mt-1 w-full rounded border border-line bg-surface2 px-3 py-2"
          placeholder="e.g. Samsung M14"
        />
        {errors.deviceType && <p className="text-danger text-xs mt-1">{errors.deviceType.message}</p>}
      </div>

      <div>
        <label className="text-sm text-muted">What&apos;s wrong?</label>
        <textarea
          {...register("issueDescription")}
          rows={3}
          className="mt-1 w-full rounded border border-line bg-surface2 px-3 py-2"
          placeholder="e.g. Screen cracked, battery drains fast"
        />
        {errors.issueDescription && <p className="text-danger text-xs mt-1">{errors.issueDescription.message}</p>}
      </div>

      <div>
        <label className="text-sm text-muted">Locality / town</label>
        <input
          {...register("locality")}
          className="mt-1 w-full rounded border border-line bg-surface2 px-3 py-2"
          placeholder="e.g. Tirupathur town, Vaniyambadi"
        />
        {errors.locality && <p className="text-danger text-xs mt-1">{errors.locality.message}</p>}
      </div>

      <div>
        <label className="text-sm text-muted">Full address</label>
        <textarea
          {...register("address")}
          rows={2}
          className="mt-1 w-full rounded border border-line bg-surface2 px-3 py-2"
          placeholder="House/street details for the technician"
        />
        {errors.address && <p className="text-danger text-xs mt-1">{errors.address.message}</p>}
      </div>

      <div>
        <label className="text-sm text-muted">Preferred time</label>
        <input
          {...register("preferredTime")}
          className="mt-1 w-full rounded border border-line bg-surface2 px-3 py-2"
          placeholder="e.g. Today 5pm, Tomorrow morning"
        />
        {errors.preferredTime && <p className="text-danger text-xs mt-1">{errors.preferredTime.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-amber px-6 py-3 font-semibold text-ink transition hover:brightness-110 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100"
      >
        {loading ? "Submitting..." : "Book Repair — Free Inspection"}
      </button>
    </form>
  );
}
