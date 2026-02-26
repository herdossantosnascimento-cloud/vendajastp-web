"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { fetchListings } from "@/lib/listings";
import { CATEGORIES } from "@/lib/categories";

type Listing = {
  id: string;
  title: string;
  price?: string;
  category?: string;
  location?: string;
  description?: string;
  images?: string[];
  createdAt?: any;
};

function normalize(text: string) {
  return (text || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "e")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function priceToNumber(v?: string) {
  if (!v) return null;
  const cleaned = v.replace(/[^\d]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function formatPrice(v?: string) {
  const n = priceToNumber(v);
  if (n == null) return "";
  return new Intl.NumberFormat("pt-PT").format(n) + " STN";
}

type Sort = "recent" | "old" | "price_asc" | "price_desc";

export default function ListingsUI() {
  const router = useRouter();
  const sp = useSearchParams();

  // URL params
  const selectedCat = sp.get("cat") ?? "";
  const selectedSort = (sp.get("sort") as Sort) || "recent";
  const selectedMin = sp.get("min") ?? "";
  const selectedMax = sp.get("max") ?? "";
  const selectedQ = sp.get("q") ?? "";

  // Inputs (controlados)
  const [catInput, setCatInput] = useState(selectedCat);
  const [sortInput, setSortInput] = useState<Sort>(selectedSort);
  const [minInput, setMinInput] = useState(selectedMin);
  const [maxInput, setMaxInput] = useState(selectedMax);
  const [qInput, setQInput] = useState(selectedQ);

  // Listings
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // sync inputs quando URL muda
  useEffect(() => {
    setCatInput(selectedCat);
    setSortInput(selectedSort);
    setMinInput(selectedMin);
    setMaxInput(selectedMax);
    setQInput(selectedQ);
  }, [selectedCat, selectedSort, selectedMin, selectedMax, selectedQ]);

  // fetch
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchListings({ limit: 120 });

        const safe: Listing[] = (data as any[]).map((x) => ({
          id: String(x?.id ?? ""),
          title: String(x?.title ?? ""),
          price: x?.price ? String(x.price) : "",
          category: x?.category ? String(x.category) : "",
          location: x?.location ? String(x.location) : "",
          description: x?.description ? String(x.description) : "",
          images: Array.isArray(x?.images) ? x.images.filter(Boolean) : [],
          createdAt: x?.createdAt ?? null,
        }));

        if (mounted) setItems(safe.filter((x) => x.id));
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Erro a carregar anúncios.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = [...items];

    // categoria (robusto)
    if (selectedCat) {
      const want = normalize(selectedCat);
      list = list.filter((x) => normalize(x.category || "") === want);
    }

    // pesquisa
    if (selectedQ.trim()) {
      const q = normalize(selectedQ);
      list = list.filter((x) => {
        const hay = normalize(
          `${x.title || ""} ${x.description || ""} ${x.location || ""} ${x.category || ""}`
        );
        return hay.includes(q);
      });
    }

    // preço
    const minN = selectedMin ? Number(selectedMin) : null;
    const maxN = selectedMax ? Number(selectedMax) : null;

    if (minN != null && Number.isFinite(minN)) {
      list = list.filter((x) => {
        const n = priceToNumber(x.price);
        return n != null && n >= minN;
      });
    }
    if (maxN != null && Number.isFinite(maxN)) {
      list = list.filter((x) => {
        const n = priceToNumber(x.price);
        return n != null && n <= maxN;
      });
    }

    // ordenar
    if (selectedSort === "price_asc") {
      list.sort((a, b) => (priceToNumber(a.price) ?? 0) - (priceToNumber(b.price) ?? 0));
    } else if (selectedSort === "price_desc") {
      list.sort((a, b) => (priceToNumber(b.price) ?? 0) - (priceToNumber(a.price) ?? 0));
    } else if (selectedSort === "old") {
      list.reverse();
    }
    // recent já vem desc do fetchListings

    return list;
  }, [items, selectedCat, selectedQ, selectedMin, selectedMax, selectedSort]);

  function applyFilters() {
    const params = new URLSearchParams();

    if (catInput) params.set("cat", catInput);
    if (sortInput) params.set("sort", sortInput);
    if (minInput) params.set("min", minInput);
    if (maxInput) params.set("max", maxInput);
    if (qInput.trim()) params.set("q", qInput.trim());

    const qs = params.toString();
    router.push(qs ? `/listings?${qs}` : "/listings");
  }

  function clearFilters() {
    setCatInput("");
    setSortInput("recent");
    setMinInput("");
    setMaxInput("");
    setQInput("");
    router.push("/listings");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* Topo */}
      <div className="mb-4 flex flex-col gap-1">
        <h1 className="text-xl font-bold">Anúncios</h1>
        <div className="text-sm opacity-70">
          {loading ? "A carregar…" : `${filtered.length} resultado(s)`}{" "}
          {selectedCat ? `• ${selectedCat}` : ""}
          {selectedQ ? ` • pesquisa: "${selectedQ}"` : ""}
        </div>
      </div>

      {/* Barra de filtros sticky (profissional) */}
      <div className="sticky top-2 z-10 mb-5 rounded-2xl border bg-white p-3 shadow-sm">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-5 md:gap-3">
          <input
            className="rounded-xl border p-2 text-sm md:col-span-2"
            placeholder="Pesquisar anúncios… (título, descrição, local, categoria)"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyFilters();
              }
            }}
          />

          <select
            className="rounded-xl border p-2 bg-white text-sm"
            value={catInput}
            onChange={(e) => setCatInput(e.target.value)}
          >
            <option value="">Todas categorias</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border p-2 bg-white text-sm"
            value={sortInput}
            onChange={(e) => setSortInput(e.target.value as Sort)}
          >
            <option value="recent">Mais recentes</option>
            <option value="old">Mais antigos</option>
            <option value="price_asc">Preço: baixo → alto</option>
            <option value="price_desc">Preço: alto → baixo</option>
          </select>

          <div className="grid grid-cols-2 gap-2">
            <input
              className="rounded-xl border p-2 text-sm"
              placeholder="Preço mín"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value.replace(/[^\d]/g, ""))}
            />
            <input
              className="rounded-xl border p-2 text-sm"
              placeholder="Preço máx"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value.replace(/[^\d]/g, ""))}
            />
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Aplicar
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border px-4 py-2 text-sm font-semibold"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Estados */}
      {loading && (
        <div className="py-10 text-center text-sm opacity-70">A carregar anúncios…</div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border bg-white p-6 text-center">
          <div className="text-sm opacity-70">Não há anúncios para estes filtros.</div>
          <Link
            href="/new"
            className="mt-4 inline-block rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Publicar anúncio
          </Link>
        </div>
      )}

      {/* Cards */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it) => {
            const cover = it.images?.[0] || "";
            return (
              <Link
                key={it.id}
                href={`/listings/${it.id}`}
                className="group block overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full bg-gray-100">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={it.title || "Anúncio"}
                      fill
                      className="object-cover transition group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs opacity-60">
                      Sem foto
                    </div>
                  )}

                  {/* Badge categoria */}
                  {it.category ? (
                    <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold">
                      {it.category}
                    </div>
                  ) : null}
                </div>

                <div className="p-4">
                  <div className="line-clamp-1 font-semibold">{it.title || "Sem título"}</div>

                  <div className="mt-1 flex items-center justify-between gap-3">
                    <div className="text-sm font-extrabold text-emerald-700">
                      {formatPrice(it.price)}
                    </div>
                    <div className="text-xs opacity-70">{it.location}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}