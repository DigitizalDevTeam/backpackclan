import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="mt-2 text-muted-foreground">This page could not be found.</p>
      <Button className="mt-8" asChild>
        <Link href="/login">Go to Login</Link>
      </Button>
    </div>
  );
}
