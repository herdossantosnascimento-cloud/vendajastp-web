"use client";

import { useSearchParams } from "next/navigation";

export default function PricingPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* Banner Upgrade */}
      {reason === "upgrade" && (
        <div className="mb-10 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-900 shadow-sm">
          <h2 className="text-lg font-bold">🚀 Limite do plano FREE atingido</h2>
          <p className="mt-2 text-sm">
            Para publicar mais de <strong>3 anúncios ativos</strong>, faz upgrade para PRO e aumenta a tua visibilidade.
          </p>
        </div>
      )}

      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Escolhe o teu plano</h1>
        <p className="mt-3 text-gray-600">Publica mais anúncios e destaca os teus produtos.</p>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {/* FREE */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold">FREE</h2>
          <p className="mt-4 text-4xl font-extrabold">0€</p>

          <ul className="mt-6 space-y-3 text-sm text-gray-600">
            <li>✔ 3 anúncios ativos</li>
            <li>✔ 3 fotos por anúncio</li>
            <li>✔ Duração limitada</li>
          </ul>

          <button className="mt-8 w-full rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Plano Atual
          </button>
        </div>

        {/* PRO Mensal - DESTACADO */}
        <div className="relative rounded-3xl border-2 border-emerald-500 bg-white p-8 shadow-lg md:scale-105">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold text-white">
            MAIS POPULAR
          </div>

          <h2 className="text-xl font-bold text-emerald-600">PRO Mensal</h2>
          <p className="mt-4 text-4xl font-extrabold">5€</p>
          <p className="text-sm text-gray-500">por mês</p>

          <ul className="mt-6 space-y-3 text-sm text-gray-700">
            <li>✔ 7 anúncios ativos</li>
            <li>✔ 7 fotos por anúncio</li>
            <li>✔ Maior visibilidade</li>
            <li>✔ Renovação automática</li>
          </ul>

          <button className="mt-8 w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition">
            Assinar Mensal
          </button>
        </div>

        {/* PRO Anual - MELHOR VALOR */}
        <div className="relative rounded-3xl border-2 border-emerald-400 bg-gradient-to-b from-emerald-50 to-white p-8 shadow-md">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-700 px-4 py-1 text-xs font-bold text-white">
            MELHOR VALOR
          </div>

          <h2 className="text-xl font-bold text-emerald-700">PRO Anual</h2>

          <div className="mt-4">
            <span className="mr-2 text-gray-400 line-through">60€</span>
            <span className="text-4xl font-extrabold">50€</span>
            <span className="ml-2 text-sm text-gray-500">por ano</span>
          </div>

          <p className="mt-1 text-sm font-semibold text-emerald-700">Poupa 10€ por ano</p>

          <ul className="mt-6 space-y-3 text-sm text-gray-700">
            <li>✔ 7 anúncios ativos</li>
            <li>✔ 7 fotos por anúncio</li>
            <li>✔ Melhor preço anual</li>
            <li>✔ Prioridade no suporte</li>
            <li>✔ Maior destaque na plataforma</li>
          </ul>

          <button className="mt-8 w-full rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800 transition">
            Assinar Anual
          </button>
        </div>
      </div>
    </div>
  );
}
