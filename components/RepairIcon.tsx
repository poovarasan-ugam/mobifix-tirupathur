const paths: Record<string, JSX.Element> = {
  screen: (
    <>
      <rect x="8" y="4" width="16" height="24" rx="2.5" />
      <path d="M11 11 L16 17 L13.5 17 L18 24" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  battery: (
    <>
      <rect x="4" y="11" width="21" height="10" rx="2" />
      <path d="M25 14 L27.5 14 L27.5 18 L25 18" />
      <path d="M13 13.5 L10 16.5 L13 16.5 L10 19.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  water: <path d="M16 4 C10.5 11.5 7 17 7 21 a9 9 0 0 0 18 0 C25 17 21.5 11.5 16 4 Z" strokeLinejoin="round" />,
  charging: (
    <>
      <rect x="6" y="9" width="14" height="14" rx="2.5" />
      <path d="M12 13.5 L9.5 17 L12.5 17 L10 20.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23 12 L27 12 M23 15.5 L27 15.5 M23 19 L27 19" strokeLinecap="round" opacity="0.55" />
    </>
  ),
};

export default function RepairIcon({
  kind,
  className,
}: {
  kind: "screen" | "battery" | "water" | "charging";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width="24"
      height="24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      {paths[kind]}
    </svg>
  );
}
