import BookingForm from "@/components/BookingForm";

export default function BookRepairPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-14">
      <span className="ticket-number">NEW SERVICE REQUEST</span>
      <h1 className="font-display text-3xl font-bold mt-2">Book a Repair</h1>
      <p className="text-muted mt-2 mb-8">
        Fill this in and we&apos;ll call to confirm within a couple of hours.
        Inspection is free.
      </p>
      <BookingForm />
    </div>
  );
}
