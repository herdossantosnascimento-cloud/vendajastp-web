"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { seedDefaultCategories } from "@/lib/categories";

export default function MePage() {
  const authAny = useAuth() as any;
  const user = authAny?.user ?? authAny?.currentUser ?? null;
  const userDoc = authAny?.userData ?? authAny?.userDoc ?? null;

  const [seedMsg, setSeedMsg] = useState("");
  const [seeding, setSeeding] = useState(false);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Minha conta</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestão de conta e configurações do sistema.
          </p>
        </div>

        {/* Info utilizador */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-sm text-gray-700">
            <b>Email:</b> {user?.email ?? "—"}
          </div>
          <div className="text-sm text-gray-700 mt-1">
            <b>Plano:</b> {userDoc?.plan === "pro" ? "Pro" : "Free"}
          </div>
        </div>

        {/* Setup Categorias */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm font-semibold text-gray-900">
            Setup Categorias (executar 1 vez)
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Clica no botão abaixo para criar categorias padrão no Firestore.
          </p>

          <button
            type="button"
            disabled={seeding}
            onClick={async () => {
              setSeedMsg("");
              try {
                setSeeding(true);
                const res = await seedDefaultCategories();
                setSeedMsg(
                  res.skipped
                    ? "Categorias já estavam criadas ✅"
                    : "Categorias criadas com sucesso ✅"
                );
              } catch (e: any) {
                setSeedMsg(e?.message ?? "Erro ao criar categorias.");
              } finally {
                setSeeding(false);
              }
            }}
            className="mt-3 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black disabled:opacity-60"
          >
            {seeding ? "A criar..." : "Criar categorias"}
          </button>

          {seedMsg && (
            <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
              {seedMsg}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}