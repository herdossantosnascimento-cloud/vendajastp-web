"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* HERO */}
        <div className="rounded-2xl border bg-white p-6">
          <h1 className="text-2xl font-bold">
            Compra, vende e encontra serviços em São Tomé e Príncipe
          </h1>

          <p className="mt-3 text-sm opacity-70">
            Veículos, imóveis, aluguer de carros, vestuário, quartos, guest house,
            bens e serviços — tudo num só lugar.
          </p>

          <div className="mt-5 flex gap-3">
            <Link
              href="/listings"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Ver anúncios
            </Link>

            <Link
              href="/new"
              className="rounded-xl border px-4 py-2 text-sm font-semibold"
            >
              Publicar agora
            </Link>
          </div>

          <div className="mt-5 rounded-xl bg-yellow-50 p-3 text-xs opacity-80">
            Dica de segurança: evita pagamentos adiantados. Confirma o vendedor e o
            produto/serviço antes de transferir dinheiro.
          </div>
        </div>

        {/* CATEGORIAS */}
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Categorias</h2>

          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/listings?cat=${encodeURIComponent(cat)}`}
                className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50 transition"
              >
                {cat}
              </Link>
            ))}
          </div>

          <p className="mt-5 text-xs opacity-70">
            A tua plataforma de classificados e marketplace para STP 🇸🇹
          </p>
        </div>
      </div>
    </main>
  );
}