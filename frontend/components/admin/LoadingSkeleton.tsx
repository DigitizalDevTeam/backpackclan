import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "table" | "cards" | "form";
  className?: string;
}

export function LoadingSkeleton({
  variant = "table",
  className,
}: LoadingSkeletonProps) {
  if (variant === "cards") {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className={cn("space-y-6 max-w-2xl", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border bg-card", className)}>
      <div className="border-b p-4">
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
