import type { UserPlan } from "./planRules";

type EffectivePlanInput = {
  plan?: string | null;
  planStatus?: string | null;
  planExpiresAt?: any;
};

function toDate(value: any): Date | null {
  if (!value) return null;

  if (typeof value?.toDate === "function") {
    try {
      return value.toDate();
    } catch {
      return null;
    }
  }

  if (value instanceof Date) return value;

  return null;
}

export function getEffectivePlan(input: EffectivePlanInput): UserPlan {
  const rawPlan = input.plan === "pro" ? "monthly" : input.plan;

  if (rawPlan !== "monthly" && rawPlan !== "annual") {
    return "free";
  }

  if (input.planStatus !== "active") {
    return "free";
  }

  const expiresAt = toDate(input.planExpiresAt);
  if (!expiresAt) {
    return "free";
  }

  if (expiresAt.getTime() <= Date.now()) {
    return "free";
  }

  return rawPlan;
}

export function getPlanLabel(plan: UserPlan): string {
  if (plan === "monthly") return "PRO Mensal";
  if (plan === "annual") return "PRO Anual";
  return "FREE";
}
