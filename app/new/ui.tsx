"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/app/components/Toast";
import { setNextToast } from "@/lib/toast-flag";
import { createListingWithPlanLimits } from "@/lib/listings";
import { getCategories, type Category } from "@/lib/categories";
import { useAuth } from "@/context/AuthContext";
import CategorySelect from "@/app/components/CategorySelect";
import ImageUploader from "@/app/components/ImageUploader";

type Kind = "product" | "service";
type Condition = "Novo" | "Usado";
type ServiceType = "Presencial" | "Online" | "Ambos";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function NewListingUI() {
  const router = useRouter();

  const authAny = useAuth() as any;
  const user = authAny?.user ?? authAny?.currentUser ?? authAny?.firebaseUser ?? null;
  const userDoc = authAny?.userData ?? authAny?.userDoc ?? authAny?.dbUser ?? authAny?.profile ?? null;
  const plan: "free" | "pro" = userDoc?.plan === "pro" ? "pro" : "free";

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("error");

  const [submitting, setSubmitting] = useState(false);

  const [kind, setKind] = useState<Kind>("product");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  // ✅ Agora é categoryId (slug/id do documento)
  const [categoryId, setCategoryId] = useState("");

  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState<Condition>("Novo");
  const [serviceType, setServiceType] = useState<ServiceType>("Ambos");

  // ✅ WhatsApp no anúncio
  const [whatsapp, setWhatsapp] = useState("");

  // ✅ Upload múltiplo (componente novo)
  const [files, setFiles] = useState<File[]>([]);

  // ✅ Categorias reais do Firestore
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setCatLoading(true);
        const data = await getCategories();
        if (!alive) return;
        setCategories(data.filter((c) => c.isActive));
      } catch (e: any) {
        // não bloqueia o form, mas avisa no toast
        if (!alive) return;
        showError(e?.message ?? "Erro ao carregar categorias.");
      } finally {
        if (!alive) return;
        setCatLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showError(msg: string) {
    setToastType("error");
    setToastMsg(msg);
    setToastOpen(true);
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

    // limite de fotos por plano (reforço extra na UI)
    const maxPhotos = plan === "free" ? 3 : 7;
    if (files.length > maxPhotos) {
      return showError(`O teu plano permite no máximo ${maxPhotos} fotos.`);
    }

    try {
      setSubmitting(true);

      await createListingWithPlanLimits({
        uid: user.uid,
        plan,
        title: title.trim(),
        price: price.trim(),

        // ✅ agora guardamos o id/slug
        category: categoryId.trim(),

        location: location.trim(),
        description: description.trim(),
        kind,
        condition: kind === "product" ? condition : undefined,
        serviceType: kind === "service" ? serviceType : undefined,
        whatsapp: whatsapp.trim(),
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

  const maxFiles = plan === "free" ? 3 : 7;

  return (
    <>
      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMsg}
        onClose={() => setToastOpen(false)}
      />

      <main className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Publicar anúncio</h1>

          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="rounded-full border bg-white px-3 py-1">
              Plano: <b className="text-gray-900">{plan === "pro" ? "Pro" : "Free"}</b>
            </span>
            <span className="rounded-full border bg-white px-3 py-1">
              Fotos: <b className="text-gray-900">{plan === "free" ? "máx. 3" : "máx. 7"}</b>
            </span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Card: Dados */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-gray-900">Dados do anúncio</div>
                <div className="text-xs text-gray-500">
                  Preenche com clareza para passar confiança.
                </div>
              </div>
            </div>

            {/* Tipo */}
            <div className="mb-4">
              <div className={labelBase}>Tipo</div>
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
              {/* Título */}
              <label className="block">
                <span className={labelBase}>Título *</span>
                <input
                  className={inputBase}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: iPhone 13 128GB"
                />
              </label>

              {/* Categoria (real) */}
              <div className="block">
                <CategorySelect
                  label="Categoria *"
                  value={categoryId}
                  onChange={setCategoryId}
                  categories={categories}
                  placeholder={catLoading ? "A carregar…" : "Selecionar…"}
                  disabled={catLoading}
                />
              </div>

              {/* Localização */}
              <label className="block">
                <span className={labelBase}>Localização *</span>
                <input
                  className={inputBase}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: São Tomé, Trindade…"
                />
              </label>

              {/* Preço */}
              <label className="block">
                <span className={labelBase}>Preço</span>
                <input
                  className={inputBase}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ex: 1500"
                />
                <p className={helpBase}>Podes deixar vazio se não aplicável. Se preencher, só número.</p>
              </label>

              {/* Condição / Tipo serviço */}
              {kind === "product" ? (
                <label className="block md:col-span-2">
                  <span className={labelBase}>Condição *</span>
                  <select
                    className={inputBase}
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as Condition)}
                  >
                    <option value="Novo">Novo</option>
                    <option value="Usado">Usado</option>
                  </select>
                </label>
              ) : (
                <label className="block md:col-span-2">
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

              {/* Descrição */}
              <label className="block md:col-span-2">
                <span className={labelBase}>Descrição *</span>
                <textarea
                  className={cx(inputBase, "min-h-[120px] resize-y")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explica o produto/serviço com detalhes, estado, entrega, etc."
                />
              </label>

              {/* WhatsApp */}
              <label className="block md:col-span-2">
                <span className={labelBase}>WhatsApp do vendedor *</span>
                <input
                  className={inputBase}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ex: +239 99 123 456 (ou internacional)"
                />
                <p className={helpBase}>
                  Usa número com indicativo (ex: +239…). Vamos gerar o link automaticamente.
                </p>
              </label>
            </div>
          </section>

          {/* Card: Fotos (NOVO uploader) */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3">
              <div className="text-sm font-bold text-gray-900">Fotos *</div>
              <div className="text-xs text-gray-500">
                {plan === "free" ? "Free: máximo 3 fotos" : "Pro: máximo 7 fotos"} — a 1ª vira capa
              </div>
            </div>

            <ImageUploader value={files} onChange={setFiles} maxFiles={maxFiles} />
          </section>

          {/* CTA */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-red-600 py-3 text-sm font-extrabold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
          >
            {submitting ? "A publicar…" : "Publicar anúncio"}
          </button>
        </form>
      </main>
    </>
  );
}