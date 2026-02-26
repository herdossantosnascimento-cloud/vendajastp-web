"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AccountInfo() {
  const { firebaseUser, userDoc } = useAuth();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-extrabold">Minha conta</h1>

      <div className="mt-6 rounded-xl border bg-white p-6 space-y-4">
        <div>
          <span className="text-sm text-gray-500">Email</span>
          <div className="font-semibold">
            {firebaseUser?.email ?? "—"}
          </div>
        </div>

        <div>
          <span className="text-sm text-gray-500">Plano</span>
          <div className="font-semibold uppercase">
            {userDoc?.plan ?? "free"}
          </div>
        </div>

        <div>
          <span className="text-sm text-gray-500">
            Anúncios gratuitos usados
          </span>
          <div className="font-semibold">
            {userDoc?.freeListingsUsed ?? 0} / 2
          </div>
        </div>

        {userDoc?.plan === "free" && (
          <Link
            href="/plans"
            className="inline-block rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Fazer upgrade para Pro
          </Link>
        )}
      </div>
    </main>
  );
}