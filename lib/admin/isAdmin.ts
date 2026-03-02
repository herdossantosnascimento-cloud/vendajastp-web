export function isAdminEmail(email?: string | null): boolean {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
  const allowed = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (!email) return false;
  return allowed.includes(String(email).trim().toLowerCase());
}
