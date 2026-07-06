"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { menuItemSchema, type MenuItemFormValues } from "@/lib/validations/menu";
import type { MenuItem } from "@/types/menu";

interface MenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MenuItem | null;
  items: MenuItem[];
  defaultParentId?: string | null;
  onSubmit: (values: MenuItemFormValues) => Promise<void>;
}

export function MenuItemDialog({
  open,
  onOpenChange,
  item,
  items,
  defaultParentId = null,
  onSubmit,
}: MenuItemDialogProps) {
  const isEdit = !!item;
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      label: "",
      url: "",
      target: "_self",
      icon: null,
      parentId: defaultParentId,
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        label: item?.label ?? "",
        url: item?.url ?? "",
        target: item?.target ?? "_self",
        icon: item?.icon ?? null,
        parentId: item?.parentId ?? defaultParentId,
        isActive: item?.isActive ?? true,
      });
    }
  }, [open, item, defaultParentId, reset]);

  const parentOptions = items.filter((i) => i.id !== item?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          <DialogDescription>
            Configure the label, URL, and visibility for this menu link.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input id="label" placeholder="e.g. Destinations" {...register("label")} />
            {errors.label && (
              <p className="text-sm text-destructive">{errors.label.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="/destinations or https://..."
              {...register("url")}
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Open in</Label>
              <Controller
                name="target"
                control={control}
                render={({ field }) => (
                  <Select id="target" value={field.value} onChange={field.onChange}>
                    <option value="_self">Same tab</option>
                    <option value="_blank">New tab</option>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon (optional)</Label>
              <Input
                id="icon"
                placeholder="MapPin, Home..."
                {...register("icon")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">Parent item</Label>
            <Controller
              name="parentId"
              control={control}
              render={({ field }) => (
                <Select
                  id="parentId"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? null : e.target.value)
                  }
                >
                  <option value="">None (top level)</option>
                  {parentOptions.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.label}
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>

          <div className="flex items-center gap-3">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <input
                  id="isActive"
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded accent-primary"
                />
              )}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Visible in menu
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Update Item"
              ) : (
                "Add Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
