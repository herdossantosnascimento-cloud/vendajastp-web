import { getStorage, ref, uploadBytes } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";

export async function uploadPaymentProof(params: {
  paymentId: string;
  file: File;
}) {
  const { paymentId, file } = params;

  if (!file) throw new Error("Seleciona um ficheiro.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Máx 5MB.");

  const okType = file.type === "application/pdf" || file.type.startsWith("image/");
  if (!okType) throw new Error("Só PDF ou imagem.");

  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const proofPath = `payment_proofs/${paymentId}/${Date.now()}_${safeName}`;

  const storage = getStorage();
  await uploadBytes(ref(storage, proofPath), file);

  const fn = httpsCallable(getFunctions(), "attachPaymentProof");
  await fn({ paymentId, proofPath });

  return { proofPath };
}
