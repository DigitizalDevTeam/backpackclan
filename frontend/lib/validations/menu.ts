import { z } from "zod";

export const menuItemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().min(1, "URL is required"),
  target: z.enum(["_self", "_blank"]),
  icon: z.string().nullable(),
  parentId: z.string().nullable(),
  isActive: z.boolean(),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;
