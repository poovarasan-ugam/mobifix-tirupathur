export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 grid gap-10 md:grid-cols-2">
      <div className="aspect-square w-full rounded-lg bg-surface2 animate-pulse" />
      <div className="animate-pulse">
        <div className="h-3 w-24 rounded bg-surface2" />
        <div className="h-8 w-2/3 rounded bg-surface2 mt-4" />
        <div className="h-6 w-20 rounded bg-surface2 mt-5" />
        <div className="h-4 w-full rounded bg-surface2 mt-6" />
        <div className="h-4 w-5/6 rounded bg-surface2 mt-2" />
        <div className="h-4 w-24 rounded bg-surface2 mt-4" />
        <div className="h-11 w-40 rounded-md bg-surface2 mt-8" />
      </div>
    </div>
  );
}
