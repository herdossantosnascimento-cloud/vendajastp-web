"use client";

import { useEffect } from "react";

type ToastProps = {
  open: boolean;
  message: string;
  type?: "success" | "error" | "info";
  durationMs?: number;
  onClose: () => void;
};

export default function Toast({
  open,
  message,
  type = "success",
  durationMs = 2500,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose(), durationMs);
    return () => clearTimeout(t);
  }, [open, durationMs, onClose]);

  if (!open) return null;

  const base =
    "fixed left-1/2 top-4 z-[9999] -translate-x-1/2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg border";
  const styles =
    type === "success"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : type === "error"
      ? "bg-red-50 text-red-800 border-red-200"
      : "bg-slate-50 text-slate-800 border-slate-200";

  return (
    <div className={`${base} ${styles}`} role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-2 py-1 text-xs opacity-70 hover:opacity-100"
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}