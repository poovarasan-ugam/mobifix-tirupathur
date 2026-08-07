const paths: Record<string, JSX.Element> = {
  doorstep: (
    <>
      <path d="M5 15 L16 6 L27 15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13 L8 26 L24 26 L24 13" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 26 L13 19 L19 19 L19 26" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  certified: (
    <>
      <path d="M16 4 L26 8 L26 15 C26 22 21 26.5 16 28 C11 26.5 6 22 6 15 L6 8 Z" strokeLinejoin="round" />
      <path d="M11.5 16 L14.5 19 L21 12.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  inspection: (
    <>
      <circle cx="13.5" cy="13.5" r="8" />
      <path d="M19.5 19.5 L27 27" strokeLinecap="round" />
      <path d="M10 13.5 L13.5 13.5 L13.5 10" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </>
  ),
  genuine: (
    <>
      <path d="M16 4 L27 9.5 L27 20.5 L16 26 L5 20.5 L5 9.5 Z" strokeLinejoin="round" />
      <path d="M5 9.5 L16 15 L27 9.5 M16 15 L16 26" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export default function FeatureIcon({
  kind,
  className,
}: {
  kind: "doorstep" | "certified" | "inspection" | "genuine";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width="26"
      height="26"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      {paths[kind]}
    </svg>
  );
}
