"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import Toast from "@/app/components/Toast";
import { useAuth } from "@/context/AuthContext";
import { CATEGORIES } from "@/lib/categories";
import { deleteListing, fetchMyListings, updateListing, type Listing } from "@/lib/listings";

function normalize(text: string) {
  return (text || "").trim();
}

export default function MyListingsPage() {
  const authAny = useAuth() as any;
  const user =
    authAny?.user ?? authAny?.currentUser ?? authAny?.firebaseUser ?? null;

  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  const [editingId, setEditingId] = useState<string>("");
  const editingItem = useMemo(() => items.find((x) => x.id === editingId) ?? null, [items, editingId]);

  // form de edição
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  function show(type: "success" | "error" | "info", msg: string) {
    setToastType(type);
    setToastMsg(msg);
    setToastOpen(true);
  }

  async function reload() {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await fetchMyListings(user.uid, { limit: 80 });
      setItems(data);
    } catch (e: any) {
      show("error", e?.message ?? "Erro a carregar os teus anúncios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  useEffect(() => {
    if (!editingItem) return;
    setTitle(editingItem.title ?? "");
    setPrice(editingItem.price ?? "");
    setCategory(editingItem.category ?? "");
    setLocation(editingItem.location ?? "");
    setDescription(editingItem.description ?? "");
    setStatus((editingItem.status as any) ?? "active");
  }, [editingItem]);

  async function onSave() {
    if (!user?.uid || !editingItem) return;

    try {
      await updateListing({
        listingId: editingItem.id,
        uid: user.uid,
        patch: {
          title: normalize(title),
          price: normalize(price),
          category: normalize(category),
          location: normalize(location),
          description,
          status,
        },
      });

      show("success", "Anúncio atualizado ✅");
      setEditingId("");
      await reload();
    } catch (e: any) {
      show("error", e?.message ?? "Erro ao atualizar.");
    }
  }

  async function onDelete(id: string) {
    if (!user?.uid) return;
    const ok = confirm("Tens a certeza que queres apagar este anúncio?");
    if (!ok) return;

    try {
      await deleteListing({ listingId: id, uid: user.uid });
      show("success", "Anúncio apagado ✅");
      await reload();
    } catch (e: any) {
      show("error", e?.message ?? "Erro ao apagar.");
    }
  }

  if (!user?.uid) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-2xl border bg-white p-6 text-center">
          <h1 className="text-xl font-bold">Minha conta</h1>
          <p className="mt-2 text-sm opacity-70">Faz login para veres os teus anúncios.</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Ir para login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <Toast
        open={toastOpen}
        message={toastMsg}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Meus anúncios</h1>
            <p className="text-sm opacity-70">Gerir: editar / desativar / apagar</p>
          </div>

          <Link
            href="/new"
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Publicar anúncio
          </Link>
        </div>

        {loading && (
          <div className="py-10 text-center text-sm opacity-70">A carregar…</div>
        )}

        {!loading && items.length === 0 && (
          <div className="rounded-2xl border bg-white p-6 text-center">
            <div className="text-sm opacity-70">Ainda não tens anúncios.</div>
            <Link
              href="/new"
              className="mt-4 inline-block rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Publicar o primeiro
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => {
              const cover = it.images?.[0] || "";
              return (
                <div key={it.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                  <Link href={`/listings/${it.id}`} className="block">
                    <div className="relative aspect-[4/3] w-full bg-gray-100">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={it.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs opacity-60">
                          Sem foto
                        </div>
                      )}
                      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold">
                        {it.status === "inactive" ? "Inativo" : "Ativo"}
                      </div>
                    </div>
                  </Link>

                  <div className="p-4">
                    <div className="line-clamp-1 font-semibold">{it.title}</div>
                    <div className="mt-1 text-xs opacity-70">
                      {it.category} • {it.location}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(it.id)}
                        className="flex-1 rounded-xl border px-3 py-2 text-sm font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(it.id)}
                        className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Apagar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Editor */}
        {editingItem && (
          <div className="fixed inset-0 z-30 bg-black/40 p-4">
            <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b p-4">
                <div className="font-bold">Editar anúncio</div>
                <button
                  type="button"
                  onClick={() => setEditingId("")}
                  className="rounded-xl px-3 py-1 text-sm font-semibold opacity-70 hover:opacity-100"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <div className="text-sm font-semibold">Título</div>
                  <input
                    className="mt-1 w-full rounded-xl border p-3"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-semibold">Preço</div>
                    <input
                      className="mt-1 w-full rounded-xl border p-3"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="text-sm font-semibold">Estado</div>
                    <select
                      className="mt-1 w-full rounded-xl border p-3 bg-white"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-semibold">Categoria</div>
                    <select
                      className="mt-1 w-full rounded-xl border p-3 bg-white"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="text-sm font-semibold">Localização</div>
                    <input
                      className="mt-1 w-full rounded-xl border p-3"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold">Descrição</div>
                  <textarea
                    className="mt-1 w-full rounded-xl border p-3 min-h-[120px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2 border-t p-4">
                <button
                  type="button"
                  onClick={() => setEditingId("")}
                  className="flex-1 rounded-xl border px-4 py-2 text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}