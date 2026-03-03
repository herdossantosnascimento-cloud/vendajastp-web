import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type PaymentMethod = "sao_wallet" | "bank_transfer" | "stripe";
export type UserPlan = "free" | "monthly" | "annual";

export function makePaymentRef(uid: string, plan: UserPlan) {
  const short = String(uid || "user").slice(0, 6).toUpperCase();
  const stamp = String(Date.now());
  const last = stamp.slice(-6);
  return `VJ-${short}-${plan.toUpperCase()}-${last}`;
}

export async function requestPlanPayment(params: {
  uid: string;
  plan: Exclude<UserPlan, "free">;
  method: PaymentMethod;
}) {
  const { uid, plan, method } = params;

  const paymentRef = makePaymentRef(uid, plan);

  await updateDoc(doc(db, "users", uid), {
    plan,
    planStatus: "pending_payment",
    paymentMethod: method,
    paymentRef,
    paymentRequestedAt: serverTimestamp(),
  });

  return { paymentRef };
}

export async function markPaymentSent(params: { uid: string }) {
  const { uid } = params;

  await updateDoc(doc(db, "users", uid), {
    planStatus: "waiting_confirmation",
    paymentSentAt: serverTimestamp(),
  });
}
