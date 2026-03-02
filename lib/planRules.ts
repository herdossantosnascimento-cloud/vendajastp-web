// lib/planRules.ts
export type UserPlan = "free" | "monthly" | "annual";

export function getPlanDurationDays(plan: UserPlan): number {
  switch (plan) {
    case "free":
      return 15;
    case "monthly":
      return 30;
    case "annual":
      return 90;
    default:
      return 15;
  }
}

// Só definimos explicitamente o limite do FREE agora.
// Mensal/anual ficam "Infinity" até definirem números finais.
export function getPlanActiveLimit(plan: UserPlan): number {
  if (plan === "free") return 3;
  return Number.POSITIVE_INFINITY;
}
