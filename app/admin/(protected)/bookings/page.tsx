"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdmin } from "@/components/AdminGuard";

type BookingRow = {
  id: string;
  customerName: string;
  phone: string;
  deviceType: string;
  issueDescription: string;
  locality: string;
  preferredTime: string;
  status: string;
};

export default function AdminBookingsPage() {
  const { permissions } = useAdmin();

  if (!permissions.bookings) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-14">
        <h1 className="font-display text-3xl font-bold mb-2">Repair Bookings</h1>
        <p className="text-muted">You don&apos;t have access to this section.</p>
      </div>
    );
  }

  return <BookingsManager />;
}

function BookingsManager() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const snap = await getDocs(
        query(collection(db, "bookings"), orderBy("createdAt", "desc"))
      );
      setBookings(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      );
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="font-display text-3xl font-bold mb-8">Repair Bookings</h1>
      <div className="space-y-4">
        {loading && <p className="text-muted">Loading…</p>}
        {!loading && bookings.length === 0 && (
          <p className="text-muted">No bookings yet.</p>
        )}
        {bookings.map((b) => (
          <div key={b.id} className="ticket p-5 mt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{b.customerName} — {b.phone}</p>
                <p className="text-sm text-muted mt-1">{b.deviceType}: {b.issueDescription}</p>
                <p className="text-sm text-muted mt-1">{b.locality} · {b.preferredTime}</p>
              </div>
              <span className="ticket-number">{b.status?.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
