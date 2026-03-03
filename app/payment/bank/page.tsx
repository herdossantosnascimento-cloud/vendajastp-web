"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { markPaymentSent } from "@/lib/payments";
import { useAuth } from "@/context/AuthContext";
import { setNextToast } from "@/lib/toast-flag";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function BankPaymentPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user } = useAuth();

  const plan = useMemo(() => (sp.get("plan") === "annual" ? "annual" : "monthly"), [sp]);
  const ref = sp.get("ref") || "";

  const [loading, setLoading] = useState(false);
  const amountDb = plan === "annual" ? 1500 : 200;

  async function onPaid() {
    if (!user?.uid) {
      setNextToast("Faz login primeiro.", "error");
      router.push("/pricing");
      return;
    }
    try {
      setLoading(true);
      await markPaymentSent({ uid: user.uid });
      setNextToast("Pedido enviado. Vamos confirmar o pagamento e ativar o PRO ✅", "success");
      router.push("/new");
    } catch (e: any) {
      setNextToast(e?.message || "Erro ao confirmar.", "error");
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
        Faz a transferência e coloca a referência exatamente como está abaixo.
      </p>

      <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
        <div className="text-sm text-gray-500">Plano</div>
        <div className="text-lg font-bold">{plan === "annual" ? "PRO Anual" : "PRO Mensal"}</div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="text-xs text-gray-500">Valor</div>
            <div className="text-2xl font-extrabold">{amountDb} Db</div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="text-xs text-gray-500">Referência</div>
            <div className="mt-1 break-all rounded-xl border bg-white px-3 py-2 font-mono text-sm">
              {ref}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <div className="font-semibold">Dados bancários</div>
          <div className="mt-2 text-sm leading-6">
            Banco: <b>BISTP</b><br />
            Titular: <b>FELISBERTO DOS SANTOS DO NASCIMENTO</b><br />
            Conta: <b>00477321710001</b><br />
            NIB: <b>000200050477321710128</b><br />
            IBAN: <b>ST23000200050477321710128</b><br />
            SWIFT/BIC: <b>INOISTST</b>
          </div>
        </div>

        <button
          onClick={onPaid}
          disabled={loading}
          className="mt-7 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "A guardar..." : "Já fiz a transferência"}
        </button>

        <p className="mt-3 text-xs text-gray-500">
          Depois de confirmares, o plano fica “à espera de confirmação” e ativamos quando o pagamento entrar.
        </p>
      </div>
    </div>
  );
}
