import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import type { ResolvedInquiry } from "@/lib/site/home-categories";

export function HomeInquiryCta({ inquiry }: { inquiry: ResolvedInquiry }) {
  return (
    <section className="site-section bg-gradient-to-br from-[#F58220] to-[#FFD200]">
      <div className="site-container flex flex-col items-center justify-between gap-8 text-center lg:flex-row lg:text-left">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-black/60">
            Still planning?
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            {inquiry.headline}
          </h2>
          <p className="mt-3 text-sm text-black/70 sm:text-base">{inquiry.description}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href={inquiry.buttonUrl}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-black px-7 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-slate-900"
          >
            <MessageCircle className="h-4 w-4" />
            {inquiry.buttonText}
          </Link>
          {inquiry.secondaryButtonText && inquiry.secondaryButtonUrl ? (
            <Link
              href={inquiry.secondaryButtonUrl}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-black/20 bg-white/40 px-7 text-sm font-bold uppercase tracking-wide text-black transition hover:bg-white"
            >
              {inquiry.secondaryButtonText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
