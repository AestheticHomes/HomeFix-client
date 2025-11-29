"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { ServiceDefinition } from "@/lib/servicesConfig";

export default function ServiceMediaGallery({ service }: { service: ServiceDefinition }) {
  const [items, setItems] = useState(service.gallery ?? []);
  const [loading, setLoading] = useState(!service.gallery);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (service.gallery && service.gallery.length > 0) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/services/media/${service.slug}`);
        if (!res.ok) {
          if (!cancelled) setItems([]);
          return;
        }
        const json = await res.json();
        if (!cancelled) setItems(json.files ?? []);
      } catch (e) {
        console.error("Gallery fetch failed", e);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [service.slug, service.gallery]);

  const ITEMS_PER_PAGE = 3;
  const pageCount = Math.ceil(items.length / ITEMS_PER_PAGE);
  const clampedPage = Math.min(page, Math.max(pageCount - 1, 0));
  const pagedItems = items.slice(
    clampedPage * ITEMS_PER_PAGE,
    clampedPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPage(0);
  }, [items]);

  if (loading || items.length === 0) return null;

  return (
    <section className="mt-8 space-y-4">
      {items.length > ITEMS_PER_PAGE && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={clampedPage === 0}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-soft)] disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(p + 1, Math.max(pageCount - 1, 0)))}
            disabled={clampedPage >= pageCount - 1}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-soft)] disabled:opacity-50"
          >
            Next
          </button>
          <span className="text-xs text-[var(--text-secondary)]">
            Page {clampedPage + 1} of {pageCount}
          </span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {pagedItems.map((item: any) => (
          <article key={item.src} className="overflow-hidden rounded-xl">
            {item.type === "image" ? (
              <Image
                src={item.src}
                alt={item.alt ?? service.name}
                width={1200}
                height={800}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <video src={item.src} controls className="w-full h-full object-cover" />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
