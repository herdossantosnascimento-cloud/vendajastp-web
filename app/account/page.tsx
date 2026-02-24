"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useListings } from "../providers";

export default function AccountPage() {
  const { user, login, logout } = useListings();
  const router = useRouter();

  const [name, setName] = useState(user?.name ?? "");
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp ?? "");

  const ok = useMemo(() => {
    return name.trim().length >= 2 && whatsapp.trim().length >= 6;
  }, [name, whatsapp]);

  if (user) {
    return (
      <div className="mt-6 max-w-xl rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
        <h1 className="text-2xl font-extrabold">Conta</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Estás ligado como <b>{user.name}</b> ({user.whatsapp})
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push("/new")}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Publicar anúncio
          </button>

          <button
            onClick={logout}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
        <h1 className="text-2xl font-extrabold">Entrar</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Login simples (temporário). Depois ligamos ao Firebase Authentication.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              placeholder="Ex: Felisberto"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">WhatsApp</label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              placeholder="Ex: +239 99 999 999"
            />
          </div>

          <button
            disabled={!ok}
            onClick={() => {
              login({ name: name.trim(), whatsapp: whatsapp.trim() });
              router.push("/");
            }}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            Entrar
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
        <h2 className="text-lg font-bold">Porquê isto?</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-200">
          <li>Permite testar a “Conta” já hoje.</li>
          <li>Guarda o utilizador no teu Mac.</li>
          <li>Depois substituímos por Firebase Auth.</li>
        </ul>
      </div>
    </div>
  );
}