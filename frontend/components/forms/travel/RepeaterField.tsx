"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPicker } from "@/components/forms/travel/IconPicker";
import type { RepeaterItem } from "@/types/travel";

interface RepeaterFieldProps {
  label: string;
  items: RepeaterItem[];
  onChange: (items: RepeaterItem[]) => void;
  placeholder?: string;
  disabled?: boolean;
  showIcon?: boolean;
}

function generateId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function RepeaterField({
  label,
  items,
  onChange,
  placeholder = "Enter item...",
  disabled = false,
  showIcon = false,
}: RepeaterFieldProps) {
  function addItem() {
    onChange([
      ...items,
      { id: generateId(), text: "", ...(showIcon ? { icon: "" } : {}) },
    ]);
  }

  function updateItem(id: string, text: string) {
    onChange(items.map((item) => (item.id === id ? { ...item, text } : item)));
  }

  function updateIcon(id: string, icon: string) {
    onChange(items.map((item) => (item.id === id ? { ...item, icon } : item)));
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {!disabled && (
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-start gap-2">
              <span className="mt-2.5 text-xs text-muted-foreground w-5 shrink-0">
                {index + 1}.
              </span>
              {showIcon && (
                <IconPicker
                  value={item.icon ?? ""}
                  onChange={(icon) => updateIcon(item.id, icon)}
                  disabled={disabled}
                />
              )}
              <Input
                value={item.text}
                onChange={(e) => updateItem(item.id, e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                className="flex-1"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
