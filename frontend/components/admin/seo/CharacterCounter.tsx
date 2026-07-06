import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  current: number;
  recommended: number;
  className?: string;
}

export function CharacterCounter({
  current,
  recommended,
  className,
}: CharacterCounterProps) {
  const isOver = current > recommended;
  const isWarning = current > recommended * 0.9 && !isOver;

  return (
    <p
      className={cn(
        "text-xs text-right",
        isOver && "text-destructive font-medium",
        isWarning && "text-amber-600",
        !isOver && !isWarning && "text-muted-foreground",
        className
      )}
    >
      {current}/{recommended}
      {isOver && " — too long"}
    </p>
  );
}
