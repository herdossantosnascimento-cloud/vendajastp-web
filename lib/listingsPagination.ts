import {
  collection,
  getDocs,
  limit as qLimit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentSnapshot,
} from "firebase/firestore";

import { db } from "./firebase";
import type { Listing } from "./listings";

function sortByCreatedAtDesc(items: Listing[]) {
  items.sort((a: any, b: any) => {
    const as = a?.createdAt?.seconds ?? 0;
    const bs = b?.createdAt?.seconds ?? 0;
    return bs - as;
  });
  return items;
}

export type ListingsPageCursor = DocumentSnapshot | null;

export async function fetchListingsPage(opts?: {
  pageSize?: number;
  category?: string;
  cursor?: ListingsPageCursor;
}): Promise<{ items: Listing[]; nextCursor: ListingsPageCursor }> {
  const take = opts?.pageSize ?? 12;
  const cat = String(opts?.category ?? "").trim();
  const cursor = opts?.cursor ?? null;

  // ⚠️ Paginação real precisa de ordem estável.
  // Usamos createdAt desc (pode pedir index no Firestore se combinar com where(category == ...)).
  const baseParts: any[] = [
    ...(cat ? [where("category", "==", cat)] : []),
    orderBy("createdAt", "desc"),
    qLimit(take),
  ];

  if (cursor) {
    // cursor baseado no último doc da página anterior
    baseParts.splice(baseParts.length - 1, 0, startAfter(cursor));
  }

  const q = query(collection(db, "listings"), ...baseParts);
  const snap = await getDocs(q);

  const items = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Listing, "id">),
  })) as Listing[];

  // segurança extra (caso createdAt venha irregular)
  sortByCreatedAtDesc(items);

  const nextCursor = snap.docs.length === take ? snap.docs[snap.docs.length - 1] : null;

  return { items, nextCursor };
}
