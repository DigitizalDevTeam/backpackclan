import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { getSettings } from "@/lib/mock/settings-store";
import { getAllMedia } from "@/lib/mock/media-store";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateMetadata(): Metadata {
  const settings = getSettings();
  const mediaMap = Object.fromEntries(getAllMedia().map((m) => [m.id, m.url]));
  const faviconUrl = settings.general.faviconId
    ? mediaMap[settings.general.faviconId]
    : undefined;

  return {
    title: {
      default: settings.general.siteName,
      template: `%s | ${settings.general.siteName}`,
    },
    description: settings.general.tagline,
    ...(faviconUrl
      ? {
          icons: {
            icon: faviconUrl,
            shortcut: faviconUrl,
            apple: faviconUrl,
          },
        }
      : {}),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Toaster position="top-right" richColors closeButton duration={3000} />
      </body>
    </html>
  );
}
