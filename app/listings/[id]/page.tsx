"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { fetchListingById, fetchListings, type Listing } from "@/lib/listings";

function cleanPhoneToWhatsApp(number: string) {
  // remove tudo menos dígitos
  const digits = (number || "").replace(/[^\d]/g, "");
  return digits;
}

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [item, setItem] = useState<Listing | null>(null);
  const [similar, setSimilar] = useState<Listing[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchListingById(id);
        if (!mounted) return;

        if (!data) {
          setError("Anúncio não encontrado.");
          setItem(null);
          return;
        }

        setItem(data);
        setActiveIdx(0);

        // Anúncios semelhantes (mesma categoria)
        const all = await fetchListings({ limit: 80 });
        if (!mounted) return;
        const sims = all
          .filter((x) => x.id !== data.id && x.category === data.category)
          .slice(0, 6);
        setSimilar(sims);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Erro a carregar anúncio.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const images = useMemo(() => item?.images ?? [], [item]);
  const activeImage = images[activeIdx] || images[0] || "";

  const whatsappNumber = cleanPhoneToWhatsApp(item?.whatsapp || "");
  const whatsappUrl =
    whatsappNumber && item
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          `Olá! Estou interessado no anúncio: "${item.title}".`
        )}`
      : "";

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="py-10 text-center text-sm opacity-70">A carregar anúncio…</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
        <Link
          href="/listings"
          className="mt-4 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Voltar aos anúncios
        </Link>
      </main>
    );
  }

  if (!item) return null;

  return (
    <>
      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 md:pb-6">
        {/* Top */}
        <div className="mb-4">
          <Link href="/listings" className="text-sm font-semibold text-emerald-700">
            ← Voltar
          </Link>
        </div>

        {/* Galeria */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="md:col-span-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-gray-100">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs opacity-60">
                  Sem foto
                </div>
              )}

              {/* Badge categoria */}
              {item.category ? (
                <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold">
                  {item.category}
                </div>
              ) : null}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {images.slice(0, 5).map((src, idx) => (
                  <button
                    key={src + idx}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`relative aspect-square overflow-hidden rounded-xl border ${
                      idx === activeIdx ? "ring-2 ring-emerald-600" : ""
                    }`}
                    aria-label={`Imagem ${idx + 1}`}
                  >
                    <Image src={src} alt={`${item.title} ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:col-span-2">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h1 className="text-xl font-bold">{item.title}</h1>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                {item.price ? (
                  <div className="text-lg font-extrabold text-emerald-700">{item.price} STN</div>
                ) : (
                  <div className="text-sm opacity-70">Preço não indicado</div>
                )}
                <div className="text-xs opacity-70">{item.location}</div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                {item.kind === "product" ? (
                  <div>
                    <span className="opacity-70">Condição:</span>{" "}
                    <span className="font-semibold">{item.condition ?? "Novo"}</span>
                  </div>
                ) : (
                  <div>
                    <span className="opacity-70">Tipo de serviço:</span>{" "}
                    <span className="font-semibold">{item.serviceType ?? "Ambos"}</span>
                  </div>
                )}

                <div>
                  <span className="opacity-70">Categoria:</span>{" "}
                  <span className="font-semibold">{item.category}</span>
                </div>
              </div>

              {item.description ? (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed opacity-90">
                  {item.description}
                </p>
              ) : null}

              <div className="mt-5 rounded-xl bg-yellow-50 p-3 text-xs opacity-80">
                Dica de segurança: encontra-te em local público e evita pagamentos adiantados.
              </div>

              {/* WhatsApp (desktop) */}
              <div className="mt-5 hidden md:block">
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Contactar no WhatsApp
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="block w-full rounded-xl bg-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-600"
                  >
                    WhatsApp não disponível
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Semelhantes */}
        {similar.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">Anúncios semelhantes</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => {
                const cover = s.images?.[0] || "";
                return (
                  <Link
                    key={s.id}
                    href={`/listings/${s.id}`}
                    className="group block overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="relative aspect-[4/3] w-full bg-gray-100">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={s.title}
                          fill
                          className="object-cover transition group-hover:scale-[1.02]"
                          sizes="(max-width: 1024px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs opacity-60">
                          Sem foto
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="line-clamp-1 font-semibold">{s.title}</div>
                      <div className="mt-1 text-xs opacity-70">{s.location}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* WhatsApp sticky no mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white p-3 md:hidden">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Contactar no WhatsApp
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="block w-full rounded-xl bg-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-600"
          >
            WhatsApp não disponível
          </button>
        )}
      </div>
    </>
  );
}