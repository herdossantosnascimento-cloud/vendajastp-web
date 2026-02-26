"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/app/components/Toast";
import { setNextToast } from "@/lib/toast-flag";
import { createListingWithPlanLimits } from "@/lib/listings";
import { CATEGORIES } from "@/lib/categories";
import { useAuth } from "@/context/AuthContext";

type Kind = "product" | "service";
type Condition = "Novo" | "Usado";
type ServiceType = "Presencial" | "Online" | "Ambos";

export default function NewListingUI() {
  const router = useRouter();

  const authAny = useAuth() as any;
  const user =
    authAny?.user ?? authAny?.currentUser ?? authAny?.firebaseUser ?? null;

  const userDoc =
    authAny?.userData ?? authAny?.userDoc ?? authAny?.dbUser ?? authAny?.profile ?? null;

  const plan: "free" | "pro" = userDoc?.plan === "pro" ? "pro" : "free";

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("error");

  const [submitting, setSubmitting] = useState(false);

  const [kind, setKind] = useState<Kind>("product");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [condition, setCondition] = useState<Condition>("Novo");
  const [serviceType, setServiceType] = useState<ServiceType>("Ambos");

  const [files, setFiles] = useState<File[]>([]);
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  function showError(msg: string) {
    setToastType("error");
    setToastMsg(msg);
    setToastOpen(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user?.uid) return showError("Sessão a carregar… tenta novamente em 2 segundos.");

    if (!title.trim()) return showError("Escreve um título.");
    if (!category.trim()) return showError("Seleciona uma categoria.");
    if (!location.trim()) return showError("Escreve a localização.");
    if (!description.trim()) return showError("Escreve a descrição.");
    if (!files.length) return showError("Adiciona pelo menos 1 foto.");

    try {
      setSubmitting(true);

      await createListingWithPlanLimits({
        uid: user.uid,
        plan,
        title: title.trim(),
        price: price.trim(),
        category,
        location: location.trim(),
        description: description.trim(),
        kind,
        condition: kind === "product" ? (condition as any) : undefined,
        serviceType: kind === "service" ? (serviceType as any) : undefined,
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

  return (
    <>
      <Toast
        open={toastOpen}
        message={toastMsg}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold">Publicar anúncio</h1>
          <p className="text-sm opacity-70">
            Plano: <span className="font-semibold">{plan === "pro" ? "Pro" : "Free"}</span>
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="rounded-2xl border bg-white p-4">
            <div className="text-sm font-semibold mb-2">Tipo</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setKind("product")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold border ${
                  kind === "product" ? "bg-emerald-50 border-emerald-300" : "bg-white"
                }`}
              >
                Produto
              </button>
              <button
                type="button"
                onClick={() => setKind("service")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold border ${
                  kind === "service" ? "bg-emerald-50 border-emerald-300" : "bg-white"
                }`}
              >
                Serviço
              </button>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4 space-y-4">
            <div>
              <label className="text-sm font-semibold">Título</label>
              <input
                className="mt-1 w-full rounded-xl border p-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Carro Toyota em bom estado"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold">Categoria</label>
                <select
                  className="mt-1 w-full rounded-xl border p-3 bg-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Selecionar…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold">Localização</label>
                <input
                  className="mt-1 w-full rounded-xl border p-3"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: São Tomé"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold">Preço</label>
                <input
                  className="mt-1 w-full rounded-xl border p-3"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ex: 1500"
                />
                <div className="mt-1 text-xs opacity-60">Podes deixar vazio se não aplicável.</div>
              </div>

              {kind === "product" ? (
                <div>
                  <label className="text-sm font-semibold">Condição</label>
                  <select
                    className="mt-1 w-full rounded-xl border p-3 bg-white"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as Condition)}
                  >
                    <option value="Novo">Novo</option>
                    <option value="Usado">Usado</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-semibold">Tipo de serviço</label>
                  <select
                    className="mt-1 w-full rounded-xl border p-3 bg-white"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as ServiceType)}
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Online">Online</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold">Descrição</label>
              <textarea
                className="mt-1 w-full rounded-xl border p-3 min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explica bem o que estás a vender/oferecer…"
              />
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Fotos</div>
                <div className="text-xs opacity-70">
                  {plan === "free" ? "Free: máximo 3 fotos" : "Pro: máximo 7 fotos"}
                </div>
              </div>

              <label className="rounded-xl border px-4 py-2 text-sm font-semibold cursor-pointer bg-white">
                Adicionar fotos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                />
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-5">
                {previews.map((src, idx) => (
                  <div key={src} className="relative overflow-hidden rounded-xl border bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`preview-${idx}`} className="h-24 w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "A publicar…" : "Publicar anúncio"}
          </button>
        </form>
      </main>
    </>
  );
}