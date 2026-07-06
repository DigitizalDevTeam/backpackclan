import { z } from "zod";

export const userFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  roleId: z.string().min(1, "Role is required"),
  isActive: z.boolean(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
});

export const createUserSchema = userFormSchema.extend({
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const roleFormSchema = z.object({
  name: z.string().min(1, "Role name is required").min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string().max(1000).optional().or(z.literal("")),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
export type CreateUserValues = z.infer<typeof createUserSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type RoleFormValues = z.infer<typeof roleFormSchema>;
