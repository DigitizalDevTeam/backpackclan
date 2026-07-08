"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import type { ItineraryDay } from "@/types/travel";

interface DayItineraryEditorProps {
  days: ItineraryDay[];
  onChange: (days: ItineraryDay[]) => void;
  disabled?: boolean;
}

function generateId(): string {
  return `day-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createEmptyDay(dayNumber: number): ItineraryDay {
  return {
    id: generateId(),
    dayNumber,
    title: "",
    description: "",
    meals: { breakfast: false, lunch: false, dinner: false },
    overnight: "",
    distance: "",
    altitude: "",
  };
}

function SortableDayCard({
  day,
  disabled,
  onUpdate,
  onRemove,
}: {
  day: ItineraryDay;
  disabled: boolean;
  onUpdate: (patch: Partial<ItineraryDay>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: day.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border bg-card p-4 space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!disabled && (
            <button
              type="button"
              className="cursor-grab text-muted-foreground hover:text-foreground"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}
          <span className="text-sm font-semibold">Day {day.dayNumber}</span>
        </div>
        {!disabled && (
          <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>

      <Input
        value={day.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        disabled={disabled}
        placeholder="Day title e.g. Manali to Jispa"
      />

      <RichTextEditor
        value={day.description}
        onChange={(description) => onUpdate({ description })}
        disabled={disabled}
        placeholder="Day description..."
      />

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Meals included</Label>
        <div className="flex gap-4">
          {(["breakfast", "lunch", "dinner"] as const).map((meal) => (
            <label key={meal} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={day.meals[meal]}
                onChange={(e) =>
                  onUpdate({
                    meals: { ...day.meals, [meal]: e.target.checked },
                  })
                }
                disabled={disabled}
                className="rounded border-input"
              />
              {meal === "breakfast" ? "B" : meal === "lunch" ? "L" : "D"}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          value={day.overnight}
          onChange={(e) => onUpdate({ overnight: e.target.value })}
          disabled={disabled}
          placeholder="Overnight stay"
        />
        <Input
          value={day.distance ?? ""}
          onChange={(e) => onUpdate({ distance: e.target.value })}
          disabled={disabled}
          placeholder="Distance (optional)"
        />
        <Input
          value={day.altitude ?? ""}
          onChange={(e) => onUpdate({ altitude: e.target.value })}
          disabled={disabled}
          placeholder="Altitude (optional)"
        />
      </div>
    </div>
  );
}

export function DayItineraryEditor({
  days,
  onChange,
  disabled = false,
}: DayItineraryEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function renumber(items: ItineraryDay[]): ItineraryDay[] {
    return items.map((day, index) => ({ ...day, dayNumber: index + 1 }));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = days.findIndex((d) => d.id === active.id);
    const newIndex = days.findIndex((d) => d.id === over.id);
    onChange(renumber(arrayMove(days, oldIndex, newIndex)));
  }

  function addDay() {
    onChange([...days, createEmptyDay(days.length + 1)]);
  }

  function updateDay(id: string, patch: Partial<ItineraryDay>) {
    onChange(days.map((day) => (day.id === id ? { ...day, ...patch } : day)));
  }

  function removeDay(id: string) {
    onChange(renumber(days.filter((day) => day.id !== id)));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Day-by-day itinerary</Label>
        {!disabled && (
          <Button type="button" variant="outline" size="sm" onClick={addDay}>
            <Plus className="h-4 w-4" />
            Add Day
          </Button>
        )}
      </div>

      {days.length === 0 ? (
        <p className="text-sm text-muted-foreground">No itinerary days yet.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={days.map((d) => d.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {days.map((day) => (
                <SortableDayCard
                  key={day.id}
                  day={day}
                  disabled={disabled}
                  onUpdate={(patch) => updateDay(day.id, patch)}
                  onRemove={() => removeDay(day.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
