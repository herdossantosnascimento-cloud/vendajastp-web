"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { requestPlanPayment } from "@/lib/payments";
import { setNextToast } from "@/lib/toast-flag";

function BankPaymentContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user } = useAuth();

  const plan = useMemo(() => (sp.get("plan") === "annual" ? "annual" : "monthly"), [sp]);
  const [loading, setLoading] = useState(false);

  const amountSTN = plan === "annual" ? 1500 : 200;

  async function onConfirm() {
    if (!user?.uid) {
      setNextToast("Faz login primeiro.", "error");
      router.push("/pricing");
      return;
    }

    try {
      setLoading(true);

      await requestPlanPayment({
        uid: user.uid,
        plan,
        method: "bank_transfer",
      });

      setNextToast("Pedido enviado. Envia o comprovativo para validação ✅", "success");
      router.push("/payment/sent");
    } catch (e: any) {
      setNextToast(e?.message || "Erro ao criar pedido de pagamento.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <Link className="text-sm text-gray-500 hover:text-gray-700" href={`/payment/select?plan=${plan}`}>
        ← Voltar ao método
      </Link>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Transferência Bancária</h1>
      <p className="mt-2 text-gray-600">
        Faz a transferência e depois envia o comprovativo para ativarmos o teu plano.
      </p>

      <div className="mt-8 rounded-3xl border border-blue-200 bg-white p-7 shadow-sm">
        <div className="text-sm text-gray-500">Plano</div>
        <div className="text-lg font-bold">{plan === "annual" ? "Anual" : "Mensal"}</div>

        <div className="mt-5 rounded-2xl bg-blue-50 p-4">
          <div className="text-xs text-blue-700">Valor</div>
          <div className="text-2xl font-extrabold text-blue-700">{amountSTN} STN</div>
        </div>

        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
          <div className="font-semibold">Dados bancários</div>
          <div className="mt-2 text-sm">
            Banco: <b>COLOCA AQUI</b><br />
            NIB/Conta: <b>COLOCA AQUI</b><br />
            Nome: <b>COLOCA AQUI</b><br />
          </div>
        </div>

        <button
          onClick={onConfirm}
          disabled={loading}
          className="mt-7 w-full rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {loading ? "A guardar..." : "Já fiz a transferência"}
        </button>

        <p className="mt-3 text-xs text-gray-500">
          Depois poderás enviar o comprovativo para confirmação.
        </p>
      </div>
    </div>
  );
}

export default function BankPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-6 py-14">
          <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
            A carregar pagamento...
          </div>
        </div>
      }
    >
      <BankPaymentContent />
    </Suspense>
  );
}
