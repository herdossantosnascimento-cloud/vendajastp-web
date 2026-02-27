// lib/categories.ts

export type Category = {
    id: string;
    label: string;
  };
  
  export const CATEGORIES: Category[] = [
    { id: "electronics", label: "Eletrónica" },
    { id: "vehicles", label: "Veículos" },
    { id: "home", label: "Casa & Jardim" },
    { id: "fashion", label: "Moda" },
    { id: "services", label: "Serviços" },
    { id: "jobs", label: "Empregos" },
    { id: "real_estate", label: "Imóveis" },
    { id: "other", label: "Outros" },
  ];
  
  // ✅ FUNÇÃO PARA USO NO NEW/UI
  export async function getCategories(): Promise<Category[]> {
    return CATEGORIES;
  }
  
  // ✅ FUNÇÃO PARA /me PAGE
  export async function seedDefaultCategories() {
    return {
      skipped: false,
    };
  }