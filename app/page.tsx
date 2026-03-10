"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { fetchListings, type Listing } from "@/lib/listings";

function priceText(p?: string | number) {
  const s = String(p ?? "").trim();
  if (!s) return "";
  const n = Number(s.replace(/[^\d]/g, ""));
  if (!Number.isFinite(n) || n === 0) return s;
  return n.toLocaleString("pt-PT");
}

function isFeaturedActive(item: any) {
  if (!item?.featured) return false;

  const featuredUntil = item?.featuredUntil;
  if (!featuredUntil) return !!item?.featured;

  try {
    const date =
      typeof featuredUntil?.toDate === "function"
        ? featuredUntil.toDate()
        : featuredUntil instanceof Date
          ? featuredUntil
          : null;

    if (!date) return !!item?.featured;
    return date.getTime() > Date.now();
  } catch {
    return !!item?.featured;
  }
}

function ListingMiniCard({ item }: { item: Listing }) {
  const img = item.imageUrl || item.images?.[0] || "";
  const featuredActive = isFeaturedActive(item);

  return (
    <Link
      href={`/listings/${item.id}`}
      className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
        featuredActive ? "border-amber-300 ring-1 ring-amber-200" : "border-gray-200"
      }`}
    >
      <div className="h-36 w-full overflow-hidden bg-gray-100">
        {img ? (
          <img src={img} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
            Sem foto
          </div>
        )}
      </div>

      <div className="p-4">
        {featuredActive ? (
          <div className="mb-2 inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-amber-800">
            ⭐ Destacado
          </div>
        ) : null}

        <div className="line-clamp-1 text-sm font-extrabold text-gray-900">{item.title}</div>

        <div className="mt-1 text-sm font-bold text-emerald-700">
          {priceText(item.price)} {String(item.price ?? "").trim() ? "STN" : ""}
        </div>

        <div className="mt-1 text-xs text-gray-500">{item.location}</div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingListings(true);
        const data = await fetchListings({ limit: 12 });
        if (!alive) return;
        setItems(data);
      } catch {
        if (!alive) return;
        setItems([]);
      } finally {
        if (alive) setLoadingListings(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const featuredItems = useMemo(
    () => items.filter((item) => isFeaturedActive(item)).slice(0, 4),
    [items]
  );

  const latestItems = useMemo(
    () => items.filter((item) => !isFeaturedActive(item)).slice(0, 8),
    [items]
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6">
          <h1 className="text-2xl font-bold">
            Compra, vende e encontra serviços em São Tomé e Príncipe
          </h1>

          <p className="mt-3 text-sm opacity-70">
            Veículos, imóveis, aluguer de carros, vestuário, quartos, guest house,
            bens e serviços — tudo num só lugar.
          </p>

          <div className="mt-5 flex gap-3">
            <Link
              href="/listings"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Ver anúncios
            </Link>

            <Link
              href="/new"
              className="rounded-xl border px-4 py-2 text-sm font-semibold"
            >
              Publicar agora
            </Link>
          </div>

          <div className="mt-5 rounded-xl border border-yellow-300 bg-yellow-200 p-3 text-xs text-yellow-950">
            Dica de segurança: evita pagamentos adiantados. Confirma o vendedor e o
            produto/serviço antes de transferir dinheiro.
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Categorias</h2>

          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/listings?cat=${encodeURIComponent(cat.id)}`}
                className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50 transition"
              >
                {cat.label}
              </Link>
            ))}
          </div>

          <p className="mt-5 text-xs opacity-70">
            A tua plataforma de classificados e marketplace para STP 🇸🇹
          </p>
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">⭐ Anúncios Destacados</h2>
            <p className="text-sm text-gray-600">Os anúncios promovidos aparecem primeiro.</p>
          </div>

          <Link
            href="/listings"
            className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Ver todos
          </Link>
        </div>

        {loadingListings ? (
          <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
            A carregar anúncios…
          </div>
        ) : featuredItems.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
            Ainda não há anúncios destacados.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredItems.map((item) => (
              <ListingMiniCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Anúncios Recentes</h2>
            <p className="text-sm text-gray-600">Os anúncios mais recentes da plataforma.</p>
          </div>
        </div>

        {loadingListings ? (
          <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
            A carregar anúncios…
          </div>
        ) : latestItems.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
            Ainda não há anúncios publicados.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latestItems.map((item) => (
              <ListingMiniCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
