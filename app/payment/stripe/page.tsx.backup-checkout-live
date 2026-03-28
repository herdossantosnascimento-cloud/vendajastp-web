"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function StripePaymentContent() {
  const sp = useSearchParams();
  const plan = useMemo(() => (sp.get("plan") === "annual" ? "annual" : "monthly"), [sp]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <Link className="text-sm text-gray-500 hover:text-gray-700" href={`/payment/select?plan=${plan}`}>
        ← Voltar ao método
      </Link>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Stripe</h1>
      <p className="mt-2 text-gray-600">
        Integração Stripe em preparação para o plano <b>{plan === "annual" ? "Anual" : "Mensal"}</b>.
      </p>

      <div className="mt-8 rounded-3xl border bg-white p-7 shadow-sm">
        <p className="text-sm text-gray-600">
          Este método será ligado ao Stripe Checkout e webhooks numa próxima fase.
        </p>
      </div>
    </div>
  );
}

export default function StripePaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-6 py-14">
          <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
            A carregar Stripe...
          </div>
        </div>
      }
    >
      <StripePaymentContent />
    </Suspense>
  );
}
