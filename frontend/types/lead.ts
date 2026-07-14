export type LeadType =
  | "contact"
  | "callback"
  | "general"
  | "custom_trip"
  | "corporate"
  | "partner"
  | "career";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "closed";

export interface AdminLead {
  id: string;
  type: LeadType;
  status: LeadStatus;
  name: string;
  email: string | null;
  phone: string | null;
  payload: Record<string, unknown>;
  sourceUrl: string | null;
  adminNotes: string | null;
  assignedTo: string | null;
  assignee?: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLeadUpdateInput {
  status?: LeadStatus;
  adminNotes?: string | null;
  assignedTo?: string | null;
}

export interface AdminLeadCreateInput {
  type: LeadType;
  status?: LeadStatus;
  name: string;
  email?: string | null;
  phone?: string | null;
  sourceUrl?: string | null;
  adminNotes?: string | null;
  payload?: Record<string, unknown>;
}

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  contact: "Contact",
  callback: "Callback",
  general: "General inquiry",
  custom_trip: "Custom trip",
  corporate: "Corporate",
  partner: "Partner",
  career: "Career",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  closed: "Closed",
};
