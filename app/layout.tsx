import type { Metadata } from "next";
import "./globals.css";
import { ListingsProvider } from "./providers";

export const metadata: Metadata = {
  title: "VendaJá STP",
  description: "O teu negócio começa aqui.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-50">
        <ListingsProvider>
          <div className="mx-auto max-w-6xl px-4 py-6">
            <header className="flex items-center justify-between gap-4">
              <a href="/" className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-600 text-white grid place-items-center font-extrabold shadow-sm">
                  ⚡
                </div>
                <div className="leading-tight">
                  <div className="text-xl font-extrabold">
                    <span className="text-emerald-700 dark:text-emerald-400">
                      Venda
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      Já
                    </span>
                    <span className="text-slate-900 dark:text-white">
                      {" "}STP
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    O teu negócio começa aqui.
                  </p>
                </div>
              </a>

              <nav className="flex items-center gap-2">
                <a
                  className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                  href="/listings"
                >
                  Anúncios
                </a>
                <a
                  className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                  href="/plans"
                >
                  Planos
                </a>
                <a
                  className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                  href="/me"
                >
                  Conta
                </a>
                <a
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  href="/new"
                >
                  Publicar anúncio
                </a>
              </nav>
            </header>
          </div>

          <main className="mx-auto max-w-6xl px-4 pb-14">
            {children}
          </main>
        </ListingsProvider>
      </body>
    </html>
  );
}