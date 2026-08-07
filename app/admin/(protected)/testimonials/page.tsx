"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdmin } from "@/components/AdminGuard";
import toast from "react-hot-toast";

type TestimonialRow = {
  id: string;
  customerName: string;
  location: string;
  device: string;
  service: string;
  rating: number;
  quote: string;
};

const EMPTY_FORM = {
  customerName: "",
  location: "",
  device: "",
  service: "",
  rating: "5",
  quote: "",
};

export default function AdminTestimonialsPage() {
  const { permissions } = useAdmin();

  if (!permissions.testimonials) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-14">
        <h1 className="font-display text-3xl font-bold mb-2">Testimonials</h1>
        <p className="text-muted">You don&apos;t have access to this section.</p>
      </div>
    );
  }

  return <TestimonialsManager />;
}

function TestimonialsManager() {
  const [items, setItems] = useState<TestimonialRow[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  async function load() {
    const snap = await getDocs(query(collection(db, "testimonials"), orderBy("createdAt", "desc")));
    setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "testimonials"), {
        customerName: form.customerName,
        location: form.location,
        device: form.device,
        service: form.service,
        rating: Number(form.rating),
        quote: form.quote,
        createdAt: serverTimestamp(),
      });
      toast.success("Testimonial added");
      setForm(EMPTY_FORM);
      load();
    } catch {
      toast.error("Failed to add testimonial");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Remove this testimonial?")) return;
    try {
      await deleteDoc(doc(db, "testimonials", id));
      toast.success("Testimonial removed");
      load();
    } catch {
      toast.error("Failed to remove testimonial");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <h1 className="font-display text-3xl font-bold mb-2">Testimonials</h1>
      <p className="text-muted mb-8">
        Add reviews you&apos;ve actually collected from real customers — over
        WhatsApp, in person, wherever. This section only appears on the site
        once at least one review exists here, and shows exactly what you
        enter — no invented names or numbers.
      </p>

      <form onSubmit={handleSubmit} className="ticket p-6 mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Customer name"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            className="rounded border border-line bg-surface2 px-3 py-2"
            required
          />
          <input
            placeholder="Location (e.g. Tirupathur)"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="rounded border border-line bg-surface2 px-3 py-2"
            required
          />
          <input
            placeholder="Device (e.g. Samsung Galaxy A54)"
            value={form.device}
            onChange={(e) => setForm({ ...form, device: e.target.value })}
            className="rounded border border-line bg-surface2 px-3 py-2"
            required
          />
          <input
            placeholder="Service (e.g. Screen Replacement)"
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
            className="rounded border border-line bg-surface2 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="text-sm text-muted">Rating</label>
          <select
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
            className="mt-1 w-full rounded border border-line bg-surface2 px-3 py-2"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n !== 1 && "s"}
              </option>
            ))}
          </select>
        </div>

        <textarea
          placeholder="What did they say?"
          value={form.quote}
          onChange={(e) => setForm({ ...form, quote: e.target.value })}
          rows={3}
          className="w-full rounded border border-line bg-surface2 px-3 py-2"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-amber px-6 py-2.5 font-semibold text-ink transition hover:brightness-110 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
        >
          {loading ? "Adding…" : "Add Testimonial"}
        </button>
      </form>

      <div className="space-y-3 mt-8">
        {items.map((t) => (
          <div key={t.id} className="ticket p-4 mt-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold">
                {t.customerName} <span className="text-muted font-normal">· {t.location}</span>
              </p>
              <p className="text-xs text-muted mt-1">
                {t.device} · {t.service} · {"★".repeat(t.rating)}
                {"☆".repeat(5 - t.rating)}
              </p>
              <p className="text-sm mt-2 text-muted italic">&ldquo;{t.quote}&rdquo;</p>
            </div>
            <button
              onClick={() => handleDelete(t.id)}
              className="text-sm text-danger hover:underline shrink-0"
            >
              Remove
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted mt-6">No testimonials added yet.</p>}
      </div>
    </div>
  );
}
