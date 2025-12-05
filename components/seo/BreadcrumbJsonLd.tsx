import JsonLd from "./JsonLd";

type BreadcrumbItem = { name: string; url: string };

/**
 * SEO: BreadcrumbList JSON-LD helper for SSR pages.
 */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
