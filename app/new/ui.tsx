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
  const user =
    authAny?.user ??
    authAny?.currentUser ??
    authAny?.firebaseUser ??
    null;

  const userDoc =
    authAny?.userData ??
    authAny?.userDoc ??
    authAny?.dbUser ??
    authAny?.profile ??
    null;

  const plan: "free" | "pro" =
    userDoc?.plan === "pro" ? "pro" : "free";

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] =
    useState<"success" | "error" | "info">("error");

  const [submitting, setSubmitting] = useState(false);

  const [kind, setKind] = useState<Kind>("product");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] =
    useState<Condition>("Novo");
  const [serviceType, setServiceType] =
    useState<ServiceType>("Ambos");
  const [whatsapp, setWhatsapp] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);

  // ✅ CORREÇÃO AQUI (removido .isActive)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setCatLoading(true);
        const data = await getCategories();
        if (!alive) return;

        // antes: data.filter((c) => c.isActive)
        setCategories(data);
      } catch (e: any) {
        if (!alive) return;
        showError(
          e?.message ?? "Erro ao carregar categorias."
        );
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

    if (!user?.uid)
      return showError(
        "Sessão a carregar… tenta novamente."
      );
    if (!title.trim())
      return showError("Escreve um título.");
    if (!categoryId.trim())
      return showError("Seleciona uma categoria.");
    if (!location.trim())
      return showError("Escreve a localização.");
    if (!description.trim())
      return showError("Escreve a descrição.");
    if (!whatsapp.trim())
      return showError("Escreve o WhatsApp.");
    if (!files.length)
      return showError(
        "Adiciona pelo menos 1 foto."
      );

    const maxPhotos = plan === "free" ? 3 : 7;

    if (files.length > maxPhotos) {
      return showError(
        `O teu plano permite no máximo ${maxPhotos} fotos.`
      );
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
        condition:
          kind === "product"
            ? condition
            : undefined,
        serviceType:
          kind === "service"
            ? serviceType
            : undefined,
        whatsapp: whatsapp.trim(),
        files,
      });

      setNextToast(
        "Anúncio publicado com sucesso ✅",
        "success"
      );
      router.push("/listings");
      router.refresh();
    } catch (err: any) {
      showError(
        err?.message ??
          "Erro ao publicar anúncio."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputBase =
    "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none " +
    "focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100";

  const labelBase =
    "text-sm font-semibold text-gray-800";
  const helpBase =
    "mt-1 text-xs text-gray-500";

  const maxFiles =
    plan === "free" ? 3 : 7;

  return (
    <>
      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMsg}
        onClose={() =>
          setToastOpen(false)
        }
      />

      <main className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
        <h1 className="text-2xl font-extrabold mb-6">
          Publicar anúncio
        </h1>

        <form
          onSubmit={onSubmit}
          className="space-y-4"
        >
          <section className="rounded-2xl border p-5 shadow-sm">
            <label className="block mb-4">
              <span className={labelBase}>
                Título *
              </span>
              <input
                className={inputBase}
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
              />
            </label>

            <CategorySelect
              value={categoryId}
              onChange={setCategoryId}
              categories={categories}
              placeholder={
                catLoading
                  ? "A carregar…"
                  : "Selecionar…"
              }
              disabled={catLoading}
            />
          </section>

          <ImageUploader
            value={files}
            onChange={setFiles}
            maxFiles={maxFiles}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-red-600 py-3 text-white font-bold"
          >
            {submitting
              ? "A publicar…"
              : "Publicar anúncio"}
          </button>
        </form>
      </main>
    </>
  );
}