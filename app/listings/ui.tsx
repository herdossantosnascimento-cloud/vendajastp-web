"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchListings, Listing } from "@/lib/listings";
import { CATEGORIES } from "@/lib/categories";

function priceText(p?: string | number) {
  const s = String(p ?? "").trim();
  if (!s) return "";
  const n = Number(s.replace(/[^\d]/g, ""));
  if (!Number.isFinite(n) || n === 0) return s;
  return n.toLocaleString("pt-PT");
}

function categoryLabel(id?: string) {
  const s = String(id ?? "").trim();
  if (!s) return "";
  return CATEGORIES.find((c) => c.id === s)?.label ?? s;
}

function ListingCard({ item }: { item: Listing }) {
  const img = item.imageUrl || item.images?.[0] || "";

  return (
    <Link
      href={`/listings/${item.id}`}
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="h-44 w-full overflow-hidden bg-gray-100 md:h-52">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
            Sem foto
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="line-clamp-1 text-sm font-extrabold text-gray-900">{item.title}</div>

        <div className="mt-1 flex items-end justify-between gap-3">
          <div className="text-sm font-bold text-emerald-700">
            {priceText(item.price)} {String(item.price ?? "").trim() ? "STN" : ""}
          </div>
          <div className="text-xs text-gray-500 line-clamp-1">{item.location}</div>
        </div>

        <div className="mt-2 text-xs text-gray-600">{categoryLabel(item.category)}</div>
      </div>
    </Link>
  );
}

export default function ListingsUI() {
  const searchParams = useSearchParams();
  const cat = String(searchParams.get("cat") ?? "").trim();

  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const title = useMemo(() => {
    if (!cat) return "Anúncios";
    return `Anúncios — ${categoryLabel(cat)}`;
  }, [cat]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchListings({ limit: 60, category: cat || undefined });
        if (alive) setItems(data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [cat]);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-600">A carregar…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4">
        <div className="text-lg font-extrabold text-gray-900">{title}</div>
        {cat ? (
          <div className="text-xs text-gray-500">Filtro ativo: {categoryLabel(cat)}</div>
        ) : (
          <div className="text-xs text-gray-500">Sem filtro</div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-700 shadow-sm">
          <div className="text-base font-bold text-gray-900">Não há anúncios nesta categoria.</div>
          <div className="mt-1 text-sm text-gray-600">
            {cat ? `Categoria: ${categoryLabel(cat)}` : "Tenta escolher uma categoria no início."}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/new"
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-extrabold text-white hover:opacity-95"
            >
              Publicar anúncio
            </Link>
            {cat ? (
              <Link
                href="/listings"
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Limpar filtro
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((it) => (
            <ListingCard key={it.id} item={it} />
          ))}
        </div>
      )}
    </div>
  );
}
