import {
  Timestamp,
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
import { getPlanActiveLimit, getPlanDurationDays, type UserPlan } from "./planRules";

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

  categoryFields?: Record<string, any>;






  ownerId: string;
  createdAt?: any;
};

type CreateListingInput = {
  uid: string;
  plan: "free" | "pro" | "monthly" | "annual";

  title: string;
  description: string;

  price?: string;
  category: string;
  location: string;

  kind?: "product" | "service";
  condition?: string;
  serviceType?: string;

  whatsapp?: string;

  categoryFields?: Record<string, any>;





  files: File[];
};

function normalizePlan(plan: CreateListingInput["plan"]): UserPlan {
  // compat: o app hoje usa "pro". Por agora mapeamos para mensal.
  if (plan === "pro") return "monthly";
  if (plan === "monthly" || plan === "annual" || plan === "free") return plan;
  return "free";
}


export function normalizeWhatsApp(v: unknown) {
  // mantém só dígitos; para wa.me deve ir sem "+"
  const s = String(v ?? "").trim();
  const digits = s.replace(/[^\d]/g, "");
  return digits;
}

function sortByCreatedAtDesc(items: Listing[]) {
  items.sort((a: any, b: any) => {
    const as = a?.createdAt?.seconds ?? 0;
    const bs = b?.createdAt?.seconds ?? 0;
    return bs - as;
  });
  return items;
}

// ✅ Agora aceita category opcional
export async function fetchListings(opts?: { limit?: number; category?: string }): Promise<Listing[]> {
  const take = opts?.limit ?? 50;
  const cat = String(opts?.category ?? "").trim();

  // ✅ sem orderBy para evitar índices
  const q = cat
    ? query(collection(db, "listings"), where("category", "==", cat), qLimit(take))
    : query(collection(db, "listings"), qLimit(take));

  const snap = await getDocs(q);

  const items = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Listing, "id">),
  })) as Listing[];

  return sortByCreatedAtDesc(items);
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

  return sortByCreatedAtDesc(items);
}

function isActiveAndNotExpired(data: any, now: Date): boolean {
  if (data?.status === "expired") return false;

  const expiresAt = data?.expiresAt;
  if (!expiresAt) return true; // compat: anúncios antigos continuam válidos

  const expDate: Date | null =
    expiresAt instanceof Timestamp
      ? expiresAt.toDate()
      : typeof expiresAt?.toDate === "function"
        ? expiresAt.toDate()
        : expiresAt instanceof Date
          ? expiresAt
          : null;

  if (!expDate) return true;
  return expDate.getTime() > now.getTime();
}

async function countActiveListingsForOwner(uid: string): Promise<number> {
  const now = new Date();

  // Nota: usamos orderBy para ter resultados consistentes; pode pedir index dependendo do Firestore.
  const q = query(
    collection(db, "listings"),
    where("ownerId", "==", uid),
    qLimit(100)
  );

  const snap = await getDocs(q);

  let count = 0;
  for (const d of snap.docs) {
    const data = d.data();
    if (isActiveAndNotExpired(data, now)) count += 1;
  }

  return count;
}

export async function createListingWithPlanLimits(input: CreateListingInput) {
  const maxPhotos = input.plan === "pro" ? 7 : 3;
  const plan = normalizePlan(input.plan);


  if (!input.uid) throw new Error("Precisas estar logado.");
  if (!input.title?.trim()) throw new Error("Escreve um título.");
  if (!input.category?.trim()) throw new Error("Seleciona uma categoria.");
  if (!input.location?.trim()) throw new Error("Escreve a localização.");
  if (!input.description?.trim()) throw new Error("Escreve a descrição.");
  if (!input.files?.length) throw new Error("Adiciona pelo menos 1 foto.");

  // ✅ Limite FREE: máximo 3 anúncios ativos
  if (plan === "free") {
    const activeCount = await countActiveListingsForOwner(input.uid);
    if (activeCount >= getPlanActiveLimit(plan)) {
      throw new Error("Plano FREE: máximo 3 anúncios ativos.");
    }
  }

  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + getPlanDurationDays(plan) * 24 * 60 * 60 * 1000)
  );

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
    whatsapp: String(input.whatsapp ?? "").trim(),

    categoryFields: input.categoryFields ?? {},

    ownerId: input.uid,
    createdAt: serverTimestamp(),

    plan,
    status: "active",
    expiresAt,
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
  const safe: any = { ...data };
  if ("whatsapp" in safe) safe.whatsapp = String(safe.whatsapp ?? "").trim();
  if ("price" in safe) safe.price = String(safe.price ?? "").trim();

  await updateDoc(doc(db, "listings", id), safe);
}

export async function deleteListing(id: string) {
  await deleteDoc(doc(db, "listings", id));
}
