import { addDoc, collection, serverTimestamp } from "firebase/firestore";
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

  const docRef = await addDoc(collection(db, "payments"), {
    uid,
    plan,
    method,
    paymentRef,
    status: "pending_payment",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    paymentId: docRef.id,
    paymentRef,
  };
}
