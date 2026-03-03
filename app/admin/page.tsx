"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, limit, query, where, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { isAdminEmail } from "@/lib/admin/isAdmin";
import { markExpiredListingsIfNeeded } from "@/lib/listings/markExpiredListings";

export default function AdminPage() {
  const { user, loading, loginWithGoogle, logout } = useAuth();

  const email = user?.email ?? null;
  const isAdmin = useMemo(() => isAdminEmail(email), [email]);

  const [items, setItems] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function loadListings() {
    setMsg("");
    const q = query(collection(db, "listings"), where("status","==","active"), where("expiresAt", ">", Timestamp.now()), orderBy("expiresAt","asc"), limit(50));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setItems(data);
  }

  async function markExpiredNow() {
    setBusy(true);
    setMsg("");
    try {
      // usa os 50 carregados (simples e seguro)
      const updated = await markExpiredListingsIfNeeded(items);
      setMsg(updated > 0 ? `✅ Marcados como expired: ${updated}` : "✅ Nada para expirar.");
      await loadListings();
    } catch (e: any) {
      setMsg(`❌ Erro: ${e?.message ?? "falhou"}`);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadListings().catch(() => setMsg("❌ Falha ao carregar anúncios."));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (loading) return <div style={{ padding: 20 }}>Carregando...</div>;

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Admin</h1>
        <p>Precisas estar logado.</p>
        <button onClick={() => loginWithGoogle()}>Login com Google</button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Admin</h1>
        <p>Acesso negado: {email}</p>
        <button onClick={() => logout()}>Logout</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>
      <p>Logado como: {email}</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button disabled={busy} onClick={() => loadListings()}>
          Recarregar
        </button>
        <button disabled={busy || items.length === 0} onClick={markExpiredNow}>
          Marcar expirados agora
        </button>
        <button disabled={busy} onClick={() => logout()}>
          Logout
        </button>
      </div>

      {msg ? <p>{msg}</p> : null}

      <p>Total carregados: {items.length}</p>

      <ul>
        {items.map((l) => (
          <li key={l.id} style={{ marginBottom: 10 }}>
            <strong>{l.title ?? "(sem título)"}</strong>
            <br />
            Status: {l.status ?? "active"}
            <br />
            Owner: {l.ownerId ?? "-"}
          </li>
        ))}
      </ul>
    </div>
  );
}
