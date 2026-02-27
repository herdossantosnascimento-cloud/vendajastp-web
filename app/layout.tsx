import "./globals.css";
import Providers from "./providers";
import Header from "./components/Header";

export const metadata = {
  title: "VendaJá STP",
  description: "Marketplace profissional de São Tomé e Príncipe",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}