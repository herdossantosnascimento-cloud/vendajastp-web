"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchListingById, Listing } from "@/lib/listings";

function priceText(p?: string | number) {
  const s = String(p ?? "").trim();
  if (!s) return "";
  const n = Number(s.replace(/[^\d]/g, ""));
  if (!Number.isFinite(n) || n === 0) return s;
  return n.toLocaleString("pt-PT");
}

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchListingById(params.id);
        if (alive) setItem(data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-gray-600">
        A carregar anúncio…
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-sm font-bold">Anúncio não encontrado.</div>
          <button
            onClick={() => router.push("/listings")}
            className="mt-3 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const images = (item.images?.length
    ? item.images
    : item.imageUrl
      ? [item.imageUrl]
      : []) as string[];

  const main = images[active] || images[0] || "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* ✅ FOTO PRINCIPAL PROFISSIONAL (não corta, não gigante) */}
        <div className="w-full bg-gray-100 p-3">
          <div className="flex max-h-[70vh] w-full items-center justify-center overflow-hidden rounded-2xl bg-white">
            {main ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={main}
                alt={item.title}
                className="max-h-[70vh] w-auto max-w-full object-contain"
                loading="lazy"
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center text-sm text-gray-500">
                Sem foto
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.slice(0, 10).map((src, idx) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(idx)}
                  className={`aspect-square overflow-hidden rounded-xl border ${
                    idx === active ? "border-emerald-400" : "border-gray-200"
                  } bg-gray-100`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="foto" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="text-xl font-extrabold">{item.title}</div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full border bg-white px-3 py-1 font-bold text-emerald-700">
              {priceText(item.price)} {String(item.price ?? "").trim() ? "STN" : ""}
            </span>
            <span className="rounded-full border bg-white px-3 py-1 text-gray-600">{item.category}</span>
            <span className="rounded-full border bg-white px-3 py-1 text-gray-600">{item.location}</span>
          </div>

          <div className="mt-4 whitespace-pre-wrap text-sm text-gray-700">{item.description}</div>
        </div>
      </div>
    </div>
  );
}