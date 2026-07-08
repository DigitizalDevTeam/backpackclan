import {
  TripPreviewShell,
} from "@/components/trips/TripPreviewView";
import { TripsPreviewListing } from "@/components/trips/TripsPreviewListing";

export default function TripsPreviewListPage() {
  return (
    <TripPreviewShell>
      <TripsPreviewListing />
    </TripPreviewShell>
  );
}
