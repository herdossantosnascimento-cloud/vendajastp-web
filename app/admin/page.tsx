"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getDownloadURL, ref } from "firebase/storage";

// AJUSTA ESTA LINHA APENAS SE O CAMINHO FOR DIFERENTE NO TEU PROJETO
import { auth, db, functions, storage } from "@/lib/firebase";

type Payment = {
  id: string;
  uid?: string;
  plan?: "free" | "monthly" | "annual";
  status?: string;
  proofPath?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  approvedAt?: Timestamp | null;
  proofUploadedAt?: Timestamp | null;
};

function formatDate(ts?: Timestamp | null) {
  if (!ts) return "-";
  try {
    return ts.toDate().toLocaleString();
  } catch {
    return "-";
  }
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<Payment[]>([]);
  const [recent, setRecent] = useState<Payment[]>([]);

  async function loadPayments() {
    try {
      setError("");

      const pendingQ = query(
        collection(db, "payments"),
        where("status", "==", "pending_payment"),
        orderBy("createdAt", "desc")
      );

      const recentQ = query(
        collection(db, "payments"),
        orderBy("updatedAt", "desc"),
        limit(20)
      );

      const [pendingSnap, recentSnap] = await Promise.all([
        getDocs(pendingQ),
        getDocs(recentQ),
      ]);

      const pendingData: Payment[] = pendingSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Payment, "id">),
      }));

      const recentData: Payment[] = recentSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Payment, "id">),
      }));

      setPending(pendingData);
      setRecent(recentData);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Erro ao carregar pagamentos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        setCheckingAdmin(true);
        setError("");

        if (!user) {
          setIsAdmin(false);
          setError("Precisas de fazer login.");
          return;
        }

        const token = await getIdTokenResult(user, true);
        const adminClaim = token?.claims?.admin === true;

        if (!adminClaim) {
          setIsAdmin(false);
          setError("Acesso negado. Esta conta não é admin.");
          return;
        }

        setIsAdmin(true);
        await loadPayments();
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Erro ao validar admin.");
      } finally {
        setCheckingAdmin(false);
      }
    });

    return () => unsub();
  }, []);

  async function approve(paymentId: string) {
    try {
      setError("");
      const fn = httpsCallable(functions, "approvePayment");
      await fn({ paymentId });
      await loadPayments();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Erro ao aprovar pagamento.");
    }
  }

  async function reject(paymentId: string) {
    try {
      setError("");
      const fn = httpsCallable(functions, "rejectPayment");
      await fn({ paymentId });
      await loadPayments();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Erro ao rejeitar pagamento.");
    }
  }

  async function openProof(proofPath?: string) {
    try {
      if (!proofPath) return;
      const url = await getDownloadURL(ref(storage, proofPath));
      window.location.assign(url);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Erro ao abrir comprovativo.");
    }
  }

  function Card({
    p,
    showApprove = false,
    showReject = false,
  }: {
    p: Payment;
    showApprove?: boolean;
    showReject?: boolean;
  }) {
    return (
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 12,
          background: "#fff",
        }}
      >
        <div><b>ID:</b> {p.id}</div>
        <div><b>UID:</b> {p.uid || "-"}</div>
        <div><b>Plano:</b> {p.plan || "-"}</div>
        <div><b>Status:</b> {p.status || "-"}</div>
        <div><b>Criado em:</b> {formatDate(p.createdAt)}</div>
        <div><b>Atualizado em:</b> {formatDate(p.updatedAt)}</div>
        <div><b>Aprovado em:</b> {formatDate(p.approvedAt)}</div>
        <div><b>Proof uploaded:</b> {formatDate(p.proofUploadedAt)}</div>
        <div style={{ marginTop: 8 }}>
          <b>Comprovativo:</b> {p.proofPath ? "✅ enviado" : "❌ não enviado"}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {p.proofPath && (
            <button onClick={() => openProof(p.proofPath)}>
              Ver comprovativo
            </button>
          )}

          {showApprove && (
            <button onClick={() => approve(p.id)}>
              Aprovar pagamento
            </button>
          )}

          {showReject && (
            <button onClick={() => reject(p.id)}>
              Rejeitar pagamento
            </button>
          )}
        </div>
      </div>
    );
  }

  if (checkingAdmin) {
    return <div style={{ padding: 16 }}>A validar acesso admin...</div>;
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Admin</h1>
        <p>{error || "Acesso negado."}</p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: 16 }}>A carregar pagamentos...</div>;
  }

  return (
    <div style={{ padding: 16, maxWidth: 1000 }}>
      <h1>Admin</h1>
      <p>Pagamentos pendentes + recentes (para veres comprovativos mesmo depois de aprovar).</p>

      {error && (
        <div style={{ padding: 12, margin: "12px 0", border: "1px solid #ddd" }}>
          <b>Erro:</b> {error}
        </div>
      )}

      <h2>Pendentes</h2>
      {pending.length === 0 ? (
        <p>Sem pendentes.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {pending.map((p) => (
            <Card key={p.id} p={p} showApprove showReject />
          ))}
        </div>
      )}

      <h2 style={{ marginTop: 20 }}>Recentes (últimos 20)</h2>
      {recent.length === 0 ? (
        <p>Sem recentes.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {recent.map((p) => (
            <Card key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}