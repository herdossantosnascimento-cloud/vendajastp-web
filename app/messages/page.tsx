"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Conversation, getUnreadCountForUser, subscribeUserConversations } from "@/lib/messages";

function formatWhen(v: any) {
  const d =
    typeof v?.toDate === "function"
      ? v.toDate()
      : v instanceof Date
        ? v
        : null;

  if (!d) return "";
  return d.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [items, setItems] = useState<Conversation[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?next=/messages");
      return;
    }

    const unsub = subscribeUserConversations(user.uid, setItems);
    return () => unsub();
  }, [user, loading, router]);

  const totalUnread = useMemo(() => {
    if (!user) return 0;
    return items.reduce((sum, item) => sum + getUnreadCountForUser(item, user.uid), 0);
  }, [items, user]);

  const content = useMemo(() => {
    if (loading) {
      return <div className="rounded-2xl border bg-white p-4">A carregar mensagens...</div>;
    }

    if (!user) {
      return <div className="rounded-2xl border bg-white p-4">A redirecionar para login...</div>;
    }

    if (!items.length) {
      return (
        <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
          Ainda não tens conversas.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((item) => {
          const isSeller = user.uid === item.sellerId;
          const otherSide = isSeller ? "Comprador" : "Vendedor";
          const unread = getUnreadCountForUser(item, user.uid);

          return (
            <Link
              key={item.id}
              href={`/messages/${item.id}`}
              className="block rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow"
            >
              <div className="flex items-start gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
                  {item.listingImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.listingImage}
                      alt={item.listingTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      Sem foto
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {item.listingTitle || "Anúncio"}
                      </p>
                      <p className="text-xs text-gray-500">{otherSide}</p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="text-xs text-gray-500">
                        {formatWhen(item.lastMessageAt || item.updatedAt || item.createdAt)}
                      </span>

                      {unread > 0 ? (
                        <span className="rounded-full bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white">
                          {unread} nova{unread > 1 ? "s" : ""}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <p className={`mt-2 truncate text-sm ${unread > 0 ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                    {item.lastMessage || "Conversa iniciada"}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }, [items, loading, user]);

  return (
    <main className="mx-auto max-w-3xl p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
          <p className="text-sm text-gray-600">Conversas internas do VendaJá STP.</p>
        </div>

        {totalUnread > 0 ? (
          <span className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-bold text-white">
            {totalUnread} não lida{totalUnread > 1 ? "s" : ""}
          </span>
        ) : null}
      </div>

      {content}
    </main>
  );
}
