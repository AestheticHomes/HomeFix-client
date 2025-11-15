import SafeViewport from "@/components/layout/SafeViewport";

export default function NotFound() {
  return (
    <SafeViewport align="center">
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-sm tracking-[0.2em] uppercase text-[var(--text-muted)]">
          404 — Not Found
        </p>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          The page you’re looking for doesn’t exist.
        </h1>
      </div>
    </SafeViewport>
  );
}
