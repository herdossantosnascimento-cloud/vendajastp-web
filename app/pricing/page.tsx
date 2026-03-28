"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function PricingContent() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const reason = useMemo(() => searchParams.get("reason") || "", [searchParams]);

  function goToPlan(plan: "monthly" | "annual") {
    if (!user?.uid) {
      router.push("/login?next=/pricing");
      return;
    }

    router.push(`/payment/select?plan=${plan}`);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Escolhe o teu plano</h1>
        <p className="mt-2 text-gray-600">
          Publica anúncios no VendaJá STP com mais alcance e mais fotos.
        </p>

        {reason === "upgrade" && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Atingiste o limite do plano FREE. Faz upgrade para continuar.
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-500">FREE</div>
          <div className="mt-2 text-3xl font-extrabold">0 STN</div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>3 anúncios ativos</li>
            <li>3 fotos por anúncio</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-blue-700">MONTHLY</div>
          <div className="mt-2 text-3xl font-extrabold">200 STN</div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>Mais anúncios</li>
            <li>Até 7 fotos</li>
          </ul>
          <button
            type="button"
            onClick={() => goToPlan("monthly")}
            className="mt-6 inline-flex rounded-xl bg-blue-700 px-4 py-3 text-sm font-medium text-white"
          >
            Assinar Mensal
          </button>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-emerald-700">ANNUAL</div>
          <div className="mt-2 text-3xl font-extrabold">1500 STN</div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>Limite maior</li>
            <li>Até 7 fotos</li>
          </ul>
          <button
            type="button"
            onClick={() => goToPlan("annual")}
            className="mt-6 inline-flex rounded-xl bg-emerald-700 px-4 py-3 text-sm font-medium text-white"
          >
            Assinar Anual
          </button>
        </div>
      </div>
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl px-6 py-14">
          <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
            A carregar planos...
          </div>
        </main>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
