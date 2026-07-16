import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SitePageShell } from "@/components/site/SitePageShell";
import { DestinationDetailView } from "@/components/destinations/DestinationDetailView";
import {
  getDestinationDetail,
} from "@/lib/site/destination-data";
import { getSiteLayoutData } from "@/lib/site/public-data";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface DestinationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: DestinationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getDestinationDetail(slug);
  if (!data) return { title: "Destination Not Found" };
  const { destination } = data;
  return {
    title: destination.seo?.metaTitle || `${destination.name} | Backpackclan`,
    description:
      destination.seo?.metaDescription ||
      destination.tagline ||
      `Explore trips to ${destination.name}`,
  };
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { slug } = await params;
  const [data, layout] = await Promise.all([
    getDestinationDetail(slug),
    getSiteLayoutData(),
  ]);

  if (!data) notFound();

  return (
    <SitePageShell>
      <DestinationDetailView
        destination={data.destination}
        trips={data.trips}
        mediaMap={layout.mediaMap}
      />
    </SitePageShell>
  );
}
