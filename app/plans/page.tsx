export default function PlansPage() {
    return (
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
          <h2 className="text-xl font-extrabold">Plano Mensal</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">200 Dobras / mês</p>
        </div>
  
        <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-6 shadow-sm backdrop-blur dark:border-amber-700 dark:bg-amber-900/20">
          <div className="text-xs font-bold text-amber-900 dark:text-amber-100">
            RECOMENDADO
          </div>
          <h2 className="text-xl font-extrabold">Plano Anual</h2>
          <p className="mt-2 text-amber-900 dark:text-amber-100">1500 Dobras / ano</p>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
            Poupa 900 Dobras por ano
          </p>
        </div>
      </div>
    );
  }