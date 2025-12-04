"use client";
/**
 * SafeViewport: canonical scrollable content region.
 * Keeps horizontal gutters + bottom padding so content never hides behind the docked nav.
 */

export default function SafeViewport({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative mx-auto w-full max-w-[1200px] 2xl:max-w-[1360px] px-3 sm:px-4 lg:px-8 flex-1 min-h-screen overflow-y-auto"
      style={{ paddingBottom: "calc(var(--mbnav-h,72px) + 24px)", paddingTop: "16px" }}
    >
      {children}
    </div>
  );
}
