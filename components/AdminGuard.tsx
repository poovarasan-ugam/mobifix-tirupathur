"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type AdminRole = "owner" | "subadmin";
export type AdminPermissions = { products: boolean; shops: boolean; bookings: boolean };

type AdminContextType = { user: User; role: AdminRole; permissions: AdminPermissions };

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminGuard");
  return ctx;
}

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AdminContextType | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u || !u.email) {
        setState(null);
        router.replace("/admin/login");
        return;
      }
      try {
        const snap = await getDoc(doc(db, "admins", u.email));
        if (!snap.exists()) {
          await signOut(auth);
          setState(null);
          router.replace("/admin/login?denied=1");
          return;
        }
        const data = snap.data();
        const role: AdminRole = data.role === "owner" ? "owner" : "subadmin";
        const perms = data.permissions ?? {};
        const permissions: AdminPermissions =
          role === "owner"
            ? { products: true, shops: true, bookings: true }
            : {
                products: perms.products ?? true,
                shops: perms.shops ?? true,
                bookings: perms.bookings ?? true,
              };
        setState({ user: u, role, permissions });
      } catch {
        await signOut(auth);
        setState(null);
        router.replace("/admin/login?denied=1");
      }
    });
    return unsub;
  }, [router]);

  if (!state) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-14">
        <p className="text-muted">Checking access…</p>
      </div>
    );
  }

  return <AdminContext.Provider value={state}>{children}</AdminContext.Provider>;
}
