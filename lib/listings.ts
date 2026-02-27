import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as qLimit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase";

export type Listing = {
  id: string;

  title: string;
  description: string;

  price?: string;
  category: string;
  location: string;

  kind?: "product" | "service";
  condition?: string;
  serviceType?: string;

  imageUrl?: string;
  images?: string[];

  whatsapp?: string;

  ownerId: string;
  createdAt?: any;
};

type CreateListingInput = {
  uid: string;
  plan: "free" | "pro";

  title: string;
  description: string;

  price?: string;
  category: string;
  location: string;

  kind?: "product" | "service";
  condition?: string;
  serviceType?: string;

  whatsapp?: string;

  files: File[];
};

export function normalizeWhatsApp(v: unknown) {
  // mantém só dígitos, aceita +239… mas para wa.me deve ir sem "+"
  const s = String(v ?? "").trim();
  const digits = s.replace(/[^\d]/g, "");
  return digits;
}

export async function fetchListings(opts?: { limit?: number }): Promise<Listing[]> {
  const take = opts?.limit ?? 50;

  const q = query(collection(db, "listings"), orderBy("createdAt", "desc"), qLimit(take));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Listing, "id">) }));
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  const snap = await getDoc(doc(db, "listings", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Listing, "id">) };
}

export async function fetchMyListings(uid: string, opts?: { limit?: number }): Promise<Listing[]> {
  const take = opts?.limit ?? 50;

  // ✅ sem orderBy => sem index
  const q = query(collection(db, "listings"), where("ownerId", "==", uid), qLimit(take));
  const snap = await getDocs(q);

  const items = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Listing, "id">),
  })) as Listing[];

  items.sort((a: any, b: any) => {
    const as = a?.createdAt?.seconds ?? 0;
    const bs = b?.createdAt?.seconds ?? 0;
    return bs - as;
  });

  return items;
}

export async function createListingWithPlanLimits(input: CreateListingInput) {
  const maxPhotos = input.plan === "pro" ? 7 : 3;

  if (!input.uid) throw new Error("Precisas estar logado.");
  if (!input.title?.trim()) throw new Error("Escreve um título.");
  if (!input.category?.trim()) throw new Error("Seleciona uma categoria.");
  if (!input.location?.trim()) throw new Error("Escreve a localização.");
  if (!input.description?.trim()) throw new Error("Escreve a descrição.");
  if (!input.files?.length) throw new Error("Adiciona pelo menos 1 foto.");

  const files = input.files.slice(0, maxPhotos);

  const docRef = await addDoc(collection(db, "listings"), {
    title: input.title.trim(),
    description: input.description.trim(),
    price: String(input.price ?? "").trim(),
    category: input.category.trim(),
    location: input.location.trim(),
    kind: input.kind ?? "product",
    condition: String(input.condition ?? "").trim(),
    serviceType: String(input.serviceType ?? "").trim(),

    // ✅ força sempre string
    whatsapp: String(input.whatsapp ?? "").trim(),

    ownerId: input.uid,
    createdAt: serverTimestamp(),
  });

  const listingId = docRef.id;

  const urls: string[] = [];
  for (const file of files) {
    const storageRef = ref(storage, `listings/${input.uid}/${listingId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }

  await updateDoc(doc(db, "listings", listingId), {
    images: urls,
    imageUrl: urls[0] ?? "",
  });

  return { id: listingId, imageUrl: urls[0] ?? "", images: urls };
}

export async function updateListing(id: string, data: Partial<Listing>) {
  // ✅ garante que whatsapp nunca vai como number/undefined estranho
  const safe: any = { ...data };
  if ("whatsapp" in safe) safe.whatsapp = String(safe.whatsapp ?? "").trim();
  if ("price" in safe) safe.price = String(safe.price ?? "").trim();

  await updateDoc(doc(db, "listings", id), safe);
}

export async function deleteListing(id: string) {
  await deleteDoc(doc(db, "listings", id));
}