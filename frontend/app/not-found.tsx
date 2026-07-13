import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] px-4 text-center text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,130,32,0.22),transparent_55%)]" />
      <div className="homepage-pattern absolute inset-0 opacity-20" />

      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Backpackclan" className="mx-auto h-14 w-auto object-contain" />
        <p className="mt-10 font-display text-7xl font-bold tracking-tight text-transparent sm:text-8xl bg-gradient-to-r from-[#F58220] to-[#FFD200] bg-clip-text">
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">Trail not found</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/65 sm:text-base">
          This page wandered off the map. Let&apos;s get you back to the adventure.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-xl bg-gradient-to-r from-[#F58220] to-[#FFD200] font-semibold text-black hover:opacity-95"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Back home
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-xl border-white/25 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/trips">
              <Compass className="h-4 w-4" />
              Browse trips
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
