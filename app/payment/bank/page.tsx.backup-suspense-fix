"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { ref as storageRef, uploadBytes } from "firebase/storage";
import { functions, storage } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { setNextToast } from "@/lib/toast-flag";

function safeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}

export default function BankPaymentPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user } = useAuth();

  const type = sp.get("type") === "featured" ? "featured" : "plan";
  const plan = useMemo(() => (sp.get("plan") === "annual" ? "annual" : "monthly"), [sp]);
  const featuredPlan = sp.get("featuredPlan") || "";
  const paymentRef = sp.get("ref") || "";
  const paymentId = sp.get("paymentId") || "";
  const featuredAmount = Number(sp.get("amount") || 0);

  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const amountDb = type === "featured"
    ? featuredAmount
    : plan === "annual"
      ? 1500
      : 200;

  const titleText = type === "featured" ? "Destaque no topo" : "Transferência Bancária";
  const subtitleText =
    type === "featured"
      ? "Faz a transferência e coloca a referência exatamente como está abaixo para destacar o anúncio."
      : "Faz a transferência e coloca a referência exatamente como está abaixo.";

  const itemLabel = type === "featured" ? "Destaque" : "Plano";
  const itemValue =
    type === "featured"
      ? (featuredPlan === "24h" ? "Topo 24 horas" : featuredPlan === "7d" ? "Topo 7 dias" : "Topo 30 dias")
      : (plan === "annual" ? "PRO Anual" : "PRO Mensal");

  function onPaid() {
    if (!user?.uid) {
      setNextToast("Faz login primeiro.", "error");
      router.push("/pricing");
      return;
    }

    if (!paymentId) {
      setNextToast("paymentId em falta.", "error");
      return;
    }

    setShowUpload(true);
  }

  async function onUploadProof() {
    if (!user?.uid) {
      setNextToast("Faz login primeiro.", "error");
      router.push("/pricing");
      return;
    }

    if (!paymentId) {
      setNextToast("paymentId em falta.", "error");
      return;
    }

    if (!file) {
      setNextToast("Escolhe um ficheiro primeiro.", "error");
      return;
    }

    try {
      setUploading(true);

      const fileName = `${Date.now()}_${safeFileName(file.name)}`;
      const proofPath = `payment_proofs/${user.uid}/${paymentId}/${fileName}`;

      await uploadBytes(storageRef(storage, proofPath), file);

      const attachProof = httpsCallable(functions, "attachPaymentProof");
      await attachProof({
        paymentId,
        proofPath,
      });

      setNextToast(type === "featured" ? "Comprovativo enviado. Vamos confirmar o pagamento e ativar o destaque ✅" : "Comprovativo enviado. Vamos confirmar o pagamento e ativar o plano ✅", "success");
      router.push("/payment/sent");
    } catch (e: any) {
      setNextToast(e?.message || "Erro ao enviar comprovativo.", "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <Link
        className="text-sm text-gray-500 hover:text-gray-700"
        href={type === "featured" ? "/account" : `/payment/select?plan=${plan}`}
      >
        ← {type === "featured" ? "Voltar à conta" : "Voltar ao método"}
      </Link>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{titleText}</h1>
      <p className="mt-2 text-gray-600">
        {subtitleText}
      </p>

      <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
        <div className="text-sm text-gray-500">{itemLabel}</div>
        <div className="text-lg font-bold">{itemValue}</div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="text-xs text-gray-500">Valor</div>
            <div className="text-2xl font-extrabold">{amountDb} STN</div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="text-xs text-gray-500">Referência</div>
            <div className="mt-1 break-all rounded-xl border bg-white px-3 py-2 font-mono text-sm">
              {paymentRef}
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
          className="mt-7 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Já fiz a transferência
        </button>

        <p className="mt-3 text-xs text-gray-500">
          Depois de clicares acima, vais poder escolher o comprovativo e enviar.
        </p>

        {showUpload && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm font-semibold text-gray-800">Enviar comprovativo</div>
            <p className="mt-1 text-sm text-gray-600">
              Escolhe o ficheiro do comprovativo e envia para validação.
            </p>

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,.webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-4 block w-full text-sm text-gray-700"
            />

            <button
              onClick={onUploadProof}
              disabled={!file || uploading}
              className="mt-4 w-full rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-800 hover:bg-white disabled:opacity-60"
            >
              {uploading ? "A enviar..." : "Enviar comprovativo"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
