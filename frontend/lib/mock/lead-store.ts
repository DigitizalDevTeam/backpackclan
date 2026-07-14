import type { AdminLead, AdminLeadUpdateInput, LeadStatus, LeadType } from "@/types/lead";
import { loadMockData, saveMockData } from "@/lib/mock/persistence";

const SEED: AdminLead[] = [
  {
    id: "ld1",
    type: "contact",
    status: "new",
    name: "Riya Sharma",
    email: "riya@example.com",
    phone: "+919876543210",
    payload: { message: "Interested in Spiti for September", destination: "Spiti" },
    sourceUrl: "/contact",
    adminNotes: null,
    assignedTo: null,
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-07-01T10:00:00.000Z",
  },
];

let leads: AdminLead[] | null = null;

function store(): AdminLead[] {
  if (!leads) leads = loadMockData("leads", structuredClone(SEED));
  return leads;
}

function persist(): void {
  if (leads) saveMockData("leads", leads);
}

export function getAllLeads(): AdminLead[] {
  return [...store()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getLeadById(id: string): AdminLead | null {
  return store().find((l) => l.id === id) ?? null;
}

export function createLead(input: {
  type: LeadType;
  name: string;
  email?: string | null;
  phone?: string | null;
  payload?: Record<string, unknown>;
  sourceUrl?: string | null;
}): AdminLead {
  const now = new Date().toISOString();
  const lead: AdminLead = {
    id: `ld${Date.now()}`,
    type: input.type,
    status: "new",
    name: input.name,
    email: input.email ?? null,
    phone: input.phone ?? null,
    payload: input.payload ?? {},
    sourceUrl: input.sourceUrl ?? null,
    adminNotes: null,
    assignedTo: null,
    createdAt: now,
    updatedAt: now,
  };
  leads = [lead, ...store()];
  persist();
  return lead;
}

export function updateLead(
  id: string,
  input: AdminLeadUpdateInput
): AdminLead | null {
  const index = store().findIndex((l) => l.id === id);
  if (index === -1) return null;
  const updated: AdminLead = {
    ...store()[index],
    status: (input.status as LeadStatus) ?? store()[index].status,
    adminNotes:
      input.adminNotes !== undefined ? input.adminNotes : store()[index].adminNotes,
    assignedTo:
      input.assignedTo !== undefined ? input.assignedTo : store()[index].assignedTo,
    updatedAt: new Date().toISOString(),
  };
  leads = [...store().slice(0, index), updated, ...store().slice(index + 1)];
  persist();
  return updated;
}

export function deleteLead(id: string): boolean {
  const before = store().length;
  leads = store().filter((l) => l.id !== id);
  if (leads.length === before) return false;
  persist();
  return true;
}
