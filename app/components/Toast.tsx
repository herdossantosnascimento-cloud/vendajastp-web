"use client";

import { useEffect } from "react";

type ToastType = "success" | "error" | "info";

export default function Toast({
  open,
  type = "info",
  message,
  onClose,
}: {
  open: boolean;
  type?: ToastType;
  message: any; // ✅ aceita qualquer coisa
  onClose: () => void;
}) {
  // ✅ garante que é sempre string
  const msg = String(message ?? "");

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose(), 3500);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  const base =
    "fixed bottom-4 left-1/2 z-[9999] w-[min(92vw,520px)] -translate-x-1/2 rounded-2xl border px-4 py-3 shadow-lg";
  const styles =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : type === "error"
      ? "border-red-200 bg-red-50 text-red-900"
      : "border-gray-200 bg-white text-gray-900";

  return (
    <div className={`${base} ${styles}`} role="status" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold whitespace-pre-wrap">
          {msg || "Algo aconteceu…"}
        </div>

        <button
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-sm font-bold hover:bg-black/5"
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}