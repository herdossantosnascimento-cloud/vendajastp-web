"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export default function StripePaymentPage() {
  const sp = useSearchParams();

  const plan = useMemo(() => (sp.get("plan") === "annual" ? "annual" : "monthly"), [sp]);
  const ref = sp.get("ref") || "";

  const amountEUR = plan === "annual" ? 60 : 8;

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <Link className="text-sm text-gray-500 hover:text-gray-700" href={`/payment/select?plan=${plan}`}>
        ← Voltar ao método
      </Link>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Cartão / MBWay (Europa)</h1>
      <p className="mt-2 text-gray-600">
        Esta opção vai ser ligada com Stripe a seguir. Por agora é uma página temporária para não dar erro 404.
      </p>

      <div className="mt-8 rounded-3xl border border-amber-200 bg-white p-7 shadow-sm">
        <div className="text-sm text-gray-500">Plano</div>
        <div className="text-lg font-bold">{plan === "annual" ? "PRO Anual" : "PRO Mensal"}</div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-amber-50 p-4">
            <div className="text-xs text-amber-800">Valor (EUR)</div>
            <div className="text-2xl font-extrabold text-amber-800">{amountEUR}€</div>
            <div className="mt-1 text-xs text-gray-600">
              (Referência em STN fica só informativa no site)
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 p-4">
            <div className="text-xs text-amber-800">Referência</div>
            <div className="mt-1 break-all rounded-xl border bg-white px-3 py-2 font-mono text-sm">
              {ref}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800">
          <div className="font-semibold">Próximo passo (Stripe)</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
            <li>Criar produtos/preços no Stripe (Mensal 8€ / Anual 60€)</li>
            <li>Criar endpoint /api/stripe/checkout</li>
            <li>Criar webhook para ativar/downgrade automático</li>
          </ul>
        </div>

        <Link
          href="/pricing"
          className="mt-7 block w-full rounded-xl bg-amber-600 py-3 text-center text-sm font-semibold text-white hover:bg-amber-700 transition"
        >
          Voltar aos Planos
        </Link>
      </div>
    </div>
  );
}
