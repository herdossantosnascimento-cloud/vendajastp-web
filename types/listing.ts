export type ListingStatus = "active" | "draft" | "sold" | "inactive";

export type ListingDynamicFields = Record<string, unknown>;

export interface Listing {
  id: string;

  title?: string;
  description?: string;
  price?: number;

  categoryId: string;

  // Campos dinâmicos por categoria
  fields: ListingDynamicFields;

  status: ListingStatus;

  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

export type ListingCreateInput = Omit<Listing, "id" | "createdAt" | "updatedAt">;

export type ListingUpdateInput = Partial<Omit<Listing, "id" | "createdAt">>;
