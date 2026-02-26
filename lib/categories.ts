// Lista oficial de categorias do VendaJá STP
// Esta lista será usada na homepage, no /new e nos filtros de /listings

export const CATEGORIES = [
    "Veículos",
    "Aluguer de Carros",
    "Imóveis",
    "Quartos & Arrendamento",
    "Moda & Beleza",
    "Serviços",
    "Guest House & Turismo",
    "Tecnologia",
    "Casa & Mobiliário",
    "Outros",
    "Procuro",
  ] as const;
  
  // Tipo automático baseado na lista acima
  export type Category = (typeof CATEGORIES)[number];