import {
  DestinationPreviewShell,
} from "@/components/destinations/DestinationPreviewView";
import { DestinationsPreviewListing } from "@/components/destinations/DestinationsPreviewListing";

export default function DestinationsPreviewListPage() {
  return (
    <DestinationPreviewShell>
      <DestinationsPreviewListing />
    </DestinationPreviewShell>
  );
}
