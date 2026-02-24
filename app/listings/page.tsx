"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchListings, Listing } from "../lib/listings";

function formatPrice(price: string) {
  const v = Number((price || "").trim());
  if (!Number.isFinite(v) || v <= 0) return "A negociar";
  return `${v.toLocaleString("pt-PT")} Dobras`;
}

export default function ListingsPage() {
  const params = useSearchParams();
  const newId = params.get("new");

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [highlightId, setHighlightId] = useState<string | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    fetchListings()
      .then((data) => setListings(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const l of listings) set.add(l.category);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt"));
  }, [listings]);

  useEffect(() => {
    if (!newId) return;

    setHighlightId(newId);

    const t1 = setTimeout(() => {
      itemRefs.current[newId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);

    const t2 = setTimeout(() => setHighlightId(null), 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [newId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((l) => {
      const matchCategory = category ? l.category === category : true;
      const matchQuery = q
        ? `${l.title} ${l.description} ${l.location} ${l.category}`.toLowerCase().includes(q)
        : true;
      return matchCategory && matchQuery;
    });
  }, [listings, query, category]);

  const hasFilters = query.trim() !== "" || category !== "";

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Anúncios</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            Pesquisa, filtra e encontra o que precisas.
          </p>
        </div>

        <a
          href="/new"
          className="w-fit rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Publicar anúncio
        </a>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Pesquisar</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Toyota, Trindade, arrendar, quarto..."
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {hasFilters
              ? `Resultados: ${filtered.length} (de ${listings.length})`
              : `Total: ${listings.length} anúncios`}
          </div>

          {hasFilters && (
            <button
              onClick={() => {
                setQuery("");
                setCategory("");
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-slate-600 dark:text-slate-300">A carregar anúncios…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-slate-600 dark:text-slate-300">
            Não encontrei resultados. Tenta mudar a pesquisa ou a categoria.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {filtered.map((l) => {
            const isNew = highlightId === l.id;
            const cover = l.photos?.[0];

            return (
              <div
                key={l.id}
                ref={(el) => {
                  itemRefs.current[l.id] = el;
                }}
                className={[
                  "rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur dark:bg-slate-900/60 transition",
                  "border-slate-200 dark:border-slate-800",
                  isNew ? "ring-4 ring-emerald-300 dark:ring-emerald-700 animate-pulse" : "",
                ].join(" ")}
              >
                {cover ? (
                  <img
                    src={cover}
                    alt="foto"
                    className="mb-4 h-44 w-full rounded-2xl object-cover border border-slate-200 dark:border-slate-800"
                  />
                ) : (
                  <div className="mb-4 h-44 w-full rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 grid place-items-center text-sm text-slate-500 dark:text-slate-400">
                    Sem foto
                  </div>
                )}

                <div className="flex items-start justify-between gap-4">
                  <div className="font-extrabold text-lg">{l.title}</div>
                  <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {formatPrice(l.price)}
                  </div>
                </div>

                <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {l.category} • {l.location}
                </div>

                <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
                  {l.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {l.whatsapp?.trim() ? (
                    <a
                      className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 hover:opacity-90 dark:bg-amber-900/30 dark:text-amber-100"
                      href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp: {l.whatsapp}
                    </a>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      WhatsApp não informado
                    </span>
                  )}

                  {isNew && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100">
                      🔥 Novo
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}