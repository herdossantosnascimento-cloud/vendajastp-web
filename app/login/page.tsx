import { Suspense } from "react";
import LoginUI from "./ui";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-600">A carregar…</div>}>
      <LoginUI />
    </Suspense>
  );
}
