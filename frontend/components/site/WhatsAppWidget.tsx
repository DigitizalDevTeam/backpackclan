import Link from "next/link";
import { MessageCircle } from "lucide-react";

interface WhatsAppWidgetProps {
  phone: string;
}

export function WhatsAppWidget({ phone }: WhatsAppWidgetProps) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  return (
    <Link
      href={`https://wa.me/${digits}?text=Hi%20Backpackclan%2C%20I%27d%20like%20to%20plan%20a%20trip`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-transform hover:scale-105 hover:shadow-xl"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </Link>
  );
}
