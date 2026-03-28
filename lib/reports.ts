import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type ReportReason =
  | "fraud"
  | "offensive"
  | "prohibited"
  | "false_info"
  | "spam"
  | "other";

function normalizeText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export async function createListingReport(args: {
  listingId: string;
  listingTitle: string;
  listingOwnerId: string;
  reportedBy: string;
  reason: ReportReason;
  details?: string;
}) {
  const listingId = normalizeText(args.listingId);
  const listingTitle = normalizeText(args.listingTitle);
  const listingOwnerId = normalizeText(args.listingOwnerId);
  const reportedBy = normalizeText(args.reportedBy);
  const reason = normalizeText(args.reason) as ReportReason;
  const details = String(args.details ?? "").trim();

  if (!reportedBy) throw new Error("Precisas de iniciar sessão.");
  if (!listingId) throw new Error("Anúncio inválido.");
  if (!listingTitle) throw new Error("Título do anúncio em falta.");
  if (!listingOwnerId) throw new Error("Vendedor inválido.");
  if (reportedBy === listingOwnerId) {
    throw new Error("Não podes denunciar o teu próprio anúncio.");
  }

  const allowedReasons: ReportReason[] = [
    "fraud",
    "offensive",
    "prohibited",
    "false_info",
    "spam",
    "other",
  ];

  if (!allowedReasons.includes(reason)) {
    throw new Error("Motivo de denúncia inválido.");
  }

  if (details.length > 1000) {
    throw new Error("Os detalhes são demasiado longos.");
  }

  await addDoc(collection(db, "reports"), {
    listingId,
    listingTitle,
    listingOwnerId,
    reportedBy,
    reason,
    details,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
