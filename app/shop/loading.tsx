export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <div className="h-9 w-40 rounded bg-surface2 animate-pulse" />
      <div className="h-5 w-72 rounded bg-surface2 animate-pulse mt-3" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="ticket p-4 mt-4 animate-pulse">
            <div className="aspect-square w-full rounded bg-surface2" />
            <div className="h-3 w-16 rounded bg-surface2 mt-3" />
            <div className="h-4 w-3/4 rounded bg-surface2 mt-2" />
            <div className="h-4 w-12 rounded bg-surface2 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
