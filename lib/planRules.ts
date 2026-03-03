export type UserPlan = "free" | "monthly" | "annual";

export function getPlanActiveLimit(plan: UserPlan): number {
  if (plan === "free") return 3;
  if (plan === "monthly") return 7;
  if (plan === "annual") return 12;
  return 3;
}

export function getPlanDurationDays(plan: UserPlan): number {
  if (plan === "monthly") return 30;
  if (plan === "annual") return 365;
  return 30;
}
