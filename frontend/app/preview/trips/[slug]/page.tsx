"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TripPreviewShell, TripPreviewView } from "@/components/trips/TripPreviewView";

export default function TripPreviewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [tripId, setTripId] = useState<string | null>(null);

  useEffect(() => {
    async function loadId() {
      try {
        const res = await fetch(`/api/preview/trips/${slug}`);
        const data = await res.json();
        if (data.success) setTripId(data.data.id);
      } catch {
        // ignore
      }
    }
    loadId();
  }, [slug]);

  return (
    <TripPreviewShell editHref={tripId ? `/admin/trips/${tripId}` : undefined}>
      <TripPreviewView slug={slug} />
    </TripPreviewShell>
  );
}
