import { httpsCallable } from "firebase/functions";
import { ref, uploadBytes } from "firebase/storage";
import { functions, storage } from "@/lib/firebase";

function sanitizeFileName(name: string) {
  return String(name || "proof")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadPaymentProof(params: {
  uid: string;
  paymentId: string;
  file: File;
}) {
  const { uid, paymentId, file } = params;

  const safeName = sanitizeFileName(file.name || "proof");
  const proofPath = `payment_proofs/${uid}/${paymentId}/${Date.now()}_${safeName}`;

  await uploadBytes(ref(storage, proofPath), file);

  const fn = httpsCallable(functions, "attachPaymentProof");
  await fn({ paymentId, proofPath });

  return { proofPath };
}
