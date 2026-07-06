"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { RoleForm } from "@/components/admin/roles/RoleForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Role"
        description="Update role details and permission assignments."
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/roles">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />
      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          <RoleForm
            roleId={id}
            onSuccess={() => router.push("/admin/roles")}
            onCancel={() => router.push("/admin/roles")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
