import Link from "next/link";
import { Mountain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Mountain className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Backpackclan</span>
          </div>
          <Button asChild>
            <Link href="/login">
              Admin Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-teal-300">
          Travel Portal
        </p>
        <h1 className="max-w-3xl text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          Adventure awaits in the Himalayas
        </h1>
        <p className="mt-6 max-w-xl text-lg text-slate-400">
          The public website launches in Milestone 3. The admin CMS is being
          built now — sign in to manage content.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/login">Go to Admin Panel</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            asChild
          >
            <Link href="/preview/homepage">Preview Homepage</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
