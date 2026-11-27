import React from 'react';

interface BrandLogoProps {
  compact?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function BrandLogo({ compact = false, size = 'md' }: BrandLogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div className="inline-flex items-center gap-3 select-none">
      <div
        className={`${iconSizes[size]} rounded-xl bg-slate-900 dark:bg-navy-900 border border-sky-500/40 flex items-center justify-center shadow-glow-sm relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 via-transparent to-blue-600/20" />
        <svg viewBox="0 0 40 40" className="w-6 h-6 relative z-10" fill="none" aria-hidden="true">
          <path
            d="M8 10H18C24.6274 10 30 15.3726 30 22C30 28.6274 24.6274 34 18 34H8V10Z"
            stroke="url(#dnx_logo_stroke)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M14 16L24 26M24 16L14 26" stroke="#00D2FF" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="32" cy="10" r="2.75" fill="#38BDF8" />
          <defs>
            <linearGradient id="dnx_logo_stroke" x1="8" y1="10" x2="30" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#2563EB" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="font-display font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
            DEVNEXUS <span className="text-sky-600 dark:text-electric-400">TECH</span>
          </span>
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mt-1">
            Software & AI Systems
          </span>
        </div>
      )}
    </div>
  );
}
