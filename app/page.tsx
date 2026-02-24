export default function Home() {
  return (
    <section className="mt-6 grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
        <h1 className="text-3xl font-extrabold">
          Compra, vende e encontra serviços em São Tomé e Príncipe
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Veículos, imóveis, aluguer de carros, vestuário, quartos, guest house, bens e serviços — tudo num só lugar.
        </p>

        <div className="mt-6 flex gap-3">
          <a
            href="/listings"
            className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
          >
            Ver anúncios
          </a>
          <a
            href="/new"
            className="rounded-xl border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Publicar agora
          </a>
        </div>

        <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
          <b>Dica de segurança:</b> evita pagamentos adiantados. Confirma o vendedor e o produto/serviço antes de transferir dinheiro.
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
        <h2 className="text-lg font-bold">Categorias</h2>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            "Veículos",
            "Aluguer de Carros",
            "Imóveis",
            "Quartos & Arrendamento",
            "Moda & Beleza",
            "Serviços",
            "Guest House & Turismo",
            "Tecnologia",
            "Casa & Mobiliário",
            "Outros",
            "Procuro",
          ].map((c) => (
            <a
              key={c}
              href="/listings"
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 transition"
            >
              {c}
            </a>
          ))}
        </div>

        <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">
          A tua plataforma de classificados e marketplace para STP 🇸🇹
        </p>
      </div>
    </section>
  );
}