"use client";

import CatalogPreviewCard from "@/components/catalog/CatalogPreviewCard";
import { useProductCartStore } from "@/components/store/cartStore";
import { GoodsRow, mapGoodsToCatalog } from "@/lib/catalog/mapGoodsToCatalog";
import type { CatalogItem } from "@/types/catalog";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CategoryPage() {
  const params = useParams<{ category?: string }>() || {};
  const category = params.category ?? "";

  const { items, addItem, decrement } = useProductCartStore();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<CatalogItem[]>([]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_GOODS_CATALOG_URL;
    if (!url) {
      console.warn("[CategoryPage] NEXT_PUBLIC_GOODS_CATALOG_URL missing");
      setLoading(false);
      return;
    }

    const load = async () => {
      const rows = (await (await fetch(url)).json()) as GoodsRow[];
      const mapped = mapGoodsToCatalog(rows);
      const filtered = mapped.filter(
        (p) =>
          p.category.toLowerCase() === String(category).toLowerCase() ||
          p.category.toLowerCase().replace(/\s+/g, "-") ===
            String(category).toLowerCase()
      );
      setProducts(filtered);
      setLoading(false);
    };
    load();
  }, [category]);

  return (
    <section className="p-6">
      <h1 className="text-xl font-semibold mb-4 capitalize">
        {String(category).replace(/-/g, " ")}
      </h1>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((item) => {
            const cartItem = items.find((i) => i.id === item.id);
            const quantity = cartItem?.quantity ?? 0;

            return (
              <CatalogPreviewCard
                key={item.id}
                item={item}
                quantity={quantity}
                onIncrement={() =>
                  addItem({
                    id: item.id,
                    title: item.title,
                    price: item.price,
                  })
                }
                onDecrement={() => decrement(item.id)}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
