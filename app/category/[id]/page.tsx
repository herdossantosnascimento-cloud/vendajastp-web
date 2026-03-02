import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CategoryRedirectPage({ params }: Props) {
  const { id } = await params;
  const cleanId = String(id ?? "").trim();

  if (!cleanId) {
    redirect("/listings");
  }

  redirect(`/listings?cat=${encodeURIComponent(cleanId)}`);
}
