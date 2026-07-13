interface SocialIconProps {
  network: "facebook" | "instagram" | "youtube" | "linkedin" | "whatsapp";
  className?: string;
}

export function SocialIcon({ network, className = "h-4 w-4" }: SocialIconProps) {
  const paths: Record<SocialIconProps["network"], string> = {
    facebook:
      "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
    instagram:
      "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2z",
    youtube:
      "M22 12c0 2.5-.3 4.2-.8 5.5-.5 1.2-1.6 2.1-2.9 2.5-1.3.4-5.3.5-8.3.5s-7-.1-8.3-.5a4.8 4.8 0 0 1-2.9-2.5C1 16.2.7 14.5.7 12s.3-4.2.8-5.5c.5-1.2 1.6-2.1 2.9-2.5 1.3-.4 5.3-.5 8.3-.5s7 .1 8.3.5c1.3.4 2.4 1.3 2.9 2.5.5 1.3.8 3 .8 5.5zM10 9v6l5-3-5-3z",
    linkedin:
      "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-12h4v2.3M2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
    whatsapp:
      "M20.5 3.5A11 11 0 0 0 3.4 17.7L2 22l4.4-1.3A11 11 0 1 0 20.5 3.5zM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-2.4.6.6-2.3-.2-.3A8 8 0 1 1 12 20zm4.4-5.7c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.7.9-.1.2-.3.2-.5.1-.2-.1-.9-.3-1.7-1.1-.6-.6-1.1-1.3-1.2-1.5-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4 0-.1 0-.3-.1-.4-.1-.1-.5-1.3-.7-1.8-.2-.5-.4-.4-.5-.4h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.4.5.2 1 .4 1.3.5.6.2 1.1.1 1.5.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3z",
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={paths[network]} />
    </svg>
  );
}

/** Build a clickable WhatsApp URL from phone or existing wa.me / api link. */
export function whatsappHref(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export function socialHref(
  network: SocialIconProps["network"],
  value: string
): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (network === "whatsapp") return whatsappHref(trimmed);
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}
