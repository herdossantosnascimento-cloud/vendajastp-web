"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PaymentSelectContent() {
  const sp = useSearchParams();
  const plan = useMemo(() => (sp.get("plan") === "annual" ? "annual" : "monthly"), [sp]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <Link className="text-sm text-gray-500 hover:text-gray-700" href="/pricing">
        ← Voltar aos planos
      </Link>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Escolhe o método de pagamento</h1>
      <p className="mt-2 text-gray-600">
        Plano selecionado: <b>{plan === "annual" ? "Anual" : "Mensal"}</b>
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href={`/payment/bank?plan=${plan}`}
          className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="text-lg font-bold text-gray-900">Transferência Bancária</div>
          <p className="mt-2 text-sm text-gray-600">
            Faz a transferência, envia o comprovativo e ativamos o teu plano.
          </p>
        </Link>

        <Link
          href={`/payment/sao-wallet?plan=${plan}`}
          className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="text-lg font-bold text-gray-900">São Wallet</div>
          <p className="mt-2 text-sm text-gray-600">
            Paga pela São Wallet e depois confirmamos o teu pedido.
          </p>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSelectPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-6 py-14">
          <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
            A carregar métodos de pagamento...
          </div>
        </div>
      }
    >
      <PaymentSelectContent />
    </Suspense>
  );
}
