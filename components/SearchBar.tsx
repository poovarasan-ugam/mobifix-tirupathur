"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={className ?? (compact ? "w-full" : "mx-auto max-w-2xl px-5 pb-16")}
    >
      <div
        className={`flex items-center gap-2 rounded-full border border-line bg-surface transition focus-within:border-circuit ${
          compact ? "px-3.5 py-1.5" : "gap-3 px-5 py-3 shadow-sm focus-within:shadow-md"
        }`}
      >
        <svg
          viewBox="0 0 20 20"
          width={compact ? 15 : 18}
          height={compact ? 15 : 18}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="text-muted shrink-0"
        >
          <circle cx="8.5" cy="8.5" r="6" />
          <path d="M13 13 L18 18" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={compact ? "Search accessories…" : "Search accessories — cases, chargers, earphones…"}
          className={`flex-1 bg-transparent outline-none placeholder:text-muted ${compact ? "text-sm" : "text-sm"}`}
        />
        {!compact && (
          <button
            type="submit"
            className="rounded-full bg-amber px-4 py-1.5 text-sm font-semibold text-ink transition hover:brightness-110 active:scale-95"
          >
            Search
          </button>
        )}
      </div>
    </form>
  );
}
