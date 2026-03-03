"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { requestPlanPayment, type PaymentMethod } from "@/lib/payments";
import { setNextToast } from "@/lib/toast-flag";
import { useAuth } from "@/context/AuthContext";

function PlanBadge({ plan }: { plan: "monthly" | "annual" }) {
  return (
    <span className="ml-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      {plan === "monthly" ? "PRO Mensal" : "PRO Anual"}
    </span>
  );
}

export default function PaymentSelectPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user } = useAuth();

  const plan = useMemo(() => {
    const p = sp.get("plan");
    return p === "annual" ? "annual" : "monthly";
  }, [sp]);

  const [loading, setLoading] = useState<PaymentMethod | null>(null);

  async function choose(method: PaymentMethod) {
    if (!user?.uid) {
      setNextToast("Faz login primeiro para continuar.", "error");
      router.push("/pricing");
      return;
    }

    try {
      setLoading(method);

      const { paymentRef } = await requestPlanPayment({
        uid: user.uid,
        plan,
        method,
      });

      if (method === "bank_transfer") {
        router.push(`/payment/bank?plan=${plan}&ref=${encodeURIComponent(paymentRef)}`);
        return;
      }
      if (method === "sao_wallet") {
        router.push(`/payment/sao-wallet?plan=${plan}&ref=${encodeURIComponent(paymentRef)}`);
        return;
      }

      // Stripe vamos ligar depois
      router.push(`/payment/stripe?plan=${plan}&ref=${encodeURIComponent(paymentRef)}`);
    } catch (e: any) {
      setNextToast(e?.message || "Erro ao iniciar pagamento.", "error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <div className="mb-10">
        <Link className="text-sm text-gray-500 hover:text-gray-700" href="/pricing">
          ← Voltar aos planos
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight">
          Escolhe como queres pagar <PlanBadge plan={plan} />
        </h1>
        <p className="mt-3 text-gray-600">
          Em São Tomé podes pagar por transferência ou São Wallet (confirmação manual). Na Europa podes pagar com cartão/MBWay (automático).
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-emerald-200 bg-white p-7 shadow-sm">
          <h2 className="text-lg font-bold text-emerald-700">São Wallet 🇸🇹</h2>
          <p className="mt-2 text-sm text-gray-600">
            Pagamento rápido por carteira móvel. Confirmação manual (por agora).
          </p>

          <button
            onClick={() => choose("sao_wallet")}
            disabled={!!loading}
            className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading === "sao_wallet" ? "A preparar..." : "Pagar com São Wallet"}
          </button>

          <p className="mt-3 text-xs text-gray-500">
            Vais receber uma referência para colocar na descrição do pagamento.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
          <h2 className="text-lg font-bold">Transferência Bancária 🏦</h2>
          <p className="mt-2 text-sm text-gray-600">
            Transferência para a conta em São Tomé. Confirmação manual.
          </p>

          <button
            onClick={() => choose("bank_transfer")}
            disabled={!!loading}
            className="mt-6 w-full rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          >
            {loading === "bank_transfer" ? "A preparar..." : "Pagar por Transferência"}
          </button>

          <p className="mt-3 text-xs text-gray-500">
            Vais ver IBAN/conta + referência única.
          </p>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-white p-7 shadow-sm">
          <h2 className="text-lg font-bold text-amber-700">Cartão / MBWay 🇪🇺</h2>
          <p className="mt-2 text-sm text-gray-600">
            Pagamento automático (Stripe). Ideal para Europa e diáspora.
          </p>

          <button
            onClick={() => choose("stripe")}
            disabled={!!loading}
            className="mt-6 w-full rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {loading === "stripe" ? "A preparar..." : "Pagar com Cartão/MBWay"}
          </button>

          <p className="mt-3 text-xs text-gray-500">(Vamos ligar o Stripe a seguir.)</p>
        </div>
      </div>
    </div>
  );
}
