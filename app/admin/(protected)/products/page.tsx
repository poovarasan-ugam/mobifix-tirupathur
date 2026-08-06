"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAdmin } from "@/components/AdminGuard";
import toast from "react-hot-toast";

const MAX_PHOTOS = 4;

type ShopOption = { id: string; name: string };

type ProductRow = {
  id: string;
  name: string;
  price: number;
  stock: number;
  shopName?: string;
  costPrice?: number;
};

export default function AdminProductsPage() {
  const { role } = useAdmin();
  const isOwner = role === "owner";

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [shops, setShops] = useState<ShopOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    shopId: "",
    costPrice: "",
  });

  async function loadShops() {
    const snap = await getDocs(query(collection(db, "shops"), orderBy("name")));
    setShops(snap.docs.map((d) => ({ id: d.id, name: (d.data() as any).name })));
  }

  async function loadProducts() {
    const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
    const base = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ProductRow[];

    const shopSnap = await getDocs(collection(db, "productShops"));
    const shopMap = new Map(
      shopSnap.docs.map((d) => [d.id, (d.data() as any).shopName as string])
    );

    let costMap = new Map<string, number>();
    if (isOwner) {
      const costSnap = await getDocs(collection(db, "productCosts"));
      costMap = new Map(costSnap.docs.map((d) => [d.id, (d.data() as any).costPrice as number]));
    }

    setProducts(
      base.map((p) => ({
        ...p,
        shopName: shopMap.get(p.id),
        costPrice: costMap.get(p.id),
      }))
    );
  }

  useEffect(() => {
    loadShops();
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePhotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS);
    photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setPhotoFiles(files);
    setPhotoPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const productRef = doc(collection(db, "products"));

      let imageUrls: string[] = [];
      if (photoFiles.length > 0) {
        setUploading(true);
        imageUrls = await Promise.all(
          photoFiles.map(async (file, i) => {
            const imgRef = ref(storage, `products/${productRef.id}/${i}-${file.name}`);
            await uploadBytes(imgRef, file);
            return getDownloadURL(imgRef);
          })
        );
        setUploading(false);
      }

      const batch = writeBatch(db);

      batch.set(productRef, {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        images: imageUrls,
        category: "general",
        createdAt: serverTimestamp(),
      });

      const shop = shops.find((s) => s.id === form.shopId);
      if (shop) {
        batch.set(doc(db, "productShops", productRef.id), {
          shopId: shop.id,
          shopName: shop.name,
        });
      }

      if (isOwner && form.costPrice) {
        batch.set(doc(db, "productCosts", productRef.id), {
          costPrice: Number(form.costPrice),
        });
      }

      await batch.commit();
      toast.success("Product added");
      setForm({ name: "", description: "", price: "", stock: "", shopId: "", costPrice: "" });
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
      setPhotoFiles([]);
      setPhotoPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadProducts();
    } catch {
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Remove this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      await deleteDoc(doc(db, "productShops", id)).catch(() => {});
      if (isOwner) {
        await deleteDoc(doc(db, "productCosts", id)).catch(() => {});
      }
      toast.success("Product removed");
      loadProducts();
    } catch {
      toast.error("Failed to remove product");
    }
  }

  const totalPotentialProfit = products.reduce(
    (sum, p) => sum + (p.costPrice != null ? (p.price - p.costPrice) * p.stock : 0),
    0
  );

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="font-display text-3xl font-bold mb-2">Products</h1>
      <p className="text-muted mb-8">
        {isOwner
          ? "Add products, assign a shop, and track cost vs. selling price."
          : "Add products and assign the shop they were sourced from."}
      </p>

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

        <div>
          <label className="text-sm text-muted">Sourced from shop</label>
          <select
            value={form.shopId}
            onChange={(e) => setForm({ ...form, shopId: e.target.value })}
            className="mt-1 w-full rounded border border-line bg-surface2 px-3 py-2"
          >
            <option value="">— No shop assigned —</option>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {shops.length === 0 && (
            <p className="text-xs text-muted mt-1">
              No shops added yet — add one on the Shops page first.
            </p>
          )}
        </div>

        <div className={`grid gap-4 ${isOwner ? "grid-cols-3" : "grid-cols-2"}`}>
          <div>
            <label className="text-sm text-muted">Publish price (₹)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="mt-1 w-full rounded border border-line bg-surface2 px-3 py-2"
              required
            />
          </div>
          {isOwner && (
            <div>
              <label className="text-sm text-muted">Shop cost (₹)</label>
              <input
                type="number"
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                className="mt-1 w-full rounded border border-line bg-surface2 px-3 py-2"
              />
            </div>
          )}
          <div>
            <label className="text-sm text-muted">Stock</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="mt-1 w-full rounded border border-line bg-surface2 px-3 py-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-muted">
            Photos — add {MAX_PHOTOS} for best results
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotosChange}
            className="mt-1 w-full rounded border border-line bg-surface2 px-3 py-2 text-sm"
          />
          {photoPreviews.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {photoPreviews.map((src, i) => (
                <div key={src} className="relative h-20 w-20 rounded overflow-hidden border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-0.5 right-0.5 rounded-full bg-black/60 text-white text-xs h-5 w-5 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-amber px-6 py-2.5 font-semibold text-ink hover:brightness-110 disabled:opacity-50"
        >
          {uploading ? "Uploading photos…" : loading ? "Adding…" : "Add Product"}
        </button>
      </form>

      {isOwner && products.length > 0 && (
        <div className="ticket p-4 mt-8 flex items-center justify-between">
          <span className="text-sm text-muted">Total potential profit (current stock)</span>
          <span className="font-mono text-lg text-amber">
            ₹{totalPotentialProfit.toLocaleString("en-IN")}
          </span>
        </div>
      )}

      <div className="space-y-3 mt-8">
        {products.map((p) => {
          const profit = isOwner && p.costPrice != null ? p.price - p.costPrice : null;
          return (
            <div key={p.id} className="ticket p-4 mt-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold truncate">{p.name}</p>
                <p className="text-xs text-muted mt-1">
                  {p.shopName ? `From ${p.shopName}` : "No shop assigned"} · {p.stock} in stock
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-amber">₹{p.price}</p>
                {isOwner && (
                  <p className="text-xs text-muted mt-1">
                    {p.costPrice != null ? `Cost ₹${p.costPrice} · Profit ₹${profit}` : "No cost set"}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-sm text-danger hover:underline shrink-0"
              >
                Remove
              </button>
            </div>
          );
        })}
        {products.length === 0 && <p className="text-muted mt-6">No products yet.</p>}
      </div>
    </div>
  );
}
