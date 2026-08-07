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
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  shopId?: string;
  shopName?: string;
  costPrice?: number;
};

const EMPTY_FORM = {
  name: "",
  description: "",
  originalPrice: "",
  price: "",
  stock: "",
  shopId: "",
  costPrice: "",
};

export default function AdminProductsPage() {
  const { permissions } = useAdmin();

  if (!permissions.products) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-14">
        <h1 className="font-display text-3xl font-bold mb-2">Products</h1>
        <p className="text-muted">You don&apos;t have access to this section.</p>
      </div>
    );
  }

  return <ProductsManager />;
}

function ProductsManager() {
  const { role } = useAdmin();
  const isOwner = role === "owner";

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [shops, setShops] = useState<ShopOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingImages, setEditingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function loadShops() {
    const snap = await getDocs(query(collection(db, "shops"), orderBy("name")));
    setShops(snap.docs.map((d) => ({ id: d.id, name: (d.data() as any).name })));
  }

  async function loadProducts() {
    const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
    const base = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ProductRow[];

    const shopSnap = await getDocs(collection(db, "productShops"));
    const shopMap = new Map(
      shopSnap.docs.map((d) => {
        const data = d.data() as any;
        return [d.id, { shopId: data.shopId as string, shopName: data.shopName as string }];
      })
    );

    let costMap = new Map<string, number>();
    if (isOwner) {
      const costSnap = await getDocs(collection(db, "productCosts"));
      costMap = new Map(costSnap.docs.map((d) => [d.id, (d.data() as any).costPrice as number]));
    }

    setProducts(
      base.map((p) => ({
        ...p,
        shopId: shopMap.get(p.id)?.shopId,
        shopName: shopMap.get(p.id)?.shopName,
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

  function resetForm() {
    setForm(EMPTY_FORM);
    photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setEditingId(null);
    setEditingImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleEditClick(p: ProductRow) {
    setEditingId(p.id);
    setEditingImages(p.images ?? []);
    setForm({
      name: p.name,
      description: p.description ?? "",
      originalPrice: p.originalPrice != null ? String(p.originalPrice) : "",
      price: String(p.price),
      stock: String(p.stock),
      shopId: p.shopId ?? "",
      costPrice: p.costPrice != null ? String(p.costPrice) : "",
    });
    photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setPhotoFiles([]);
    setPhotoPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const productRef = editingId ? doc(db, "products", editingId) : doc(collection(db, "products"));

      let imageUrls: string[] | null = null;
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

      if (editingId) {
        batch.update(productRef, {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
          stock: Number(form.stock),
          ...(imageUrls ? { images: imageUrls } : {}),
        });
      } else {
        batch.set(productRef, {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
          stock: Number(form.stock),
          images: imageUrls ?? [],
          category: "general",
          createdAt: serverTimestamp(),
        });
      }

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
      toast.success(editingId ? "Product updated" : "Product added");
      resetForm();
      loadProducts();
    } catch {
      toast.error(editingId ? "Failed to update product" : "Failed to add product");
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
      if (editingId === id) resetForm();
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

      <form ref={formRef} onSubmit={handleSubmit} className="ticket p-6 mt-4 space-y-4">
        {editingId && (
          <div className="flex items-center justify-between rounded bg-surface2 px-3 py-2 text-sm">
            <span className="text-muted">Editing an existing product</span>
            <button type="button" onClick={resetForm} className="text-circuit font-semibold hover:underline">
              Cancel
            </button>
          </div>
        )}

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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted">Original price (₹)</label>
            <input
              type="number"
              value={form.originalPrice}
              onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
              placeholder="Optional — shown crossed out"
              className="mt-1 w-full rounded border border-line bg-surface2 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-muted">Selling price (₹)</label>
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
            {editingId && " (leave empty to keep existing photos)"}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotosChange}
            className="mt-1 w-full rounded border border-line bg-surface2 px-3 py-2 text-sm"
          />

          {editingId && photoPreviews.length === 0 && editingImages.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted mb-2">Current photos</p>
              <div className="flex gap-2 flex-wrap">
                {editingImages.map((src) => (
                  <div key={src} className="relative h-20 w-20 rounded overflow-hidden border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="Current product photo" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-amber px-6 py-2.5 font-semibold text-ink transition hover:brightness-110 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100"
          >
            {uploading
              ? "Uploading photos…"
              : loading
              ? editingId
                ? "Saving…"
                : "Adding…"
              : editingId
              ? "Save Changes"
              : "Add Product"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-line px-6 py-2.5 font-semibold text-ink hover:border-circuit hover:text-circuit"
            >
              Cancel
            </button>
          )}
        </div>
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
                <p className="font-mono">
                  {p.originalPrice != null && p.originalPrice > p.price && (
                    <span className="text-muted line-through mr-1.5">₹{p.originalPrice}</span>
                  )}
                  <span className="text-amber">₹{p.price}</span>
                </p>
                {isOwner && (
                  <p className="text-xs text-muted mt-1">
                    {p.costPrice != null ? `Cost ₹${p.costPrice} · Profit ₹${profit}` : "No cost set"}
                  </p>
                )}
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => handleEditClick(p)}
                  className="text-sm text-circuit hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-sm text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
        {products.length === 0 && <p className="text-muted mt-6">No products yet.</p>}
      </div>
    </div>
  );
}
