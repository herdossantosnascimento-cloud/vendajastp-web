"use client";

import { useEffect, useState } from "react";
import Toast from "@/app/components/Toast";
import { useAuth } from "@/context/AuthContext";
import { deleteListing, fetchMyListings, Listing, updateListing } from "@/lib/listings";

function priceText(p?: string | number) {
  const s = String(p ?? "").trim();
  if (!s) return "";
  const n = Number(s.replace(/[^\d]/g, ""));
  if (!Number.isFinite(n) || n === 0) return s;
  return n.toLocaleString("pt-PT");
}

export default function AccountUI() {
  const authAny = useAuth() as any;
  const user = authAny?.user ?? authAny?.currentUser ?? authAny?.firebaseUser ?? null;

  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("error");

  const [editing, setEditing] = useState<Listing | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    price: "",
    category: "",
    location: "",
    description: "",
    whatsapp: "",
  });

  async function load() {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await fetchMyListings(user.uid);
      setItems(data);
    } catch (e: any) {
      setToastType("error");
      setToastMsg(e?.message ?? "Erro ao carregar anúncios.");
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  function openEdit(it: Listing) {
    if (!user?.uid) {
      setToastType("error");
      setToastMsg("Sessão sem uid. Faz login de novo.");
      setToastOpen(true);
      return;
    }

    // ✅ Se o anúncio não é do user atual, bloqueia e explica
    if (!it.ownerId || it.ownerId !== user.uid) {
      setToastType("error");
      setToastMsg(
        `Este anúncio não está associado ao teu uid.\nownerId do anúncio: "${it.ownerId ?? ""}"\nuid atual: "${user.uid}"`
      );
      setToastOpen(true);
      return;
    }

    setEditing(it);
    setForm({
      title: it.title ?? "",
      price: String(it.price ?? ""),
      category: it.category ?? "",
      location: it.location ?? "",
      description: it.description ?? "",
      whatsapp: String(it.whatsapp ?? ""),
    });
  }

  async function saveEdit() {
    if (!editing) return;
    if (!user?.uid) return;

    if (!editing.ownerId || editing.ownerId !== user.uid) {
      setToastType("error");
      setToastMsg(
        `Bloqueado: ownerId não corresponde ao teu uid.\nownerId: "${editing.ownerId ?? ""}"\nuid: "${user.uid}"`
      );
      setToastOpen(true);
      return;
    }

    try {
      setSaving(true);

      await updateListing(editing.id, {
        title: form.title.trim(),
        price: String(form.price ?? "").trim(),
        category: form.category.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        whatsapp: String(form.whatsapp ?? "").trim(),
      });

      setToastType("success");
      setToastMsg("Anúncio atualizado ✅");
      setToastOpen(true);

      setEditing(null);
      await load();
    } catch (e: any) {
      setToastType("error");
      setToastMsg(e?.message ?? "Erro ao guardar (provável permissions).");
      setToastOpen(true);
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(it: Listing) {
    if (!user?.uid) return;

    if (!it.ownerId || it.ownerId !== user.uid) {
      setToastType("error");
      setToastMsg(
        `Bloqueado: não és o dono deste anúncio.\nownerId: "${it.ownerId ?? ""}"\nuid: "${user.uid}"`
      );
      setToastOpen(true);
      return;
    }

    try {
      setDeletingId(it.id);
      await deleteListing(it.id);

      setToastType("success");
      setToastMsg("Anúncio apagado ✅");
      setToastOpen(true);

      await load();
    } catch (e: any) {
      setToastType("error");
      setToastMsg(e?.message ?? "Erro ao apagar (provável permissions).");
      setToastOpen(true);
    } finally {
      setDeletingId(null);
    }
  }

  const inputBase =
    "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100";

  if (!user?.uid) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-gray-600">
        Sessão sem uid. Faz login novamente.
      </div>
    );
  }

  return (
    <>
      <Toast open={toastOpen} type={toastType} message={toastMsg} onClose={() => setToastOpen(false)} />

      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-extrabold">Minha conta</h1>

        {/* ✅ DEBUG PROFISSIONAL: mostra uid para confirmar */}
        <div className="mt-2 rounded-2xl border bg-white p-4 text-xs text-gray-700">
          <div><b>UID atual:</b> {user.uid}</div>
          <div className="text-gray-500">Se isto estiver vazio, não estás logado com Firebase Auth.</div>
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-gray-600">A carregar…</div>
        ) : items.length === 0 ? (
          <div className="mt-6 rounded-2xl border bg-white p-6 text-center text-sm text-gray-700">
            Ainda não tens anúncios.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((it) => {
              const isOwner = it.ownerId && it.ownerId === user.uid;

              return (
                <div key={it.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                  <div className="h-44 w-full overflow-hidden bg-gray-100 md:h-52">
                    {it.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.imageUrl} alt={it.title} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">Sem foto</div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="text-sm font-extrabold">{it.title}</div>
                    <div className="mt-1 text-sm font-bold text-emerald-700">
                      {priceText(it.price)} {String(it.price ?? "").trim() ? "STN" : ""}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">{it.category} • {it.location}</div>

                    {/* ✅ Mostra ownerId do anúncio (para encontrar o problema) */}
                    <div className="mt-2 rounded-xl border bg-gray-50 p-2 text-[11px] text-gray-700">
                      <div><b>ownerId:</b> {it.ownerId || "(vazio)"}</div>
                      <div><b>É teu?</b> {isOwner ? "Sim ✅" : "Não ❌"}</div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => openEdit(it)}
                        className="flex-1 rounded-xl border px-4 py-2 text-sm font-bold hover:bg-gray-50"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => {
                          if (confirm("Tens a certeza que queres apagar este anúncio?")) doDelete(it);
                        }}
                        disabled={deletingId === it.id}
                        className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-extrabold text-white hover:opacity-95 disabled:opacity-60"
                      >
                        {deletingId === it.id ? "A apagar…" : "Apagar"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL EDITAR */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-lg font-extrabold">Editar anúncio</div>
                <button
                  onClick={() => setEditing(null)}
                  className="rounded-lg px-3 py-1 text-sm font-bold hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold">Título</span>
                  <input className={inputBase} value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
                </label>

                <label className="block">
                  <span className="text-sm font-bold">Preço</span>
                  <input className={inputBase} value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} />
                </label>

                <label className="block">
                  <span className="text-sm font-bold">Categoria</span>
                  <input className={inputBase} value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))} />
                </label>

                <label className="block">
                  <span className="text-sm font-bold">Localização</span>
                  <input className={inputBase} value={form.location} onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))} />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm font-bold">Descrição</span>
                  <textarea
                    className={`${inputBase} min-h-[120px] resize-y`}
                    value={form.description}
                    onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm font-bold">WhatsApp</span>
                  <input className={inputBase} value={form.whatsapp} onChange={(e) => setForm((s) => ({ ...s, whatsapp: e.target.value }))} />
                </label>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 rounded-xl border px-4 py-2 text-sm font-bold hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white hover:opacity-95 disabled:opacity-60"
                >
                  {saving ? "A guardar…" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}