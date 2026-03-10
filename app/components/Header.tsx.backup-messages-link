"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  async function onLogout() {
    await logout();
    router.replace("/");
  }

  const navClass = (href: string) =>
    `rounded-xl px-3 py-2 text-sm font-semibold ${
      pathname === href ? "bg-emerald-50 text-emerald-700" : "hover:bg-gray-50"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <span className="text-lg leading-none">⚡</span>
          </div>

          <div className="leading-tight">
            <div className="text-lg font-extrabold tracking-tight">
              <span className="text-gray-900">Venda</span>
              <span className="text-red-600">Já</span>{" "}
              <span className="text-gray-900">STP</span>
            </div>
          </div>
        </Link>

        {/* Menu desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/listings" className={navClass("/listings")}>
            Anúncios
          </Link>
          <Link href="/plans" className={navClass("/plans")}>
            Planos
          </Link>
          <Link href="/new" className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:opacity-90">
            Publicar anúncio
          </Link>
        </nav>

        {/* Direita */}
        <div className="flex items-center gap-2">
          {!loading && !user && (
            <Link
              href="/login"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Entrar
            </Link>
          )}

          {!loading && user && (
            <>
              <Link
                href="/me"
                className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Minha conta
              </Link>

              <button
                onClick={onLogout}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Sair
              </button>
            </>
          )}
        </div>
      </div>

      {/* Menu mobile */}
      <div className="mx-auto flex max-w-6xl gap-2 px-4 pb-3 md:hidden">
        <Link href="/listings" className={navClass("/listings")}>
          Anúncios
        </Link>
        <Link href="/plans" className={navClass("/plans")}>
          Planos
        </Link>
        <Link href="/new" className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:opacity-90">
          Publicar
        </Link>
      </div>
    </header>
  );
}