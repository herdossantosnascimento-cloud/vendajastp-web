import "./globals.css";
import Providers from "./providers";
import Header from "./components/Header";

export const metadata = {
  title: "VendaJá STP",
  description: "Marketplace profissional de São Tomé e Príncipe",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Providers>
          {/* Header global (mantém o teu design original) */}
          <Header />

          {/* Conteúdo principal */}
          <main className="min-h-[80vh]">
            {children}
          </main>

          {/* Footer simples profissional */}
          <footer className="mt-10 border-t bg-white py-6">
            <div className="mx-auto max-w-6xl px-4 text-xs opacity-70">
              © {new Date().getFullYear()} VendaJá STP — Marketplace de São Tomé e Príncipe
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}