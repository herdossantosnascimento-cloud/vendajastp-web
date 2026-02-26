"use client";

const KEY = "vendaja:toast";

export function setNextToast(message: string, type: "success" | "error" | "info" = "success") {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify({ message, type, at: Date.now() }));
}

export function consumeNextToast(): { message: string; type: "success" | "error" | "info" } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    localStorage.removeItem(KEY);
    if (!data?.message) return null;
    return { message: String(data.message), type: (data.type ?? "success") };
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
}