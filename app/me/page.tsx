"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { fetchMyListings, type Listing } from "@/lib/listings";
import { getEffectivePlan, getPlanLabel } from "@/lib/effectivePlan";
import { getPlanActiveLimit, type UserPlan } from "@/lib/planRules";

type UserPlanData = {
  plan?: "free" | "monthly" | "annual";
  planStatus?: string;
  planExpiresAt?: Timestamp | null;
};

function formatDate(ts?: Timestamp | null) {
  if (!ts) return "-";
  try {
    return ts.toDate().toLocaleString();
  } catch {
    return "-";
  }
}

function priceText(p?: string | number) {
  const s = String(p ?? "").trim();
  if (!s) return "";
  const n = Number(s.replace(/[^\d]/g, ""));
  if (!Number.isFinite(n) || n === 0) return s;
  return n.toLocaleString("pt-PT");
}

function isActiveAndNotExpired(item: any) {
  if (item?.status === "expired") return false;

  const expiresAt = item?.expiresAt;
  if (!expiresAt) return true;

  try {
    const d =
      expiresAt instanceof Timestamp
        ? expiresAt.toDate()
        : typeof expiresAt?.toDate === "function"
          ? expiresAt.toDate()
          : expiresAt instanceof Date
            ? expiresAt
            : null;

    if (!d) return true;
    return d.getTime() > Date.now();
  } catch {
    return true;
  }
}

function StatCard({
  label,
  value,
  help,
}: {
  label: string;
  value: string;
  help?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-extrabold text-gray-900">{value}</div>
      {help ? <div className="mt-2 text-xs text-gray-500">{help}</div> : null}
    </div>
  );
}

export default function MePage() {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);
  const [error, setError] = useState("");
  const [planData, setPlanData] = useState<UserPlanData | null>(null);
  const [items, setItems] = useState<Listing[]>([]);

  useEffect(() => {
    async function loadUserPlan() {
      try {
        setError("");

        if (!user?.uid) {
          setPlanData(null);
          return;
        }

        const snap = await getDoc(doc(db, "users", user.uid));

        if (!snap.exists()) {
          setPlanData({
            plan: "free",
            planStatus: "inactive",
            planExpiresAt: null,
          });
          return;
        }

        const data = snap.data() as UserPlanData;

        setPlanData({
          plan: data.plan || "free",
          planStatus: data.planStatus || "inactive",
          planExpiresAt: data.planExpiresAt || null,
        });
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Erro ao carregar o plano.");
      } finally {
        setLoadingPlan(false);
      }
    }

    loadUserPlan();
  }, [user?.uid]);

  useEffect(() => {
    async function loadMyListings() {
      try {
        if (!user?.uid) {
          setItems([]);
          return;
        }

        const data = await fetchMyListings(user.uid);
        setItems(data);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Erro ao carregar os teus anúncios.");
      } finally {
        setLoadingListings(false);
      }
    }

    loadMyListings();
  }, [user?.uid]);

  const effectivePlan: UserPlan = useMemo(() => {
    return getEffectivePlan({
      plan: planData?.plan,
      planStatus: planData?.planStatus,
      planExpiresAt: planData?.planExpiresAt,
    });
  }, [planData]);

  const activeItemsCount = useMemo(() => {
    return items.filter((it) => isActiveAndNotExpired(it as any)).length;
  }, [items]);

  const planLimit = useMemo(() => getPlanActiveLimit(effectivePlan), [effectivePlan]);

  const remainingToCreate = useMemo(() => {
    if (effectivePlan === "free") {
      return Math.max(0, planLimit - activeItemsCount);
    }
    return -1;
  }, [effectivePlan, planLimit, activeItemsCount]);

  if (!user) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-bold">A minha conta</h1>
        <p className="mt-4 text-gray-600">Faz login para veres os dados da tua conta e os teus anúncios.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">A minha conta</h1>
          <p className="mt-1 text-gray-600">Resumo da conta, métricas do plano e teus anúncios.</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/new"
            className="rounded-lg bg-black px-4 py-3 text-white"
          >
            Publicar novo anúncio
          </Link>

          <Link
            href="/account"
            className="rounded-lg border px-4 py-3"
          >
            Gerir anúncios
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Plano atual</h2>

        {loadingPlan ? (
          <p className="mt-4 text-gray-600">A carregar plano...</p>
        ) : (
          <div className="mt-4 space-y-3 text-sm sm:text-base">
            <div>
              <span className="font-semibold">Email:</span> {user.email || "-"}
            </div>

            <div>
              <span className="font-semibold">UID:</span> {user.uid}
            </div>

            <div>
              <span className="font-semibold">Plano guardado:</span> {planData?.plan || "free"}
            </div>

            <div>
              <span className="font-semibold">Plano efetivo:</span> {getPlanLabel(effectivePlan)}
            </div>

            <div>
              <span className="font-semibold">Estado:</span> {planData?.planStatus || "inactive"}
            </div>

            <div>
              <span className="font-semibold">Expira em:</span> {formatDate(planData?.planExpiresAt)}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Plano efetivo"
          value={getPlanLabel(effectivePlan)}
          help="Plano realmente usado pelo sistema para limites e criação."
        />

        <StatCard
          label="Anúncios ativos"
          value={String(activeItemsCount)}
          help="Anúncios ativos e ainda não expirados."
        />

        <StatCard
          label="Limite do plano"
          value={effectivePlan === "free" ? `${planLimit}` : "Ilimitado"}
          help={effectivePlan === "free" ? "No plano FREE o limite atual é 3." : "Plano pago sem limite curto visível nesta UI."}
        />

        <StatCard
          label="Disponíveis para criar"
          value={effectivePlan === "free" ? `${remainingToCreate}` : "Ilimitado"}
          help={effectivePlan === "free" ? "Quantos anúncios ainda podes criar antes de fazer upgrade." : "Conta paga ativa."}
        />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Os meus anúncios</h2>
          <span className="text-sm text-gray-500">
            {loadingListings ? "A carregar..." : `${items.length} anúncio(s)`}
          </span>
        </div>

        {loadingListings ? (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 text-gray-600">
            A carregar os teus anúncios...
          </div>
        ) : items.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-700">
            Ainda não tens anúncios.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <div key={it.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="h-44 w-full overflow-hidden bg-gray-100">
                  {it.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.imageUrl}
                      alt={it.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                      Sem foto
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="text-base font-bold">{it.title}</div>

                  <div className="mt-1 text-sm font-semibold text-emerald-700">
                    {priceText(it.price)} {String(it.price ?? "").trim() ? "STN" : ""}
                  </div>

                  <div className="mt-1 text-sm text-gray-600">
                    {it.category} • {it.location}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/listings/${it.id}`}
                      className="flex-1 rounded-lg border px-4 py-2 text-center text-sm font-medium"
                    >
                      Ver anúncio
                    </Link>

                    <Link
                      href="/account"
                      className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white"
                    >
                      Gerir
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
