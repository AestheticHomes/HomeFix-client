export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--surface-base)] text-center px-6">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Page not found
        </p>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          We couldn&apos;t find the page you were looking for.
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Please check the URL or go back to the homepage.
        </p>
      </div>
    </main>
  );
}
