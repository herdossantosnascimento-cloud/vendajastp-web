export function isAdminEmail(email?: string | null) {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!adminEmail) return false;
  if (!email) return false;
  return email.toLowerCase() === adminEmail.toLowerCase();
}
