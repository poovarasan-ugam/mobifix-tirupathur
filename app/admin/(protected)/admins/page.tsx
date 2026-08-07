"use client";

import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdmin } from "@/components/AdminGuard";
import toast from "react-hot-toast";

type Permissions = { products: boolean; shops: boolean; bookings: boolean };
type AdminRow = { email: string; role: "owner" | "subadmin"; permissions: Permissions };

const PERMISSION_AREAS: { key: keyof Permissions; label: string }[] = [
  { key: "products", label: "Products" },
  { key: "shops", label: "Shops" },
  { key: "bookings", label: "Bookings" },
];

const ALL_PERMISSIONS: Permissions = { products: true, shops: true, bookings: true };

export default function AdminAdminsPage() {
  const { user, role } = useAdmin();

  if (role !== "owner") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-14">
        <h1 className="font-display text-3xl font-bold mb-2">Sub-Admins</h1>
        <p className="text-muted">
          Only the owner account can manage admin access.
        </p>
      </div>
    );
  }

  return <AdminsManager currentEmail={user.email!} />;
}

function AdminsManager({ currentEmail }: { currentEmail: string }) {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [email, setEmail] = useState("");
  const [newPermissions, setNewPermissions] = useState<Permissions>(ALL_PERMISSIONS);
  const [loading, setLoading] = useState(false);

  async function loadAdmins() {
    const snap = await getDocs(collection(db, "admins"));
    setAdmins(
      snap.docs.map((d) => {
        const data = d.data() as any;
        const perms = data.permissions ?? {};
        return {
          email: d.id,
          role: data.role === "owner" ? "owner" : "subadmin",
          permissions: {
            products: perms.products ?? true,
            shops: perms.shops ?? true,
            bookings: perms.bookings ?? true,
          },
        };
      })
    );
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, "admins", email.trim().toLowerCase()), {
        role: "subadmin",
        permissions: newPermissions,
        addedBy: currentEmail,
        addedAt: serverTimestamp(),
      });
      toast.success("Sub-admin added");
      setEmail("");
      setNewPermissions(ALL_PERMISSIONS);
      loadAdmins();
    } catch {
      toast.error("Failed to add sub-admin");
    } finally {
      setLoading(false);
    }
  }

  async function handlePermissionToggle(targetEmail: string, key: keyof Permissions, value: boolean) {
    const target = admins.find((a) => a.email === targetEmail);
    if (!target) return;
    const updated = { ...target.permissions, [key]: value };
    setAdmins((prev) =>
      prev.map((a) => (a.email === targetEmail ? { ...a, permissions: updated } : a))
    );
    try {
      await setDoc(doc(db, "admins", targetEmail), { permissions: updated }, { merge: true });
    } catch {
      toast.error("Failed to update permissions");
      loadAdmins();
    }
  }

  async function handleRemove(targetEmail: string) {
    if (!window.confirm(`Remove admin access for ${targetEmail}?`)) return;
    try {
      await deleteDoc(doc(db, "admins", targetEmail));
      toast.success("Admin removed");
      loadAdmins();
    } catch {
      toast.error("Failed to remove admin");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <h1 className="font-display text-3xl font-bold mb-2">Sub-Admins</h1>
      <p className="text-muted mb-8">
        Choose exactly which sections each sub-admin can access. None of them
        ever see shop cost or profit figures — that stays owner-only.
      </p>

      <form onSubmit={handleAdd} className="ticket p-6 mt-4 space-y-4">
        <input
          type="email"
          placeholder="Google account email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-line bg-surface2 px-3 py-2"
          required
        />
        <div>
          <p className="text-sm text-muted mb-2">Access</p>
          <div className="flex gap-5 flex-wrap">
            {PERMISSION_AREAS.map((a) => (
              <label key={a.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newPermissions[a.key]}
                  onChange={(e) =>
                    setNewPermissions({ ...newPermissions, [a.key]: e.target.checked })
                  }
                  className="h-4 w-4 accent-circuit"
                />
                {a.label}
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-amber px-6 py-2.5 font-semibold text-ink hover:brightness-110 disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? "Adding..." : "Add Sub-Admin"}
        </button>
      </form>

      <div className="space-y-3 mt-8">
        {admins.map((a) => (
          <div key={a.email} className="ticket p-4 mt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {a.email}
                  {a.email === currentEmail && (
                    <span className="text-xs text-muted ml-2">(you)</span>
                  )}
                </p>
                <p className="text-xs text-muted mt-1 capitalize">{a.role}</p>
              </div>
              {a.email !== currentEmail && (
                <button
                  onClick={() => handleRemove(a.email)}
                  className="text-sm text-danger hover:underline shrink-0"
                >
                  Remove
                </button>
              )}
            </div>
            {a.role === "subadmin" && (
              <div className="flex gap-5 flex-wrap mt-3 pt-3 border-t border-line">
                {PERMISSION_AREAS.map((p) => (
                  <label key={p.key} className="flex items-center gap-2 text-sm text-muted">
                    <input
                      type="checkbox"
                      checked={a.permissions[p.key]}
                      onChange={(e) => handlePermissionToggle(a.email, p.key, e.target.checked)}
                      className="h-4 w-4 accent-circuit"
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
