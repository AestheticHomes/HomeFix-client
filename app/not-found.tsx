import SafeViewport from "@/components/layout/SafeViewport";
import { Compass, Home, Package } from "lucide-react";
import Link from "next/link";

const ACTIONS = [
  {
    href: "/",
    label: "Back to Home",
    description: "Browse curated services and featured projects.",
    Icon: Home,
  },
  {
    href: "/my-orders",
    label: "View My Orders",
    description: "Check recent bookings, invoices, and statuses.",
    Icon: Package,
  },
];

export default function NotFound() {
  return (
    <SafeViewport>
      <section className="w-full flex flex-col items-center justify-center text-center gap-8 py-24">
        <div className="relative max-w-2xl p-8 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-card)]/80 dark:bg-[var(--surface-card-dark)]/80 shadow-[0_10px_40px_rgba(90,93,240,0.15)]">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-[var(--surface-hover)] dark:bg-[var(--surface-dark)] text-[var(--accent-primary)]">
            <Compass className="w-8 h-8" />
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-muted)]">
            404 · Not Found
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
            This route drifted off the HomeFix map.
          </h1>
          <p className="mt-4 text-base text-[var(--text-secondary)] leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or moved to a new
            galaxy. Use one of the quick links below to get back on track.
          </p>
        </div>

        <div className="grid w-full max-w-3xl gap-4 md:grid-cols-2">
          {ACTIONS.map(({ href, label, description, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-light)] dark:bg-[var(--surface-dark)] px-5 py-4 text-left transition hover:border-[var(--accent-primary)]/60 hover:shadow-[0_8px_24px_rgba(90,93,240,0.15)]"
            >
              <div className="flex items-center gap-2 text-[var(--accent-primary)]">
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{label}</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </SafeViewport>
  );
}
