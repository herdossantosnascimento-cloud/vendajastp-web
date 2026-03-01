import { redirect } from "next/navigation";

export default function CategoryRedirectPage({
  params,
}: {
  params: { id: string };
}) {
  const id = String(params?.id ?? "").trim();

  if (!id) {
    redirect("/listings");
  }

  redirect(`/listings?cat=${encodeURIComponent(id)}`);
}
