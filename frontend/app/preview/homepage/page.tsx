import {
  HomepagePreviewShell,
  HomepageRenderer,
} from "@/components/homepage/HomepageRenderer";

export default function HomepagePreviewPage() {
  return (
    <HomepagePreviewShell>
      <HomepageRenderer fetchOnClient />
    </HomepagePreviewShell>
  );
}
