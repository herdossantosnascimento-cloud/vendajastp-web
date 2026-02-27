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