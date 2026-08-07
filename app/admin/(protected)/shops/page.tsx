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

type ShopRow = { id: string; name: string; phone?: string; address?: string };

export default function AdminShopsPage() {
  const { permissions } = useAdmin();

  if (!permissions.shops) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-14">
        <h1 className="font-display text-3xl font-bold mb-2">Shops</h1>
        <p className="text-muted">You don&apos;t have access to this section.</p>
      </div>
    );
  }

  return <ShopsManager />;
}

function ShopsManager() {
  const [shops, setShops] = useState<ShopRow[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);

  async function loadShops() {
    const snap = await getDocs(query(collection(db, "shops"), orderBy("name")));
    setShops(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  }

  useEffect(() => {
    loadShops();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "shops"), {
        name: form.name,
        phone: form.phone,
        address: form.address,
        createdAt: serverTimestamp(),
      });
      toast.success("Shop added");
      setForm({ name: "", phone: "", address: "" });
      loadShops();
    } catch {
      toast.error("Failed to add shop");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Remove this shop? Products already assigned to it keep the name on record.")) return;
    try {
      await deleteDoc(doc(db, "shops", id));
      toast.success("Shop removed");
      loadShops();
    } catch {
      toast.error("Failed to remove shop");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <h1 className="font-display text-3xl font-bold mb-2">Shops</h1>
      <p className="text-muted mb-8">
        Suppliers you source accessories from — assign these to products so
        you know where each item came from.
      </p>

      <form onSubmit={handleSubmit} className="ticket p-6 mt-4 space-y-4">
        <input
          placeholder="Shop name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded border border-line bg-surface2 px-3 py-2"
          required
        />
        <input
          placeholder="Phone (optional)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full rounded border border-line bg-surface2 px-3 py-2"
        />
        <input
          placeholder="Address (optional)"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full rounded border border-line bg-surface2 px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-amber px-6 py-2.5 font-semibold text-ink hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Shop"}
        </button>
      </form>

      <div className="space-y-3 mt-8">
        {shops.map((s) => (
          <div key={s.id} className="ticket p-4 mt-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold truncate">{s.name}</p>
              {(s.phone || s.address) && (
                <p className="text-xs text-muted mt-1 truncate">
                  {[s.phone, s.address].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <button
              onClick={() => handleDelete(s.id)}
              className="text-sm text-danger hover:underline shrink-0"
            >
              Remove
            </button>
          </div>
        ))}
        {shops.length === 0 && <p className="text-muted mt-6">No shops added yet.</p>}
      </div>
    </div>
  );
}
