// lib/categories.ts

export type Category = {
  id: string;
  label: string;
};

export const CATEGORIES: Category[] = [
  { id: "electronics", label: "Eletrónica" },
  { id: "vehicles", label: "Veículos" },
  { id: "car_rental", label: "Aluguer de carros" },
  { id: "home", label: "Casa & Jardim" },
  { id: "fashion", label: "Moda" },
  { id: "services", label: "Serviços" },
  { id: "jobs", label: "Empregos" },
  { id: "real_estate", label: "Imóveis" },
  { id: "guest_house", label: "Guest house" },
  { id: "other", label: "Outros" },
];

// (placeholder) - se não estás a usar Firestore para categorias ainda,
// podes deixar assim para o /me não rebentar quando chama seedDefaultCategories.
export async function seedDefaultCategories() {
  return { skipped: true };
}

// (compat) - se alguma parte do código ainda tenta carregar categorias via função
export async function getCategories(): Promise<Category[]> {
  return CATEGORIES;
}
