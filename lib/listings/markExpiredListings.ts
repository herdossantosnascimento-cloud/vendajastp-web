import { writeBatch, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getExpiredActiveListingIds } from "./getExpiredActiveListingIds";

type ListingLike = {
  id: string;
  status?: string;
  expiresAt?: any;
};

export async function markExpiredListingsIfNeeded(
  listings: ListingLike[]
): Promise<number> {
  const expiredIds = getExpiredActiveListingIds(listings);

  if (expiredIds.length === 0) return 0;

  // Firestore batch: máx 500 operações por commit
  const CHUNK = 450;
  let updated = 0;

  for (let i = 0; i < expiredIds.length; i += CHUNK) {
    const slice = expiredIds.slice(i, i + CHUNK);
    const batch = writeBatch(db);

    for (const id of slice) {
      const ref = doc(db, "listings", id);
      batch.update(ref, {
        status: "expired",
        updatedAt: new Date(),
      });
    }

    await batch.commit();
    updated += slice.length;
  }

  return updated;
}
