"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  async function onLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <header className="border-b bg-emerald-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo / título (mantém o teu design se já tens ícone, podes trocar aqui) */}
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-600" />
          <div>
            <div className="font-extrabold leading-5">VendaJá STP</div>
            <div className="text-xs opacity-70">O teu negócio começa aqui.</div>
          </div>
        </Link>

        {/* Menu */}
        <nav className="flex items-center gap-3">
          <Link href="/listings" className="text-sm font-semibold hover:opacity-80">
            Anúncios
          </Link>

          <Link href="/plans" className="text-sm font-semibold hover:opacity-80">
            Planos
          </Link>

          <Link
            href="/new"
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Publicar anúncio
          </Link>

          {/* Direita: login / conta */}
          {!loading && !user ? (
            <Link
              href="/login"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Entrar
            </Link>
          ) : null}

          {!loading && user ? (
            <>
              <Link
                href="/account"
                className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Minha conta
              </Link>

              <button
                onClick={onLogout}
                className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Sair
              </button>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}