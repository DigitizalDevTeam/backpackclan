import type { Metadata } from "next";
import { Geist_Mono, Oswald, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import { getSiteLayoutData } from "@/lib/site/public-data";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const layout = await getSiteLayoutData();
  const { settings, mediaMap } = layout;
  const faviconUrl =
    (settings.general.faviconId && mediaMap[settings.general.faviconId]) ||
    (settings.general.logoId && mediaMap[settings.general.logoId]) ||
    "/logo.png";

  return {
    title: {
      default: settings.general.siteName,
      template: `%s | ${settings.general.siteName}`,
    },
    description: settings.general.tagline,
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
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
      className={`${outfit.variable} ${oswald.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Toaster position="top-right" richColors closeButton duration={3000} />
      </body>
    </html>
  );
}
