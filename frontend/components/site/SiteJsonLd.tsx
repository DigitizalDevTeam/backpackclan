interface SiteJsonLdProps {
  data: string;
}

export function SiteJsonLd({ data }: SiteJsonLdProps) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(parsed) }}
    />
  );
}
