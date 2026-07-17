import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  deletePost,
  getPostById,
  togglePostStatus,
  updatePost,
} from "@/lib/mock/blog-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { BlogPostInput } from "@/types/blog";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("blogs.view");
  if (error) return error;

  const { id } = await params;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/blogs/${id}`);
  }

  const post = getPostById(id);
  if (!post) {
    return NextResponse.json(
      { success: false, errors: { form: "Blog post not found" } },
      { status: 404 }
    );
  }

  await mockDelay(200);
  return NextResponse.json({ success: true, data: post });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("blogs.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = (await request.json()) as BlogPostInput;

    if (useLaravelApi()) {
      try {
        return await proxyToLaravel(session!, `/v1/admin/blogs/${id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to reach Laravel API";
        return NextResponse.json(
          { success: false, errors: { form: message } },
          { status: 502 }
        );
      }
    }

    await mockDelay(400);
    const post = updatePost(id, body);
    return NextResponse.json({ success: true, data: post });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update blog post";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("blogs.delete");
  if (error) return error;

  try {
    const { id } = await params;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/blogs/${id}`, {
        method: "DELETE",
      });
    }

    await mockDelay(300);
    deletePost(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete blog post";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("blogs.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/blogs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(200);

    if (body.action === "toggle") {
      const post = togglePostStatus(id);
      return NextResponse.json({ success: true, data: post });
    }

    return NextResponse.json(
      { success: false, errors: { form: "Invalid action" } },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update blog post";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
