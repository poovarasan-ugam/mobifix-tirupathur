"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminBackLink() {
  const pathname = usePathname();
  if (pathname === "/admin") return null;

  return (
    <div className="mx-auto max-w-6xl px-5 pt-6">
      <Link href="/admin" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>
    </div>
  );
}
