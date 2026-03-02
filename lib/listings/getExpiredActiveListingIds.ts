import { Timestamp } from "firebase/firestore";

type ListingLike = {
  id: string;
  status?: string;
  expiresAt?: Timestamp | null;
};

export function getExpiredActiveListingIds(
  listings: ListingLike[],
  now: Date = new Date()
): string[] {
  const nowMs = now.getTime();

  return listings
    .filter((l) => {
      if (!l.expiresAt) return false; // anúncios antigos continuam visíveis/inalterados
      const expMs = l.expiresAt.toMillis();
      const isExpired = expMs < nowMs;
      const isActive = (l.status ?? "active") === "active";
      return isExpired && isActive;
    })
    .map((l) => l.id);
}
