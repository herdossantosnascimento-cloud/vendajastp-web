import { Timestamp } from "firebase/firestore";

type ListingLike = {
  id: string;
  status?: string;
  expiresAt?: any;
};

function toDateSafe(expiresAt: any): Date | null {
  if (!expiresAt) return null;
  if (expiresAt instanceof Date) return expiresAt;
  if (expiresAt instanceof Timestamp) return expiresAt.toDate();
  if (typeof expiresAt?.toDate === "function") return expiresAt.toDate();
  return null;
}

export function getExpiredActiveListingIds(
  listings: ListingLike[],
  now: Date = new Date()
): string[] {
  const nowMs = now.getTime();

  return listings
    .filter((l) => {
      if (!l.expiresAt) return false; // legado: não mexer
      const expDate = toDateSafe(l.expiresAt);
      if (!expDate) return false;

      const isExpired = expDate.getTime() < nowMs;
      const isActive = (l.status ?? "active") === "active";

      return isExpired && isActive;
    })
    .map((l) => l.id);
}
