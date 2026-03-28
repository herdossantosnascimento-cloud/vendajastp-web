import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export type Conversation = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage?: string;
  sellerId: string;
  buyerId: string;
  participants: string[];
  lastMessage: string;
  lastMessageSenderId: string;
  buyerUnreadCount?: number;
  sellerUnreadCount?: number;
  createdAt?: any;
  updatedAt?: any;
  lastMessageAt?: any;
  isBlocked?: boolean;
};

export type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  type: "text";
  createdAt?: any;
};

function safeIdPart(v: unknown) {
  return encodeURIComponent(String(v ?? "").trim());
}

export function getConversationId(listingId: string, buyerId: string, sellerId: string) {
  const a = safeIdPart(listingId);
  const b = safeIdPart(buyerId);
  const c = safeIdPart(sellerId);
  return `${a}_${b}_${c}`;
}

function normalizeText(text: unknown) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

function toMillis(v: any) {
  if (!v) return 0;
  if (typeof v?.toMillis === "function") return v.toMillis();
  if (typeof v?.seconds === "number") return v.seconds * 1000;
  if (v instanceof Date) return v.getTime();
  return 0;
}

function sortConversations(items: Conversation[]) {
  return [...items].sort(
    (a, b) =>
      toMillis(b.lastMessageAt || b.updatedAt || b.createdAt) -
      toMillis(a.lastMessageAt || a.updatedAt || a.createdAt)
  );
}

export function getUnreadCountForUser(conversation: Conversation, uid: string) {
  if (!uid) return 0;
  if (uid === conversation.buyerId) return Number(conversation.buyerUnreadCount ?? 0);
  if (uid === conversation.sellerId) return Number(conversation.sellerUnreadCount ?? 0);
  return 0;
}

export async function fetchConversationById(conversationId: string): Promise<Conversation | null> {
  const snap = await getDoc(doc(db, "conversations", conversationId));
  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...(snap.data() as Omit<Conversation, "id">),
  };
}

export async function createOrGetConversation(args: {
  listingId: string;
  listingTitle: string;
  listingImage?: string;
  sellerId: string;
  buyerId: string;
}) {
  const listingId = String(args.listingId ?? "").trim();
  const listingTitle = String(args.listingTitle ?? "").trim();
  const listingImage = String(args.listingImage ?? "").trim();
  const sellerId = String(args.sellerId ?? "").trim();
  const buyerId = String(args.buyerId ?? "").trim();

  if (!listingId) throw new Error("Anúncio inválido.");
  if (!listingTitle) throw new Error("Título do anúncio em falta.");
  if (!sellerId || !buyerId) throw new Error("Utilizador inválido.");
  if (sellerId === buyerId) throw new Error("Não podes conversar com o teu próprio anúncio.");

  const conversationId = getConversationId(listingId, buyerId, sellerId);
  const ref = doc(db, "conversations", conversationId);
  const existing = await getDoc(ref);

  if (existing.exists()) return conversationId;

  await setDoc(ref, {
    listingId,
    listingTitle,
    listingImage: listingImage || "",
    sellerId,
    buyerId,
    participants: [buyerId, sellerId],
    lastMessage: "",
    lastMessageSenderId: buyerId,
    buyerUnreadCount: 0,
    sellerUnreadCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
    isBlocked: false,
  });

  return conversationId;
}

export async function sendMessage(args: {
  conversationId: string;
  senderId: string;
  text: string;
}) {
  const conversationId = String(args.conversationId ?? "").trim();
  const senderId = String(args.senderId ?? "").trim();
  const text = normalizeText(args.text);

  if (!conversationId) throw new Error("Conversa inválida.");
  if (!senderId) throw new Error("Precisas estar autenticado.");
  if (!text) throw new Error("Escreve uma mensagem.");
  if (text.length > 1000) throw new Error("A mensagem é demasiado longa.");

  const conversationRef = doc(db, "conversations", conversationId);
  const conversationSnap = await getDoc(conversationRef);

  if (!conversationSnap.exists()) {
    throw new Error("Conversa não encontrada.");
  }

  const conversation = conversationSnap.data() as Conversation;

  if (!Array.isArray(conversation.participants) || !conversation.participants.includes(senderId)) {
    throw new Error("Não tens acesso a esta conversa.");
  }

  if (conversation.isBlocked) {
    throw new Error("Esta conversa está bloqueada.");
  }

  await addDoc(collection(db, "conversations", conversationId, "messages"), {
    text,
    senderId,
    type: "text",
    createdAt: serverTimestamp(),
  });

  const isBuyerSender = senderId === conversation.buyerId;

  await updateDoc(conversationRef, {
    lastMessage: text,
    lastMessageSenderId: senderId,
    buyerUnreadCount: isBuyerSender ? 0 : Number(conversation.buyerUnreadCount ?? 0) + 1,
    sellerUnreadCount: isBuyerSender ? Number(conversation.sellerUnreadCount ?? 0) + 1 : 0,
    updatedAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
  });
}

export async function markConversationAsRead(conversationId: string, uid: string) {
  const cleanConversationId = String(conversationId ?? "").trim();
  const cleanUid = String(uid ?? "").trim();

  if (!cleanConversationId || !cleanUid) return;

  const conversationRef = doc(db, "conversations", cleanConversationId);
  const snap = await getDoc(conversationRef);

  if (!snap.exists()) return;

  const conversation = snap.data() as Conversation;

  if (!conversation.participants?.includes(cleanUid)) return;

  if (cleanUid === conversation.buyerId) {
    if (Number(conversation.buyerUnreadCount ?? 0) === 0) return;
    await updateDoc(conversationRef, {
      buyerUnreadCount: 0,
      updatedAt: serverTimestamp(),
    });
    return;
  }

  if (cleanUid === conversation.sellerId) {
    if (Number(conversation.sellerUnreadCount ?? 0) === 0) return;
    await updateDoc(conversationRef, {
      sellerUnreadCount: 0,
      updatedAt: serverTimestamp(),
    });
  }
}

export async function fetchUserConversations(uid: string): Promise<Conversation[]> {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", uid)
  );

  const snap = await getDocs(q);

  const items = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Conversation, "id">),
  })) as Conversation[];

  return sortConversations(items);
}

export function subscribeUserConversations(
  uid: string,
  callback: (items: Conversation[]) => void,
  onError?: (error: unknown) => void
) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", uid)
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Conversation, "id">),
      })) as Conversation[];

      callback(sortConversations(items));
    },
    (error) => {
      callback([]);
      if (onError) onError(error);
    }
  );
}

export function subscribeConversationMessages(
  conversationId: string,
  callback: (items: ChatMessage[]) => void,
  onError?: (error: unknown) => void
) {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ChatMessage, "id">),
      })) as ChatMessage[];

      callback(items);
    },
    (error) => {
      callback([]);
      if (onError) onError(error);
    }
  );
}
