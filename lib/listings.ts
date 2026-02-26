"use client";

import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit as qLimit,
  addDoc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  increment,
  where,
  deleteDoc,
} from "firebase/firestore";

import { uploadListingImages } from "./storage";

// Para apagar imagens (quando existirem imagePaths)
import { ref, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

export type UserPlan = "free" | "pro";
export type Condition = "Novo" | "Usado";
export type ServiceType = "Presencial" | "Online" | "Ambos";

export type Listing = {
  id: string;
  ownerId: string;

  title: string;
  price: string;
  category: string;
  location: string;
  description: string;

  kind: "product" | "service";
  condition?: Condition;
  serviceType?: ServiceType;

  images: string[];

  // ✅ novo: caminhos no Storage (para conseguir apagar)
  imagePaths?: string[];

  // ✅ opcional (para WhatsApp no futuro)
  whatsapp?: string;

  createdAt?: any;
  status?: "active" | "inactive";
  planAtCreation?: UserPlan;
};

function cleanUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: any = {};
  Object.keys(obj).forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k];
  });
  return out;
}

export async function fetchListings(opts?: { limit?: number }): Promise<Listing[]> {
  const take = opts?.limit ?? 30;

  const q = query(
    collection(db, "listings"),
    orderBy("createdAt", "desc"),
    qLimit(take)
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as Omit<Listing, "id">;
    return { id: d.id, ...data };
  });
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  const refDoc = doc(db, "listings", id);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) return null;

  const data = snap.data() as Omit<Listing, "id">;
  return { id: snap.id, ...data };
}

export async function fetchMyListings(uid: string, opts?: { limit?: number }): Promise<Listing[]> {
  const take = opts?.limit ?? 50;

  // where(ownerId == uid) + orderBy(createdAt desc)
  const q = query(
    collection(db, "listings"),
    where("ownerId", "==", uid),
    orderBy("createdAt", "desc"),
    qLimit(take)
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as Omit<Listing, "id">;
    return { id: d.id, ...data };
  });
}

export async function createListingWithPlanLimits(params: {
  uid: string;
  plan: UserPlan;

  title: string;
  price: string;
  category: string;
  location: string;
  description: string;

  kind: "product" | "service";
  condition?: Condition;
  serviceType?: ServiceType;

  files: File[];

  // opcional
  whatsapp?: string;
}) {
  const {
    uid,
    plan,
    title,
    price,
    category,
    location,
    description,
    kind,
    condition,
    serviceType,
    files,
    whatsapp,
  } = params;

  if (!uid) throw new Error("Utilizador não autenticado.");
  if (!title?.trim()) throw new Error("Título obrigatório.");
  if (!category?.trim()) throw new Error("Seleciona uma categoria.");
  if (!location?.trim()) throw new Error("Localização obrigatória.");
  if (!description?.trim()) throw new Error("Descrição obrigatória.");
  if (!files || files.length === 0) throw new Error("Adiciona pelo menos 1 foto.");

  const maxListingsFree = 2;
  const maxFreePhotos = 3;
  const maxProPhotos = 7;

  const userRef = doc(db, "users", uid);

  if (plan === "free") {
    await runTransaction(db, async (tx) => {
      const userSnap = await tx.get(userRef);
      const used = Number(userSnap.data()?.freeListingsUsed ?? 0);

      if (used >= maxListingsFree) {
        throw new Error("Limite atingido: máximo 2 anúncios no plano Free.");
      }
      if (files.length > maxFreePhotos) {
        throw new Error("Plano Free permite máximo 3 fotos.");
      }
    });
  }

  if (plan === "pro" && files.length > maxProPhotos) {
    throw new Error("Plano Pro permite máximo 7 fotos.");
  }

  // ✅ Criar doc base (sem undefined)
  const baseData = cleanUndefined({
    ownerId: uid,
    title: title.trim(),
    price: price?.trim() ?? "",
    category: category.trim(),
    location: location.trim(),
    description: description.trim(),
    kind,
    condition: kind === "product" ? (condition ?? "Novo") : undefined,
    serviceType: kind === "service" ? (serviceType ?? "Ambos") : undefined,
    whatsapp: whatsapp?.trim() || undefined,
    images: [] as string[],
    imagePaths: [] as string[],
    status: "active" as const,
    planAtCreation: plan,
    createdAt: serverTimestamp(),
  });

  const listingRef = await addDoc(collection(db, "listings"), baseData);
  const listingId = listingRef.id;

  // Upload fotos
  const uploaded = await uploadListingImages({ uid, listingId, files });

  // Atualizar doc com URLs + paths
  await updateDoc(listingRef, {
    images: uploaded.urls,
    imagePaths: uploaded.paths,
  });

  // incrementar free
  if (plan === "free") {
    await runTransaction(db, async (tx) => {
      tx.update(userRef, { freeListingsUsed: increment(1) });
    });
  }

  return { listingId };
}

export async function updateListing(params: {
  listingId: string;
  uid: string; // segurança no client
  patch: Partial<Pick<Listing, "title" | "price" | "category" | "location" | "description" | "status">>;
}) {
  const { listingId, uid, patch } = params;

  const refDoc = doc(db, "listings", listingId);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) throw new Error("Anúncio não encontrado.");

  const data = snap.data() as any;
  if (data.ownerId !== uid) throw new Error("Sem permissão para editar este anúncio.");

  const cleaned = cleanUndefined({
    title: patch.title?.trim(),
    price: patch.price?.trim(),
    category: patch.category?.trim(),
    location: patch.location?.trim(),
    description: patch.description?.trim(),
    status: patch.status,
  });

  await updateDoc(refDoc, cleaned);
}

export async function deleteListing(params: {
  listingId: string;
  uid: string;
}) {
  const { listingId, uid } = params;

  const refDoc = doc(db, "listings", listingId);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) return;

  const data = snap.data() as any;
  if (data.ownerId !== uid) throw new Error("Sem permissão para apagar este anúncio.");

  // tentar apagar imagens se existir imagePaths
  const paths: string[] = Array.isArray(data.imagePaths) ? data.imagePaths : [];

  await deleteDoc(refDoc);

  // apagar Storage (best-effort)
  await Promise.allSettled(
    paths.map(async (p) => {
      const r = ref(storage, p);
      await deleteObject(r);
    })
  );
}