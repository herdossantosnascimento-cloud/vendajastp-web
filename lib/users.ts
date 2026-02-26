import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function ensureUserDoc(uid: string, email: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      email,
      plan: "free",
      freeListingsUsed: 0,
      createdAt: serverTimestamp(),
    });
  }
}