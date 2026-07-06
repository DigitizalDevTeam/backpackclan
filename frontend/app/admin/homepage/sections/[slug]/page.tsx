import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SectionEditor } from "@/components/admin/homepage/SectionEditor";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function HomepageSectionPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { slug } = await params;

  return <SectionEditor slug={slug} userRole={session.user.role} />;
}
