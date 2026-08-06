"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminPage() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut(auth);
    router.push("/admin/login");
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleSignOut}
          className="text-sm text-muted hover:text-amber"
        >
          Sign out
        </button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Link href="/admin/bookings" className="ticket p-6 mt-4 block hover:border-circuit">
          <p className="font-display font-bold text-lg">Repair Bookings</p>
          <p className="text-sm text-muted mt-1">View and manage incoming repair leads</p>
        </Link>
        <Link href="/admin/products" className="ticket p-6 mt-4 block hover:border-circuit">
          <p className="font-display font-bold text-lg">Products</p>
          <p className="text-sm text-muted mt-1">Add and edit accessories for sale</p>
        </Link>
      </div>
    </div>
  );
}
