"use client";

import { useMemo, useState } from "react";
import { ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { HighlightIcon } from "@/components/site/HighlightIcon";
import {
  HIGHLIGHT_EMOJI_ICONS,
  HIGHLIGHT_LUCIDE_ICONS,
} from "@/lib/icons/highlight-icons";

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
  disabled?: boolean;
}

export function IconPicker({ value = "", onChange, disabled = false }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredIcons = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HIGHLIGHT_LUCIDE_ICONS;
    return HIGHLIGHT_LUCIDE_ICONS.filter(
      (option) =>
        option.name.toLowerCase().includes(q) ||
        option.label.toLowerCase().includes(q)
    );
  }, [query]);

  function selectIcon(icon: string) {
    onChange(icon);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="h-10 w-14 shrink-0 px-0"
        title={value ? "Change icon" : "Select icon"}
      >
        {value ? (
          <HighlightIcon icon={value} className="h-5 w-5" />
        ) : (
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select highlight icon</DialogTitle>
            <DialogDescription>
              Choose a travel icon or emoji for this highlight.
            </DialogDescription>
          </DialogHeader>

          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search icons..."
            autoFocus
          />

          <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
            <section>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Icons
              </p>
              {filteredIcons.length === 0 ? (
                <p className="text-sm text-muted-foreground">No icons match your search.</p>
              ) : (
                <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
                  {filteredIcons.map((option) => (
                    <button
                      key={option.name}
                      type="button"
                      title={option.label}
                      onClick={() => selectIcon(option.name)}
                      className={cn(
                        "flex h-10 w-full items-center justify-center rounded-md border transition-colors hover:bg-muted",
                        value === option.name && "border-primary bg-primary/5"
                      )}
                    >
                      <option.Icon className="h-5 w-5 text-primary" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {!query.trim() && (
              <section>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Emoji
                </p>
                <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
                  {HIGHLIGHT_EMOJI_ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => selectIcon(emoji)}
                      className={cn(
                        "flex h-10 w-full items-center justify-center rounded-md border text-xl transition-colors hover:bg-muted",
                        value === emoji && "border-primary bg-primary/5"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          {value && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => selectIcon("")}
            >
              Clear icon
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
