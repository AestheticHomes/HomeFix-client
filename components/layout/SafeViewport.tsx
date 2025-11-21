"use client";

export default function SafeViewport({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1200px] 2xl:max-w-[1360px] px-3 sm:px-4 lg:px-8">
      {children}
    </div>
  );
}
