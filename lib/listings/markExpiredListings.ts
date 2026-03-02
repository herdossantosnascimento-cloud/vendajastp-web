import { writeBatch, doc, getFirestore } from "firebase/firestore";
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

  if (expiredIds.length === 0) {
    return 0;
  }

  const db = getFirestore();
  const batch = writeBatch(db);

  for (const id of expiredIds) {
    const ref = doc(db, "listings", id);
    batch.update(ref, {
      status: "expired",
      updatedAt: new Date(),
    });
  }

  await batch.commit();

  return expiredIds.length;
}
