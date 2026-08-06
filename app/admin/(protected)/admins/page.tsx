"use client";

import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdmin } from "@/components/AdminGuard";
import toast from "react-hot-toast";

type AdminRow = { email: string; role: "owner" | "subadmin" };

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
  const [loading, setLoading] = useState(false);

  async function loadAdmins() {
    const snap = await getDocs(collection(db, "admins"));
    setAdmins(
      snap.docs.map((d) => ({
        email: d.id,
        role: (d.data() as any).role === "owner" ? "owner" : "subadmin",
      }))
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
        addedBy: currentEmail,
        addedAt: serverTimestamp(),
      });
      toast.success("Sub-admin added");
      setEmail("");
      loadAdmins();
    } catch {
      toast.error("Failed to add sub-admin");
    } finally {
      setLoading(false);
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
        Sub-admins can manage products, shops, and bookings — they never see
        shop cost or profit figures.
      </p>

      <form onSubmit={handleAdd} className="ticket p-6 mt-4 flex gap-3">
        <input
          type="email"
          placeholder="Google account email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded border border-line bg-surface2 px-3 py-2"
          required
        />
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
          <div key={a.email} className="ticket p-4 mt-4 flex items-center justify-between gap-4">
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
        ))}
      </div>
    </div>
  );
}
