import { z } from "zod";

const phone = z.string().min(10, "Valid phone required");
const email = z.string().min(1, "Email is required").email("Invalid email");

export const contactLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email,
  phone,
  destination: z.string().optional(),
  message: z.string().min(10, "Please share a few details"),
});

export const callbackLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone,
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  preferredTime: z.string().optional(),
});

export const customTripLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email,
  phone,
  destination: z.string().min(1, "Destination is required"),
  travelers: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const n = Number(val);
      return Number.isFinite(n) ? n : undefined;
    },
    z.number().int().min(1).max(100).optional()
  ),
  travelDates: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().optional(),
});

export const corporateLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email,
  phone,
  company: z.string().min(1, "Company is required"),
  groupSize: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const n = Number(val);
      return Number.isFinite(n) ? n : undefined;
    },
    z.number().int().min(1).max(5000).optional()
  ),
  requirements: z.string().optional(),
});

export const partnerLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email,
  phone,
  organization: z.string().min(1, "Organization is required"),
  partnershipType: z.string().min(1, "Partnership type is required"),
  message: z.string().optional(),
});

export const careerLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email,
  phone,
  role: z.string().min(1, "Role is required"),
  message: z.string().optional(),
});

export const searchLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email,
  phone,
  destination: z.string().min(1, "Tell us what you're looking for"),
  travelers: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const n = Number(val);
      return Number.isFinite(n) ? n : undefined;
    },
    z.number().int().min(1).max(100).optional()
  ),
  message: z.string().optional(),
});

export type ContactLeadData = z.infer<typeof contactLeadSchema>;
export type CallbackLeadData = z.infer<typeof callbackLeadSchema>;
export type CustomTripLeadData = z.infer<typeof customTripLeadSchema>;
export type CorporateLeadData = z.infer<typeof corporateLeadSchema>;
export type PartnerLeadData = z.infer<typeof partnerLeadSchema>;
export type CareerLeadData = z.infer<typeof careerLeadSchema>;
export type SearchLeadData = z.infer<typeof searchLeadSchema>;
