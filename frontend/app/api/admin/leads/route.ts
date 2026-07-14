import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { createLead, getAllLeads, updateLead } from "@/lib/mock/lead-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { LeadStatus, LeadType } from "@/types/lead";

export async function GET(request: Request) {
  const { error, session } = await requirePermission("leads.view");
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  const query = qs ? `?${qs}` : "";

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/leads${query}`);
  }

  await mockDelay(200);
  let data = getAllLeads();
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  if (type) data = data.filter((l) => l.type === type);
  if (status) data = data.filter((l) => l.status === status);
  if (search) {
    data = data.filter(
      (l) =>
        l.name.toLowerCase().includes(search) ||
        (l.email ?? "").toLowerCase().includes(search) ||
        (l.phone ?? "").includes(search)
    );
  }
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const { error, session } = await requirePermission("leads.create");
  if (error) return error;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, "/v1/admin/leads", {
      method: "POST",
      body: await request.text(),
      headers: { "Content-Type": "application/json" },
    });
  }

  await mockDelay(250);
  const body = await request.json();
  if (!body.type || !body.name) {
    return NextResponse.json(
      { success: false, errors: { form: "type and name are required" } },
      { status: 422 }
    );
  }

  const lead = createLead({
    type: body.type as LeadType,
    name: body.name,
    email: body.email,
    phone: body.phone,
    payload: body.payload ?? {},
    sourceUrl: body.sourceUrl ?? "admin",
  });

  if (body.status || body.adminNotes) {
    const updated = updateLead(lead.id, {
      status: body.status as LeadStatus | undefined,
      adminNotes: body.adminNotes,
    });
    return NextResponse.json(
      { success: true, data: updated ?? lead },
      { status: 201 }
    );
  }

  return NextResponse.json({ success: true, data: lead }, { status: 201 });
}
