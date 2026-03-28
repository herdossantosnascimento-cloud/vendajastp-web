"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ChatMessage,
  Conversation,
  fetchConversationById,
  markConversationAsRead,
  sendMessage,
  subscribeConversationMessages,
} from "@/lib/messages";

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

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const conversationId = String(params?.id ?? "");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setMessages([]);
      setConversation(null);
      router.replace(`/login?next=/messages/${conversationId}`);
      return;
    }

    let unsubMessages: (() => void) | undefined;

    (async () => {
      try {
        const data = await fetchConversationById(conversationId);

        if (!data) {
          setError("Conversa não encontrada.");
          return;
        }

        if (!data.participants?.includes(user.uid)) {
          setError("Não tens acesso a esta conversa.");
          return;
        }

        setConversation(data);
        await markConversationAsRead(conversationId, user.uid);

        unsubMessages = subscribeConversationMessages(
          conversationId,
          setMessages,
          () => {
            setMessages([]);
            setError("");
          }
        );
      } catch (err: any) {
        setError(err?.message || "Erro ao abrir conversa.");
      }
    })();

    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, [conversationId, user, loading, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    const clean = text.trim();
    if (!clean) return;

    setSending(true);
    setError("");

    try {
      await sendMessage({
        conversationId,
        senderId: user.uid,
        text: clean,
      });
      setText("");
    } catch (err: any) {
      setError(err?.message || "Não foi possível enviar a mensagem.");
    } finally {
      setSending(false);
    }
  }

  const otherLabel = useMemo(() => {
    if (!conversation || !user) return "Utilizador";
    return user.uid === conversation.sellerId ? "Comprador" : "Vendedor";
  }, [conversation, user]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-3xl flex-col p-4 md:p-6">
      <div className="mb-4">
        <Link href="/messages" className="text-sm text-gray-600 hover:text-gray-900">
          ← Voltar às mensagens
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-4">
          <h1 className="text-lg font-semibold text-gray-900">
            {conversation?.listingTitle || "Conversa"}
          </h1>
          <p className="text-sm text-gray-500">{otherLabel}</p>
        </div>

        <div className="min-h-[420px] space-y-3 bg-gray-50 p-4">
          {loading && <p className="text-sm text-gray-500">A carregar...</p>}
          {!loading && error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !error && !messages.length && (
            <p className="text-sm text-gray-500">Ainda não há mensagens. Começa a conversa.</p>
          )}

          {messages.map((msg) => {
            const mine = user?.uid === msg.senderId;

            return (
              <div
                key={msg.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    mine ? "bg-gray-900 text-white" : "bg-white text-gray-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  <p
                    className={`mt-2 text-[11px] ${
                      mine ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {formatWhen(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={onSubmit} className="border-t bg-white p-4">
          <div className="flex gap-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escreve a tua mensagem..."
              maxLength={1000}
              className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none ring-0 focus:border-gray-400"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "A enviar..." : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
