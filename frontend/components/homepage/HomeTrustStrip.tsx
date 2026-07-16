function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function TripAdvisorLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="8.5" cy="13" r="3.5" fill="#34E0A1" />
      <circle cx="15.5" cy="13" r="3.5" fill="#34E0A1" />
      <circle cx="8.5" cy="13" r="1.5" fill="#000" />
      <circle cx="15.5" cy="13" r="1.5" fill="#000" />
      <path
        fill="#34E0A1"
        d="M12 4c-3.5 0-6.5 2-7.8 5h15.6C18.5 6 15.5 4 12 4zm-9 6.5V20h2v-5.5c0-1 .5-2 1.5-2.5C8 11 10 10 12 10s4 1 5.5 2c1 .5 1.5 1.5 1.5 2.5V20h2v-9.5C19.5 7.5 16 5 12 5S4.5 7.5 3 10.5z"
      />
    </svg>
  );
}

export function HomeTrustStrip() {
  const items = [
    {
      id: "google",
      logo: <GoogleLogo className="h-7 w-7" />,
      rating: "4.5",
      label: "Google Reviews",
    },
    {
      id: "tripadvisor",
      logo: <TripAdvisorLogo className="h-7 w-7" />,
      rating: "4.7",
      label: "TripAdvisor",
    },
    {
      id: "since",
      logo: (
        <span className="text-lg font-bold text-[#F58220]">2016</span>
      ),
      rating: "Serving Since",
      label: "Adventure travel experts",
    },
    {
      id: "travelers",
      logo: (
        <span className="text-lg font-bold text-slate-800">18K+</span>
      ),
      rating: "Happy Travellers",
      label: "Across India & beyond",
    },
  ];

  return (
    <div className="relative z-10 -mt-6 px-4 sm:-mt-8">
      <div className="mx-auto grid max-w-5xl grid-cols-2 overflow-hidden rounded-2xl bg-white shadow-xl sm:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-center justify-center gap-2 border-b border-slate-100 px-4 py-5 text-center last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-100">
              {item.logo}
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 sm:text-lg">{item.rating}</p>
              <p className="text-[11px] font-semibold text-slate-500 sm:text-xs">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
