"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const didRedirect = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (didRedirect.current) return;

    if (!user) {
      didRedirect.current = true;

      // se já estás no /login, não redireciona
      if (pathname === "/login") return;

      const next = `${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [user, loading, router, pathname, sp]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center text-sm opacity-70">
        A carregar…
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}