import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-6">
        <FileQuestion className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The admin page you&apos;re looking for doesn&apos;t exist or may have been
        moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/admin/dashboard">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/media">Browse Media</Link>
        </Button>
      </div>
    </div>
  );
}
