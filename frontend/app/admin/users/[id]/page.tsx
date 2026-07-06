import { UserForm } from "@/components/admin/users/UserForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params;
  return <UserForm userId={id} />;
}
