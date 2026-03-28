"use client";

import { useEffect, useMemo, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadPaymentProof } from "@/lib/paymentProof";

export default function NewPaymentPage() {
  const auth = useMemo(() => getAuth(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, [auth]);

  const createPayment = async () => {
    setError(null);

    if (!user) {
      setError("Faz login primeiro.");
      return;
    }

    setLoading(true);
    try {
      const ref = await addDoc(collection(db, "payments"), {
        uid: user.uid,
        email: user.email ?? null,
        plan: "monthly",
        method: "bank",
        reference: "",
        amountEur: 0,
        status: "pending_payment",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setPaymentId(ref.id);
    } catch (e: any) {
      setError(e?.message ?? "Erro a criar payment.");
    } finally {
      setLoading(false);
    }
  };

  const onPickFile = async (file: File) => {
    if (!paymentId) {
      setError("Cria o pedido primeiro.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      await uploadPaymentProof({ paymentId, file });
      alert("Comprovativo enviado ✅");
    } catch (e: any) {
      setError(e?.message ?? "Erro ao enviar comprovativo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 700 }}>
      <h1>Pagamento por Transferência</h1>


      {error && (
        <div style={{ padding: 12, margin: "12px 0", border: "1px solid #ddd" }}>
          <b>Erro:</b> {error}
        </div>
      )}

      {loadingAuth ? (
        <p>A carregar sessão...</p>
      ) : !user ? (
        <p>Faz login para criar um pedido de pagamento.</p>
      ) : !paymentId ? (
        <button
          onClick={createPayment}
          disabled={loading}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #111",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "A criar..." : "Criar pedido de pagamento"}
        </button>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <b>Pedido criado:</b> {paymentId}
          </div>

          <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <b>Enviar comprovativo</b> (PDF ou imagem, máx 5MB)
            </div>

            <input
              type="file"
              accept="application/pdf,image/*"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                onPickFile(f);
                e.currentTarget.value = "";
              }}
            />

            {uploading && <div style={{ marginTop: 8 }}>A enviar...</div>}
          </div>

          <div style={{ fontSize: 14, color: "#555" }}>
            Depois do comprovativo enviado, um admin vai validar e aprovar o teu plano.
          </div>
        </div>
      )}
    </div>
  );
}
