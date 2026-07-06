import { Suspense } from "react";
import { Mountain } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Mountain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Backpackclan</h1>
          <p className="mt-1 text-sm text-slate-400">Travel Portal Admin</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <Suspense
            fallback={
              <div className="space-y-4 p-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
