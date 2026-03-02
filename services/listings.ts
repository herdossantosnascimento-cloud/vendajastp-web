import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
  type DocumentSnapshot,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { assertNonEmptyString, nowMs } from "../utils/firestore";
import type { Listing, ListingCreateInput, ListingUpdateInput } from "../types/listing";

const COLLECTION = "listings";

function listingFromSnap(snap: DocumentSnapshot): Listing {
  const data = snap.data() as Omit<Listing, "id">;
  return { id: snap.id, ...data };
}

export async function createListing(input: ListingCreateInput): Promise<Listing> {
  assertNonEmptyString(input.categoryId, "categoryId");

  const ts = nowMs();

  const payload: Omit<Listing, "id"> = {
    title: input.title,
    description: input.description,
    price: input.price,
    categoryId: input.categoryId,
    fields: input.fields ?? {},
    status: input.status ?? "active",
    createdAt: ts,
    updatedAt: ts,
  };

  const ref = await addDoc(collection(db, COLLECTION), payload);
  return { id: ref.id, ...payload };
}

export async function getListingById(id: string): Promise<Listing | null> {
  assertNonEmptyString(id, "id");

  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;

  return listingFromSnap(snap);
}

export type ListListingsOptions = {
  categoryId?: string;
  pageSize?: number; // default 20
  cursor?: DocumentSnapshot; // last doc of previous page
};

export type ListListingsResult = {
  items: Listing[];
  nextCursor: DocumentSnapshot | null;
};

export async function listListings(options: ListListingsOptions = {}): Promise<ListListingsResult> {
  const pageSize = options.pageSize ?? 20;

  const filters = [];
  if (options.categoryId) {
    assertNonEmptyString(options.categoryId, "categoryId");
    filters.push(where("categoryId", "==", options.categoryId));
  }

  const parts: any[] = [
    ...filters,
    orderBy("createdAt", "desc"),
    limit(pageSize),
  ];

  if (options.cursor) {
    parts.splice(parts.length - 1, 0, startAfter(options.cursor));
  }

  const q = query(collection(db, COLLECTION), ...parts);
  const snaps = await getDocs(q);

  const items = snaps.docs.map((d) => listingFromSnap(d));
  const nextCursor = snaps.docs.length === pageSize ? snaps.docs[snaps.docs.length - 1] : null;

  return { items, nextCursor };
}

export async function updateListing(id: string, patch: ListingUpdateInput): Promise<void> {
  assertNonEmptyString(id, "id");

  const payload: Record<string, unknown> = {
    ...patch,
    updatedAt: nowMs(),
  };

  // proteção: não deixar mudar createdAt
  delete payload.createdAt;

  await updateDoc(doc(db, COLLECTION, id), payload);
}

export async function deleteListing(id: string): Promise<void> {
  assertNonEmptyString(id, "id");
  await deleteDoc(doc(db, COLLECTION, id));
}
