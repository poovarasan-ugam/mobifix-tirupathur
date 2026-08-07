"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdmin } from "@/components/AdminGuard";

export default function AdminPage() {
  const router = useRouter();
  const { user, role, permissions } = useAdmin();

  async function handleSignOut() {
    await signOut(auth);
    router.push("/admin/login");
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted mt-1">
            {user.email} · <span className="capitalize">{role}</span>
          </p>
        </div>
        <button onClick={handleSignOut} className="text-sm text-muted hover:text-amber">
          Sign out
        </button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {permissions.bookings && (
          <Link href="/admin/bookings" className="ticket p-6 mt-4 block hover:border-circuit">
            <p className="font-display font-bold text-lg">Repair Bookings</p>
            <p className="text-sm text-muted mt-1">View and manage incoming repair leads</p>
          </Link>
        )}
        {permissions.products && (
          <Link href="/admin/products" className="ticket p-6 mt-4 block hover:border-circuit">
            <p className="font-display font-bold text-lg">Products</p>
            <p className="text-sm text-muted mt-1">Add and remove accessories for sale</p>
          </Link>
        )}
        {permissions.shops && (
          <Link href="/admin/shops" className="ticket p-6 mt-4 block hover:border-circuit">
            <p className="font-display font-bold text-lg">Shops</p>
            <p className="text-sm text-muted mt-1">Manage suppliers you source products from</p>
          </Link>
        )}
        {role === "owner" && (
          <Link href="/admin/admins" className="ticket p-6 mt-4 block hover:border-circuit">
            <p className="font-display font-bold text-lg">Sub-Admins</p>
            <p className="text-sm text-muted mt-1">Add or remove admin access for others</p>
          </Link>
        )}
      </div>
    </div>
  );
}
