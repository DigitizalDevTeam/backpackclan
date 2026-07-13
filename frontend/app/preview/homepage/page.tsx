import { HomepagePreviewShell } from "@/components/homepage/HomepageRenderer";
import { HomeMarketing } from "@/components/homepage/HomeMarketing";

export default function HomepagePreviewPage() {
  return (
    <HomepagePreviewShell>
      <HomeMarketing fetchOnClient />
    </HomepagePreviewShell>
  );
}
