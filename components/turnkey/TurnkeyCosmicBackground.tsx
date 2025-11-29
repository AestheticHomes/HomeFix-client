// components/turnkey/TurnkeyCosmicBackground.tsx
// Soft gradient + dotted mesh background that matches the site’s cosmic style.

export function TurnkeyCosmicBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* gradient wash */}
      <div className="absolute -top-32 left-1/2 h-72 w-[80%] -translate-x-1/2 rounded-[999px] bg-gradient-to-r from-indigo-200/70 via-sky-100/60 to-fuchsia-100/60 blur-3xl" />

      {/* radial glows */}
      <div className="absolute bottom-[-120px] left-[-80px] h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="absolute bottom-[-160px] right-[-60px] h-72 w-72 rounded-full bg-fuchsia-200/40 blur-3xl" />

      {/* dotted mesh */}
    </div>
  );
}
