"use client";

import { useEffect, useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils/slug";

interface SlugFieldProps {
  value: string;
  onChange: (value: string) => void;
  sourceValue?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
}

export function SlugField({
  value,
  onChange,
  sourceValue = "",
  label = "Slug",
  disabled = false,
  error,
}: SlugFieldProps) {
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    if (locked && sourceValue) {
      onChange(slugify(sourceValue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync slug when lock/source changes
  }, [locked, sourceValue]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="slug">{label}</Label>
        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setLocked((prev) => !prev)}
          >
            {locked ? (
              <>
                <Lock className="h-3 w-3" />
                Auto
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3" />
                Manual
              </>
            )}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">/</span>
        <Input
          id="slug"
          value={value}
          onChange={(e) => onChange(slugify(e.target.value))}
          disabled={disabled || locked}
          placeholder="url-slug"
          className="font-mono text-sm"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        {locked
          ? "Slug updates automatically from the title."
          : "Manual slug editing enabled."}
      </p>
    </div>
  );
}
