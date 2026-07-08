"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MapEmbedFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
}

function extractEmbedSrc(value: string): string | null {
  if (!value) return null;

  const iframeMatch = value.match(/src=["']([^"']+)["']/i);
  if (iframeMatch) return iframeMatch[1];

  if (value.startsWith("http")) return value;

  return null;
}

export function MapEmbedField({
  value,
  onChange,
  disabled = false,
  label = "Map embed",
}: MapEmbedFieldProps) {
  const embedSrc = useMemo(() => extractEmbedSrc(value), [value]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="mapEmbed">{label}</Label>
        <Input
          id="mapEmbed"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Paste Google Maps embed URL or iframe code"
        />
        <p className="text-xs text-muted-foreground">
          Paste a Google Maps share link, embed URL, or full iframe HTML.
        </p>
      </div>

      {embedSrc && (
        <div className="overflow-hidden rounded-lg border">
          <iframe
            src={embedSrc}
            title="Map preview"
            className="h-64 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </div>
  );
}
