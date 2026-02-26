"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user, loginWithGoogle, loading } = useAuth();

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const didRedirect = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (didRedirect.current) return;

    didRedirect.current = true;
    const next = sp.get("next") || "/account";
    router.replace(next);
  }, [user, loading, router, sp]);

  async function onGoogle() {
    try {
      setErr("");
      setBusy(true);
      await loginWithGoogle();
    } catch (e: any) {
      setErr(e?.message ?? "Erro no login.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-xl font-bold">Entrar</h1>
      <p className="mt-2 text-sm opacity-70">
        Entra para publicar e gerir anúncios.
      </p>

      {err && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <button
        onClick={onGoogle}
        disabled={busy}
        className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? "A entrar..." : "Entrar com Google"}
      </button>
    </main>
  );
}