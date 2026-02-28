export const dynamic = "force-dynamic";

import RequireAuth from "@/app/components/RequireAuth";
import NewListingUI from "./ui";

export default function Page() {
  return (
    <RequireAuth>
      <NewListingUI />
    </RequireAuth>
  );
}
