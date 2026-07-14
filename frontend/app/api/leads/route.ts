import { NextResponse } from "next/server";
import { mockDelay } from "@/lib/mock/api-client";
import { createLead } from "@/lib/mock/lead-store";
import { getLaravelApiUrl, useLaravelApi } from "@/lib/api/backend";
import type { LeadType } from "@/types/lead";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (useLaravelApi()) {
      const url = `${getLaravelApiUrl()}/v1/leads`;
      if (contentType.includes("multipart/form-data")) {
        const form = await request.formData();
        const res = await fetch(url, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: form,
        });
        const data = await res.json().catch(() => ({ success: false }));
        return NextResponse.json(data, { status: res.status });
      }

      const body = await request.json();
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({ success: false }));
      return NextResponse.json(data, { status: res.status });
    }

    await mockDelay(400);

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const type = String(form.get("type") || "career") as LeadType;
      const name = String(form.get("name") || "");
      const email = String(form.get("email") || "") || null;
      const phone = String(form.get("phone") || "") || null;
      const role = String(form.get("payload[role]") || form.get("role") || "");
      const message = String(form.get("payload[message]") || form.get("message") || "");
      const resume = form.get("resume");
      const payload: Record<string, unknown> = { role, message };
      if (resume instanceof File && resume.size > 0) {
        payload.resumeName = resume.name;
      }
      const lead = createLead({
        type,
        name,
        email,
        phone,
        payload,
        sourceUrl: String(form.get("sourceUrl") || "") || null,
      });
      return NextResponse.json(
        {
          success: true,
          data: { id: lead.id, type: lead.type, message: "Thanks! Our team will reach out soon." },
        },
        { status: 201 }
      );
    }

    const body = await request.json();
    if (!body.type || !body.name) {
      return NextResponse.json(
        { success: false, errors: { form: "type and name are required" } },
        { status: 422 }
      );
    }
    const lead = createLead({
      type: body.type,
      name: body.name,
      email: body.email,
      phone: body.phone,
      payload: body.payload ?? {},
      sourceUrl: body.sourceUrl,
    });
    return NextResponse.json(
      {
        success: true,
        data: { id: lead.id, type: lead.type, message: "Thanks! Our team will reach out soon." },
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
