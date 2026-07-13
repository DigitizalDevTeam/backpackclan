import { NextResponse } from "next/server";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import { mockDelay } from "@/lib/mock/api-client";
import {
  getPublishedPostBySlug,
  getRelatedPosts,
} from "@/lib/mock/blog-store";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;

  if (useLaravelApi()) {
    const { res, data } = await laravelFetch(
      `/v1/blogs/${encodeURIComponent(slug)}`
    );
    return NextResponse.json(data, { status: res.status });
  }

  await mockDelay(150);
  const post = getPublishedPostBySlug(slug);
  if (!post) {
    return NextResponse.json(
      { success: false, errors: { form: "Blog post not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      post,
      related: getRelatedPosts(slug, 3),
    },
  });
}
