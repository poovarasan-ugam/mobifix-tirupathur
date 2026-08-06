"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) router.replace("/admin/login");
    });
    return unsub;
  }, [router]);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-14">
        <p className="text-muted">Checking access…</p>
      </div>
    );
  }

  return <>{children}</>;
}
