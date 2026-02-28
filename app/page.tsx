import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-extrabold tracking-tight">VendaJá STP</h1>
      <p className="mt-1 text-sm text-gray-600">
        Escolhe uma categoria para ver anúncios.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/listings?cat=${encodeURIComponent(cat.id)}`}
            className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50 transition"
          >
            {cat.label}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Link
          href="/new"
          className="inline-flex rounded-xl bg-red-600 px-4 py-2 text-sm font-extrabold text-white hover:opacity-95"
        >
          Publicar anúncio
        </Link>
      </div>
    </main>
  );
}
