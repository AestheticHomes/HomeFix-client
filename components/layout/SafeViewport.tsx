"use client";

type Align = "center" | "left";

export default function SafeViewport({
  children,
  align = "center",
  className = "",
}: {
  children: React.ReactNode;
  align?: Align;
  className?: string;
}) {
  const alignment =
    align === "left"
      ? "mx-0"
      : "mx-auto max-w-[1360px] 2xl:max-w-[1360px]";

  return (
    <div
      className={`w-full ${alignment} px-4 sm:px-6 lg:px-8 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
