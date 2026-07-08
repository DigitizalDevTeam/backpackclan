"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import type { FaqItem } from "@/types/travel";

interface FaqRepeaterProps {
  items: FaqItem[];
  onChange: (items: FaqItem[]) => void;
  disabled?: boolean;
}

function generateId(): string {
  return `faq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function FaqRepeater({ items, onChange, disabled = false }: FaqRepeaterProps) {
  function addItem() {
    onChange([...items, { id: generateId(), question: "", answer: "" }]);
  }

  function updateItem(id: string, patch: Partial<FaqItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>FAQs</Label>
        {!disabled && (
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4" />
            Add FAQ
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No FAQs added yet.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-lg border bg-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  FAQ {index + 1}
                </span>
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
              <Input
                value={item.question}
                onChange={(e) => updateItem(item.id, { question: e.target.value })}
                disabled={disabled}
                placeholder="Question"
              />
              <RichTextEditor
                value={item.answer}
                onChange={(answer) => updateItem(item.id, { answer })}
                disabled={disabled}
                placeholder="Answer..."
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
