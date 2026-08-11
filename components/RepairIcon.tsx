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
  camera: (
    <>
      <rect x="4" y="10" width="24" height="16" rx="3" />
      <path d="M11 10 L13 6 L19 6 L21 10" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="18" r="5" />
    </>
  ),
  software: (
    <>
      <circle cx="16" cy="16" r="4.5" />
      <path d="M16 4 L16 8 M16 24 L16 28 M4 16 L8 16 M24 16 L28 16 M7.5 7.5 L10.3 10.3 M21.7 21.7 L24.5 24.5 M24.5 7.5 L21.7 10.3 M10.3 21.7 L7.5 24.5" strokeLinecap="round" />
    </>
  ),
  accessories: (
    <>
      <path d="M9 11 L9 8 a5 5 0 0 1 10 0 L19 11" strokeLinecap="round" />
      <rect x="5" y="11" width="18" height="16" rx="3" />
    </>
  ),
  case: (
    <>
      <rect x="9" y="3" width="14" height="26" rx="4.5" />
      <circle cx="16" cy="8.5" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  earphones: (
    <>
      <path d="M7 16 Q7 5 16 5 Q25 5 25 16" strokeLinecap="round" />
      <rect x="4" y="16" width="6" height="9" rx="2.5" />
      <rect x="22" y="16" width="6" height="9" rx="2.5" />
    </>
  ),
  cable: (
    <>
      <path d="M6 8 Q16 8 16 16 Q16 24 26 24" strokeLinecap="round" />
      <rect x="2.5" y="5" width="7" height="6" rx="1.8" />
      <rect x="22.5" y="21" width="7" height="6" rx="1.8" />
    </>
  ),
  powerbank: (
    <>
      <rect x="8" y="3" width="16" height="26" rx="3" />
      <path d="M18 9 L13 16 L16 16 L14 23 L20 15 L17 15 Z" strokeLinejoin="round" />
    </>
  ),
  protector: (
    <>
      <rect x="7" y="3" width="18" height="26" rx="4" />
      <path d="M11.5 9 L15.5 15" strokeLinecap="round" opacity="0.6" />
    </>
  ),
};

export type RepairIconKind =
  | "screen"
  | "battery"
  | "water"
  | "charging"
  | "camera"
  | "software"
  | "accessories"
  | "case"
  | "earphones"
  | "cable"
  | "powerbank"
  | "protector";

export default function RepairIcon({
  kind,
  className,
}: {
  kind: RepairIconKind;
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
