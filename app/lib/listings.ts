import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
  } from "firebase/firestore";
  import { db } from "./firebase";
  
  export type Listing = {
    id: string;
    title: string;
    price: string;
    category: string;
    location: string;
    description: string;
    whatsapp?: string;
    photos?: string[];
    userId: string;
    createdAt?: any;
  };
  
  // 🔥 Criar anúncio
  export async function createListing(data: Omit<Listing, "id">) {
    const docRef = await addDoc(collection(db, "listings"), {
      ...data,
      createdAt: serverTimestamp(),
    });
  
    return docRef.id;
  }
  
  // 🔥 Buscar anúncios
  export async function fetchListings(): Promise<Listing[]> {
    const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
  
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Listing, "id">),
    }));
  }