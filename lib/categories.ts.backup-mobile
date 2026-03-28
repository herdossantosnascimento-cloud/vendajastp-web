// lib/categories.ts
import type { CategoryWithFields, FieldDefinition } from "./categoryFields.types";

export type Category = { id: string; label: string };

export const CATEGORIES: CategoryWithFields[] = [
  { id: "electronics", label: "Eletrónica" },

  // vehicles -> Carros (Venda)
  {
    id: "vehicles",
    label: "Veículos",
    fields: [
      { name: "vehicleType", label: "Tipo", type: "select", required: true, options: [
        { label: "Ligeiro", value: "ligeiro" },
        { label: "SUV", value: "suv" },
        { label: "Pickup", value: "pickup" },
        { label: "Carrinha", value: "carrinha" },
        { label: "Moto", value: "moto" },
      ]},
      { name: "brand", label: "Marca", type: "text", required: true },
      { name: "model", label: "Modelo", type: "text", required: true },
      { name: "year", label: "Ano", type: "number", required: true, min: 1950, max: 2100 },
      { name: "mileageKm", label: "Quilometragem (km)", type: "number", min: 0 },
      { name: "fuel", label: "Combustível", type: "select", options: [
        { label: "Gasolina", value: "gasolina" },
        { label: "Diesel", value: "diesel" },
        { label: "Híbrido", value: "hibrido" },
        { label: "Elétrico", value: "eletrico" },
      ]},
      { name: "gearbox", label: "Caixa", type: "select", options: [
        { label: "Manual", value: "manual" },
        { label: "Automática", value: "automatica" },
      ]},
      { name: "traction", label: "Tração", type: "select", options: [
        { label: "Dianteira", value: "fwd" },
        { label: "Traseira", value: "rwd" },
        { label: "4x4", value: "4x4" },
      ]},
      { name: "color", label: "Cor", type: "text" },
      { name: "documents", label: "Documentos", type: "select", options: [
        { label: "Em dia", value: "em_dia" },
        { label: "Pendentes", value: "pendentes" },
        { label: "Importado", value: "importado" },
      ]},
      { name: "carCondition", label: "Condição", type: "select", options: [
        { label: "Novo", value: "novo" },
        { label: "Como novo", value: "como_novo" },
        { label: "Bom", value: "bom" },
        { label: "Regular", value: "regular" },
      ]},
      // Nota: no teu form já existe price universal (string). Este currency é extra (opcional) — se quiseres podes remover.
      { name: "carPrice", label: "Preço (extra)", type: "currency", required: false, currencies: ["STD", "EUR"] },
    ],
  },

  // car_rental -> Aluguer de carros
  {
    id: "car_rental",
    label: "Aluguer de carros",
    fields: [
      { name: "rentalVehicleType", label: "Tipo de viatura", type: "select", required: true, options: [
        { label: "Ligeiro", value: "ligeiro" },
        { label: "SUV", value: "suv" },
        { label: "Pickup", value: "pickup" },
        { label: "Moto", value: "moto" },
      ]},
      { name: "brand", label: "Marca", type: "text", required: true },
      { name: "model", label: "Modelo", type: "text", required: true },
      { name: "pricePer", label: "Preço por", type: "select", required: true, options: [
        { label: "Dia", value: "dia" },
        { label: "Semana", value: "semana" },
      ]},
      { name: "rentalPrice", label: "Preço", type: "currency", required: true, currencies: ["STD", "EUR"], allowNegotiable: true },
      { name: "deposit", label: "Caução", type: "currency", required: false, currencies: ["STD", "EUR"], allowNegotiable: true },
      { name: "delivery", label: "Entrega", type: "select", required: false, options: [
        { label: "Sim", value: "sim" },
        { label: "Não", value: "nao" },
      ]},
      { name: "insuranceIncluded", label: "Seguro incluído", type: "select", required: false, options: [
        { label: "Sim", value: "sim" },
        { label: "Não", value: "nao" },
      ]},
      { name: "kmLimit", label: "Limite km", type: "text", required: false, placeholder: "Ex.: 200km/dia" },
      { name: "requirements", label: "Requisitos", type: "textarea", required: false },
      { name: "availability", label: "Disponibilidade", type: "text", required: false },
      { name: "preferredContact", label: "Contacto preferido", type: "select", required: false, options: [
        { label: "WhatsApp", value: "whatsapp" },
        { label: "Telefone", value: "telefone" },
        { label: "Ambos", value: "ambos" },
      ]},
    ],
  },

  { id: "home", label: "Casa & Jardim" },
  { id: "fashion", label: "Moda" },
  { id: "services", label: "Serviços" },

  // jobs -> Emprego
  {
    id: "jobs",
    label: "Empregos",
    fields: [
      { name: "jobType", label: "Tipo de emprego", type: "select", required: true, options: [
        { label: "Tempo inteiro", value: "tempo_inteiro" },
        { label: "Part-time", value: "part_time" },
        { label: "Freelance", value: "freelance" },
        { label: "Estágio", value: "estagio" },
        { label: "Temporário", value: "temporario" },
      ]},
      { name: "area", label: "Área", type: "text", required: true, placeholder: "Ex.: TI, Vendas, Hotelaria..." },
      { name: "role", label: "Função/Cargo", type: "text", required: true },
      { name: "salaryAmount", label: "Salário (valor)", type: "number", required: false, min: 0 },
      { name: "salaryType", label: "Salário (tipo)", type: "select", required: false, options: [
        { label: "Por mês", value: "mensal" },
        { label: "Por semana", value: "semanal" },
        { label: "Por dia", value: "diario" },
        { label: "Por hora", value: "hora" },
        { label: "Comissão", value: "comissao" },
        { label: "A combinar", value: "a_combinar" },
      ]},
      { name: "experience", label: "Experiência", type: "select", required: false, options: [
        { label: "Sem experiência", value: "0" },
        { label: "1+ ano", value: "1" },
        { label: "2+ anos", value: "2" },
        { label: "5+ anos", value: "5" },
      ]},
      { name: "level", label: "Nível", type: "select", required: false, options: [
        { label: "Júnior", value: "junior" },
        { label: "Pleno", value: "pleno" },
        { label: "Sénior", value: "senior" },
        { label: "Gestão", value: "gestao" },
      ]},
      { name: "requirements", label: "Requisitos", type: "textarea", required: false },
      { name: "schedule", label: "Horário", type: "text", required: false, placeholder: "Ex.: 08h–17h" },
      { name: "startDate", label: "Data de início", type: "date", required: false },
      { name: "howToApply", label: "Como candidatar", type: "textarea", required: false },
      { name: "applyMethod", label: "Email / Link (opcional)", type: "select", required: false, options: [
        { label: "Nenhum", value: "none" },
        { label: "Email", value: "email" },
        { label: "Link", value: "link" },
      ]},
      { name: "applyEmail", label: "Email para candidatura", type: "email", required: false, when: { field: "applyMethod", equals: "email" } },
      { name: "applyLink", label: "Link para candidatura", type: "url", required: false, when: { field: "applyMethod", equals: "link" } },
      { name: "deadline", label: "Data limite", type: "date", required: false },
    ],
  },

  // real_estate -> Imóveis
  {
    id: "real_estate",
    label: "Imóveis",
    fields: [
      { name: "propertyType", label: "Tipo", type: "select", required: true, options: [
        { label: "Casa", value: "casa" },
        { label: "Apartamento", value: "apartamento" },
        { label: "Terreno", value: "terreno" },
        { label: "Quarto", value: "quarto" },
        { label: "Loja", value: "loja" },
      ]},
      { name: "dealType", label: "Negócio", type: "select", required: true, options: [
        { label: "Venda", value: "venda" },
        { label: "Aluguer", value: "aluguer" },
      ]},
      { name: "propertyPrice", label: "Preço (extra)", type: "currency", required: false, currencies: ["STD", "EUR"], allowNegotiable: true },
      { name: "bedrooms", label: "Quartos", type: "number", required: false, min: 0 },
      { name: "bathrooms", label: "WC", type: "number", required: false, min: 0 },
      { name: "areaM2", label: "Área (m²)", type: "number", required: false, min: 0 },
      { name: "furnished", label: "Mobilado", type: "select", required: false, options: [
        { label: "Sim", value: "sim" },
        { label: "Não", value: "nao" },
      ]},
      { name: "utilitiesIncluded", label: "Água/Luz incluído", type: "select", required: false, options: [
        { label: "Sim", value: "sim" },
        { label: "Não", value: "nao" },
      ]},
    ],
  },

  // guest_house -> Guest house / alojamento
  {
    id: "guest_house",
    label: "Guest house",
    fields: [
      { name: "accommodationType", label: "Tipo", type: "select", required: true, options: [
        { label: "Guest House", value: "guesthouse" },
        { label: "Hotel", value: "hotel" },
        { label: "Apartamento", value: "apartamento" },
        { label: "Quarto", value: "quarto" },
        { label: "Casa", value: "casa" },
      ]},
      { name: "pricePerNight", label: "Preço por noite", type: "currency", required: true, currencies: ["STD", "EUR"], allowNegotiable: true },
      { name: "rooms", label: "Quartos", type: "number", required: false, min: 0 },
      { name: "beds", label: "Camas", type: "number", required: false, min: 0 },
      { name: "bathrooms", label: "WC", type: "number", required: false, min: 0 },
      { name: "capacity", label: "Capacidade", type: "number", required: false, min: 1 },
      { name: "services", label: "Serviços", type: "multiselect", required: false, options: [
        { label: "Wi-Fi", value: "wifi" },
        { label: "Pequeno-almoço", value: "pequeno_almoco" },
        { label: "Ar condicionado", value: "ac" },
        { label: "Estacionamento", value: "estacionamento" },
        { label: "Piscina", value: "piscina" },
        { label: "Limpeza", value: "limpeza" },
        { label: "Transfer", value: "transfer" },
      ]},
      { name: "checkin", label: "Check-in", type: "text", required: false, placeholder: "Ex.: 14:00" },
      { name: "checkout", label: "Check-out", type: "text", required: false, placeholder: "Ex.: 12:00" },
      { name: "rules", label: "Regras", type: "textarea", required: false },
      { name: "bookingLink", label: "Link reserva", type: "url", required: false },
      { name: "availability", label: "Disponibilidade", type: "text", required: false },
    ],
  },

  { id: "other", label: "Outros" },
];

export function getCategoryById(id?: string) {
  const key = String(id ?? "").trim();
  return CATEGORIES.find((c) => c.id === key);
}

export function getCategoryFields(id?: string): FieldDefinition[] {
  return getCategoryById(id)?.fields ?? [];
}

// (placeholder) - se não estás a usar Firestore para categorias ainda,
// podes deixar assim para o /me não rebentar quando chama seedDefaultCategories.
export async function seedDefaultCategories() {
  return { skipped: true };
}

// (compat) - se alguma parte do código ainda tenta carregar categorias via função
export async function getCategories(): Promise<CategoryWithFields[]> {
  return CATEGORIES;
}
