import { Calendar, Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function StarRating({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-hidden>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = rating >= index + 1;
        const half = !filled && rating > index && rating < index + 1;
        return (
          <Star
            key={index}
            className={cn(
              "h-3.5 w-3.5",
              filled || half
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200"
            )}
          />
        );
      })}
    </div>
  );
}

const TRUST_ITEMS = [
  {
    id: "google",
    value: "4.5",
    title: "Google Reviews",
    subtitle: "Verified traveller ratings",
    rating: 4.5,
    logo: <GoogleLogo className="h-9 w-9" />,
    logoWrap: "bg-white ring-1 ring-slate-200/80",
  },
  {
    id: "tripadvisor",
    value: "4.7",
    title: "TripAdvisor",
    subtitle: "Top-rated adventure operator",
    rating: 4.7,
    logo: (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/certifications/tripadvisor-travelers-choice.svg"
        alt=""
        className="h-10 w-10 object-contain"
      />
    ),
    logoWrap: "bg-[#e8fbf4] ring-1 ring-[#34e0a1]/30",
  },
  {
    id: "since",
    value: "2016",
    title: "Serving Since",
    subtitle: "Adventure travel experts",
    icon: Calendar,
    iconWrap: "bg-gradient-to-br from-[#F58220] to-[#e06b00] text-white shadow-md shadow-orange-500/25",
  },
  {
    id: "travelers",
    value: "18K+",
    title: "Happy Travellers",
    subtitle: "Across India & beyond",
    icon: Users,
    iconWrap: "bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-md shadow-slate-900/20",
  },
] as const;

export function HomeTrustStrip() {
  return (
    <div className="relative z-10 -mt-8 px-4 sm:-mt-10">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/90 bg-white/95 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 backdrop-blur-md">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {TRUST_ITEMS.map((item, index) => {
            const Icon = "icon" in item ? item.icon : null;

            return (
              <div
                key={item.id}
                className={cn(
                  "group relative flex flex-col items-center px-4 py-6 text-center transition-colors hover:bg-slate-50/90 sm:py-7",
                  index < TRUST_ITEMS.length - 1 && "sm:border-r sm:border-slate-100",
                  index % 2 === 0 && "border-r border-slate-100 sm:border-r",
                  index < 2 && "border-b border-slate-100 sm:border-b-0"
                )}
              >
                {"logo" in item ? (
                  <div
                    className={cn(
                      "mb-3 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-105",
                      item.logoWrap
                    )}
                  >
                    {item.logo}
                  </div>
                ) : Icon ? (
                  <div
                    className={cn(
                      "mb-3 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-105",
                      item.iconWrap
                    )}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2.2} />
                  </div>
                ) : null}

                <div className="flex items-center justify-center gap-2">
                  <span className="font-display text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-[1.65rem]">
                    {item.value}
                  </span>
                  {"rating" in item && item.rating ? (
                    <StarRating rating={item.rating} className="hidden sm:flex" />
                  ) : null}
                </div>

                {"rating" in item && item.rating ? (
                  <StarRating rating={item.rating} className="mt-1.5 sm:hidden" />
                ) : null}

                <p className="mt-2 text-sm font-bold text-slate-900">{item.title}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-500 sm:text-xs">
                  {item.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
