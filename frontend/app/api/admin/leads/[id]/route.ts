import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { deleteLead, getLeadById, updateLead } from "@/lib/mock/lead-store";
import { getLaravelApiUrl, useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { AdminLeadUpdateInput } from "@/types/lead";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { error, session } = await requirePermission("leads.view");
  if (error) return error;
  const { id } = await context.params;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/leads/${id}`);
  }

  await mockDelay(150);
  const lead = getLeadById(id);
  if (!lead) {
    return NextResponse.json(
      { success: false, errors: { form: "Lead not found" } },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: lead });
}

export async function PUT(request: Request, context: RouteContext) {
  const { error, session } = await requirePermission("leads.update");
  if (error) return error;
  const { id } = await context.params;

  try {
    const body = (await request.json()) as AdminLeadUpdateInput;
    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/leads/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    }
    await mockDelay(250);
    const lead = updateLead(id, body);
    if (!lead) {
      return NextResponse.json(
        { success: false, errors: { form: "Lead not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: lead });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { error, session } = await requirePermission("leads.delete");
  if (error) return error;
  const { id } = await context.params;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/leads/${id}`, { method: "DELETE" });
  }

  await mockDelay(200);
  if (!deleteLead(id)) {
    return NextResponse.json(
      { success: false, errors: { form: "Lead not found" } },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true });
}
