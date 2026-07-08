"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  DestinationPreviewShell,
  DestinationPreviewView,
} from "@/components/destinations/DestinationPreviewView";

export default function DestinationPreviewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [destinationId, setDestinationId] = useState<string | null>(null);

  useEffect(() => {
    async function loadId() {
      try {
        const res = await fetch(`/api/preview/destinations/${slug}`);
        const data = await res.json();
        if (data.success) setDestinationId(data.data.id);
      } catch {
        // ignore
      }
    }
    loadId();
  }, [slug]);

  return (
    <DestinationPreviewShell
      editHref={destinationId ? `/admin/destinations/${destinationId}` : undefined}
    >
      <DestinationPreviewView slug={slug} />
    </DestinationPreviewShell>
  );
}
