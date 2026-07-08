"use client";

import { Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker } from "@/components/forms/MediaPicker";
import type { TestimonialItem } from "@/types/travel";

interface TestimonialPickerProps {
  items: TestimonialItem[];
  onChange: (items: TestimonialItem[]) => void;
  disabled?: boolean;
}

function generateId(): string {
  return `testimonial-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function TestimonialPicker({
  items,
  onChange,
  disabled = false,
}: TestimonialPickerProps) {
  function addItem() {
    onChange([
      ...items,
      {
        id: generateId(),
        name: "",
        tripTaken: "",
        rating: 5,
        text: "",
        avatarId: null,
      },
    ]);
  }

  function updateItem(id: string, patch: Partial<TestimonialItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Testimonials</Label>
        {!disabled && (
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4" />
            Add Testimonial
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No testimonials yet.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border bg-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.name || "New testimonial"}</span>
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

              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  value={item.name}
                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                  disabled={disabled}
                  placeholder="Customer name"
                />
                <Input
                  value={item.tripTaken}
                  onChange={(e) => updateItem(item.id, { tripTaken: e.target.value })}
                  disabled={disabled}
                  placeholder="Trip taken"
                />
              </div>

              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground mr-2">Rating</Label>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={disabled}
                    onClick={() => updateItem(item.id, { rating: star })}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        star <= item.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <Textarea
                value={item.text}
                onChange={(e) => updateItem(item.id, { text: e.target.value })}
                disabled={disabled}
                placeholder="Testimonial text"
                rows={3}
              />

              <MediaPicker
                value={item.avatarId}
                onChange={(media) => updateItem(item.id, { avatarId: media?.id ?? null })}
                accept="image"
                disabled={disabled}
                label="Avatar (optional)"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
