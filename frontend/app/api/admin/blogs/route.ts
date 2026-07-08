import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { createPost, getAllPosts } from "@/lib/mock/blog-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { BlogPostInput } from "@/types/blog";

export async function GET() {
  const { error, session } = await requirePermission("blogs.view");
  if (error) return error;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, "/v1/admin/blogs");
  }

  await mockDelay(250);
  return NextResponse.json({ success: true, data: getAllPosts() });
}

export async function POST(request: Request) {
  const { error, session } = await requirePermission("blogs.create");
  if (error) return error;

  try {
    const body = (await request.json()) as BlogPostInput;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, "/v1/admin/blogs", {
        method: "POST",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(400);
    const post = createPost(body);
    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create blog post";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
