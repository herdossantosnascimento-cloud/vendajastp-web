import RequireAuth from "@/app/components/RequireAuth";
import NewListingUI from "./ui";

export default function NewPage() {
  return (
    <RequireAuth>
      <NewListingUI />
    </RequireAuth>
  );
}