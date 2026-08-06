"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

type ProductRow = { id: string; name: string; price: number; stock: number };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", image: "" });
  const [loading, setLoading] = useState(false);

  async function loadProducts() {
    const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        images: form.image ? [form.image] : [],
        category: "general",
        createdAt: serverTimestamp(),
      });
      toast.success("Product added");
      setForm({ name: "", description: "", price: "", stock: "", image: "" });
      loadProducts();
    } catch {
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="font-display text-3xl font-bold mb-8">Products</h1>

      <form onSubmit={handleSubmit} className="ticket p-6 mt-4 space-y-4">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded border border-line bg-surface2 px-3 py-2"
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded border border-line bg-surface2 px-3 py-2"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Price (₹)"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="rounded border border-line bg-surface2 px-3 py-2"
            required
          />
          <input
            placeholder="Stock"
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="rounded border border-line bg-surface2 px-3 py-2"
            required
          />
        </div>
        <input
          placeholder="Image URL (Firebase Storage or any hosted image)"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          className="w-full rounded border border-line bg-surface2 px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-amber px-6 py-2.5 font-semibold text-ink hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>

      <div className="space-y-3 mt-10">
        {products.map((p) => (
          <div key={p.id} className="ticket p-4 mt-4 flex justify-between">
            <span>{p.name}</span>
            <span className="font-mono text-amber">₹{p.price} · {p.stock} in stock</span>
          </div>
        ))}
      </div>
    </div>
  );
}
