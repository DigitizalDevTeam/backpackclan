import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SitePageShell } from "@/components/site/SitePageShell";
import { SiteJsonLd } from "@/components/site/SiteJsonLd";
import { BlogDetailView } from "@/components/blog/BlogDetailView";
import {
  buildBlogPostJsonLd,
  buildBlogPostMetadata,
  getBlogDetailData,
} from "@/lib/site/blog-data";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildBlogPostMetadata(slug);
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const data = await getBlogDetailData(slug);
  if (!data) notFound();

  const jsonLd = buildBlogPostJsonLd(data.post, data.imageUrl);

  return (
    <SitePageShell>
      <SiteJsonLd data={JSON.stringify(jsonLd)} />
      <BlogDetailView
        post={data.post}
        imageUrl={data.imageUrl}
        related={data.related}
        mediaMap={data.mediaMap}
      />
    </SitePageShell>
  );
}
