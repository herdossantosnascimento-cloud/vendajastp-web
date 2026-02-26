import RequireAuth from "@/app/components/RequireAuth";
import AccountUI from "./ui";

export default function Page() {
  return (
    <RequireAuth>
      <AccountUI />
    </RequireAuth>
  );
}