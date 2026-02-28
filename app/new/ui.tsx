"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/app/components/Toast";
import { setNextToast } from "@/lib/toast-flag";
import { createListingWithPlanLimits } from "@/lib/listings";
import { CATEGORIES, getCategoryFields } from "@/lib/categories";
import type { FieldDefinition } from "@/lib/categoryFields.types";
import { useAuth } from "@/context/AuthContext";

type Kind = "product" | "service";
type Condition = "Novo" | "Usado";
type ServiceType = "Presencial" | "Online" | "Ambos";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function digitsOnly(v: string) {
  return String(v ?? "").replace(/[^\d+]/g, "");
}

export default function NewListingUI() {
  const router = useRouter();

  const authAny = useAuth() as any;
  const user = authAny?.user ?? authAny?.currentUser ?? authAny?.firebaseUser ?? null;
  const userDoc =
    authAny?.userData ?? authAny?.userDoc ?? authAny?.dbUser ?? authAny?.profile ?? null;

  const plan: "free" | "pro" = userDoc?.plan === "pro" ? "pro" : "free";
  const maxPhotos = plan === "pro" ? 7 : 3;

  // Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("error");

  const [submitting, setSubmitting] = useState(false);

  // Form
  const [kind, setKind] = useState<Kind>("product");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(CATEGORIES[0]?.id ?? "");
  const [categoryFieldsState, setCategoryFieldsState] = useState<Record<string, any>>({});
  const categoryFields = useMemo(() => getCategoryFields(categoryId), [categoryId]);
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<Condition>("Novo");
  const [serviceType, setServiceType] = useState<ServiceType>("Ambos");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");

  // Photos
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const canSubmit = useMemo(() => {
    if (!user?.uid) return false;
    if (!title.trim()) return false;
    if (!categoryId.trim()) return false;
    if (!location.trim()) return false;
    if (!description.trim()) return false;
    if (!whatsapp.trim()) return false;
    if (!files.length) return false;
    return true;
  }, [user?.uid, title, categoryId, location, description, whatsapp, files.length]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function showError(msg: string) {
    setToastType("error");
    setToastMsg(msg);
    setToastOpen(true);
  }

  function showInfo(msg: string) {
    setToastType("info");
    setToastMsg(msg);
    setToastOpen(true);
  }

  function onPickFiles(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list);
    const next = [...files, ...picked];

    if (next.length > maxPhotos) {
      showInfo(`O teu plano permite no máximo ${maxPhotos} fotos. Vou ficar só com as primeiras.`);
    }

    setFiles(next.slice(0, maxPhotos));
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function moveFile(index: number, dir: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev];
      const to = index + dir;
      if (to < 0 || to >= next.length) return prev;
      const tmp = next[index];
      next[index] = next[to];
      next[to] = tmp;
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user?.uid) return showError("Sessão a carregar… tenta novamente em 2 segundos.");
    if (!title.trim()) return showError("Escreve um título.");
    if (!categoryId.trim()) return showError("Seleciona uma categoria.");
    if (!location.trim()) return showError("Escreve a localização.");
    if (!description.trim()) return showError("Escreve a descrição.");
    if (!whatsapp.trim()) return showError("Escreve o WhatsApp do vendedor.");
    if (!files.length) return showError("Adiciona pelo menos 1 foto.");

    if (price.trim() && !/^\d+([.,]\d+)?$/.test(price.trim())) {
      return showError("Preço inválido. Usa só números (ex: 1500).");
    }

    const wa = digitsOnly(whatsapp).trim();
    if (wa.replace(/[^\d]/g, "").length < 7) {
      return showError("WhatsApp parece curto. Confirma o número (com indicativo).");
    }

    try {
      setSubmitting(true);

      await createListingWithPlanLimits({
        uid: user.uid,
        plan,
        title: title.trim(),
        price: price.trim(),
        category: categoryId.trim(),
        location: location.trim(),
        description: description.trim(),
        kind,
        condition: kind === "product" ? condition : undefined,
        serviceType: kind === "service" ? serviceType : undefined,
        whatsapp: wa,
        categoryFields: categoryFieldsState,
        files,
      });

      setNextToast("Anúncio publicado com sucesso ✅", "success");
      router.push("/listings");
      router.refresh();
    } catch (err: any) {
      showError(err?.message ?? "Erro ao publicar anúncio.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputBase =
    "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none " +
    "focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100";

  const labelBase = "text-sm font-semibold text-gray-800";
  const helpBase = "mt-1 text-xs text-gray-500";

  return (
    <>
      <Toast open={toastOpen} type={toastType} message={toastMsg} onClose={() => setToastOpen(false)} />

      <main className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
        {/* Header */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-extrabold tracking-tight">Publicar anúncio</h1>
          <p className="mt-1 text-sm text-gray-600">
            Preenche com calma para o anúncio ficar claro e profissional.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="rounded-full border bg-white px-3 py-1">
              Plano: <b className="text-gray-900">{plan === "pro" ? "Pro" : "Free"}</b>
            </span>
            <span className="rounded-full border bg-white px-3 py-1">
              Fotos: <b className="text-gray-900">máx. {maxPhotos}</b>
            </span>
            <span className="rounded-full border bg-white px-3 py-1">
              A 1ª foto vira <b className="text-gray-900">capa</b>
            </span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Card: Dados */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <div className="text-sm font-bold text-gray-900">Dados do anúncio</div>
              <div className="text-xs text-gray-500">Informação principal.</div>
            </div>

            {/* Tipo */}
            <div className="mb-4">
              <div className={labelBase}>Tipo *</div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setKind("product")}
                  className={cx(
                    "rounded-xl px-4 py-2 text-sm font-semibold border transition",
                    kind === "product"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "bg-white border-gray-200 text-gray-800 hover:bg-gray-50"
                  )}
                >
                  Produto
                </button>
                <button
                  type="button"
                  onClick={() => setKind("service")}
                  className={cx(
                    "rounded-xl px-4 py-2 text-sm font-semibold border transition",
                    kind === "service"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "bg-white border-gray-200 text-gray-800 hover:bg-gray-50"
                  )}
                >
                  Serviço
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className={labelBase}>Título *</span>
                <input
                  className={inputBase}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Toyota RAV4 2012 / Limpeza de casas / iPhone 13 128GB"
                />
                <p className={helpBase}>Quanto mais específico, melhor.</p>
              </label>

              <label className="block">
                <span className={labelBase}>Categoria *</span>
                <select className={inputBase} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={labelBase}>Localização *</span>
                <input
                  className={inputBase}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: São Tomé, Trindade…"
                />
              </label>

              <label className="block">
                <span className={labelBase}>Preço</span>
                <input
                  className={inputBase}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ex: 1500"
                />
                <p className={helpBase}>Opcional. Se preencher, usa só números.</p>
              </label>

              {kind === "product" ? (
                <label className="block">
                  <span className={labelBase}>Condição *</span>
                  <select className={inputBase} value={condition} onChange={(e) => setCondition(e.target.value as Condition)}>
                    <option value="Novo">Novo</option>
                    <option value="Usado">Usado</option>
                  </select>
                </label>
              ) : (
                <label className="block">
                  <span className={labelBase}>Tipo de serviço *</span>
                  <select
                    className={inputBase}
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as ServiceType)}
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Online">Online</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                </label>
              )}

              <label className="block md:col-span-2">
                <span className={labelBase}>Descrição *</span>
                <textarea
                  className={cx(inputBase, "min-h-[120px] resize-y")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Estado, detalhes, entrega, contacto, etc."
                />
              </label>

              <label className="block md:col-span-2">
                <span className={labelBase}>WhatsApp do vendedor *</span>
                <input
                  className={inputBase}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ex: +239 99 123 456 (ou internacional)"
                />
                <p className={helpBase}>Com indicativo. Vamos criar o link automaticamente.</p>
              </label>

              {/* Debug opcional: ownerId */}
              <div className="md:col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
                <b>Owner (debug):</b> {user?.uid ?? "— (não logado)"}
              </div>
            </div>
          </section>

          {/* Card: Fotos */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-2">
              <div className="text-sm font-bold text-gray-900">Fotos *</div>
              <div className="text-xs text-gray-500">
                Máximo {maxPhotos}. A 1ª foto é a capa. Podes mudar a ordem.
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onPickFiles(e.target.files)}
              className="block w-full text-sm"
            />

            {previews.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                {previews.map((src, idx) => (
                  <div key={src} className="overflow-hidden rounded-2xl border bg-white">
                    <div className="aspect-square w-full bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="preview" className="h-full w-full object-cover" />
                    </div>

                    <div className="flex items-center justify-between gap-2 p-2">
                      <div className="text-xs font-semibold text-gray-700">
                        {idx === 0 ? "Capa" : `Foto ${idx + 1}`}
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveFile(idx, -1)}
                          className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                          disabled={idx === 0}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFile(idx, 1)}
                          className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                          disabled={idx === previews.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 text-sm text-gray-600">Ainda sem fotos.</div>
            )}
          </section>

          <button
            type="submit"
            disabled={submitting || !canSubmit}
            className="w-full rounded-2xl bg-red-600 py-3 text-sm font-extrabold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
          >
            {submitting ? "A publicar…" : "Publicar anúncio"}
          </button>
        </form>
      </main>
    </>
  );
}
