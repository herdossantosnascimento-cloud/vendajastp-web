"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { deleteListing, fetchListingById, Listing, normalizeWhatsApp, updateListing } from "@/lib/listings";
import { useAuth } from "@/context/AuthContext";
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

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const authAny = useAuth() as any;
  const user = authAny?.user ?? authAny?.currentUser ?? authAny?.firebaseUser ?? null;

  const [item, setItem] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchListingById(params.id);
        if (!alive) return;
        setItem(data);

        if (data) {
          setTitle(String(data.title ?? ""));
          setPrice(String(data.price ?? ""));
          setCategory(String(data.category ?? ""));
          setLocation(String(data.location ?? ""));
          setDescription(String(data.description ?? ""));
          setWhatsapp(String(data.whatsapp ?? ""));
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [params.id]);

  const isOwner = useMemo(() => {
    if (!user?.uid) return false;
    if (!item?.ownerId) return false;
    return String(item.ownerId) === String(user.uid);
  }, [user?.uid, item?.ownerId]);

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
  const waDigits = normalizeWhatsApp(whatsapp || item.whatsapp || "");
  const waHref = waDigits ? `https://wa.me/${waDigits}` : "";

  const inputBase =
    "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none " +
    "focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100";
  const labelBase = "text-sm font-semibold text-gray-800";

  async function onSave() {
    if (!isOwner) return;
    if (!item) return;
    if (!title.trim()) return alert("Escreve um título.");
    if (!category.trim()) return alert("Seleciona uma categoria.");
    if (!location.trim()) return alert("Escreve a localização.");
    if (!description.trim()) return alert("Escreve a descrição.");

    try {
      setSaving(true);
      await updateListing(item!.id, {
        title: title.trim(),
        price: price.trim(),
        category: category.trim(),
        location: location.trim(),
        description: description.trim(),
        whatsapp: whatsapp.trim(),
      });

      const refreshed = await fetchListingById(item!.id);
      setItem(refreshed);

      setEditing(false);
      alert("Atualizado com sucesso ✅");
    } catch (e: any) {
      alert(e?.message ?? "Erro ao atualizar.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!isOwner) return;
    if (!item) return;
    const ok = confirm("Tens a certeza que queres apagar este anúncio?");
    if (!ok) return;

    try {
      setDeleting(true);
      await deleteListing(item!.id);
      alert("Anúncio apagado ✅");
      router.push("/listings");
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao apagar anúncio.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
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

          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.slice(0, 10).map((src, idx) => (
                <button
                  key={`${src}-${idx}`}
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
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xl font-extrabold">{item.title}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full border bg-white px-3 py-1 font-bold text-emerald-700">
                  {priceText(item.price)} {String(item.price ?? "").trim() ? "STN" : ""}
                </span>
                <span className="rounded-full border bg-white px-3 py-1 text-gray-600">
                  {categoryLabel(item.category)}
                </span>
                <span className="rounded-full border bg-white px-3 py-1 text-gray-600">{item.location}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {waHref ? (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white hover:opacity-95"
                >
                  WhatsApp
                </a>
              ) : null}

              {isOwner ? (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing((v) => !v)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold hover:bg-gray-50"
                  >
                    {editing ? "Fechar edição" : "Editar"}
                  </button>

                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={deleting}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-extrabold text-white hover:opacity-95 disabled:opacity-60"
                  >
                    {deleting ? "A apagar…" : "Apagar"}
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className="mt-4 whitespace-pre-wrap text-sm text-gray-700">{item.description}</div>

          {editing && isOwner && (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-sm font-extrabold text-gray-900">Editar anúncio</div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className={labelBase}>Título *</span>
                  <input className={inputBase} value={title} onChange={(e) => setTitle(e.target.value)} />
                </label>

                <label className="block">
                  <span className={labelBase}>Preço</span>
                  <input className={inputBase} value={price} onChange={(e) => setPrice(e.target.value)} />
                </label>

                <label className="block">
                  <span className={labelBase}>Localização *</span>
                  <input className={inputBase} value={location} onChange={(e) => setLocation(e.target.value)} />
                </label>

                <label className="block md:col-span-2">
                  <span className={labelBase}>Categoria *</span>
                  <select className={inputBase} value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Selecionar…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block md:col-span-2">
                  <span className={labelBase}>Descrição *</span>
                  <textarea
                    className={inputBase}
                    style={{ minHeight: 140, resize: "vertical" }}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className={labelBase}>WhatsApp</span>
                  <input className={inputBase} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                </label>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-black disabled:opacity-60"
                >
                  {saving ? "A guardar…" : "Guardar alterações"}
                </button>

                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>

              {!item.ownerId ? (
                <div className="mt-3 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-900">
                  Atenção: este anúncio não tem <b>ownerId</b> guardado. Se foi criado antes das correções,
                  pode não ser possível editar/apagar com regras seguras.
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
