import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Sparkles } from 'lucide-react';
import BrandLogo from './BrandLogo';
import NetworkHeroCanvas from './NetworkHeroCanvas';

interface AuthSplitShellProps {
  headline: string;
  subheadline: string;
  children: React.ReactNode;
}

export default function AuthSplitShell({ headline, subheadline, children }: AuthSplitShellProps) {
  return (
    <div className="min-h-[calc(100vh-76px)] grid grid-cols-1 lg:grid-cols-12 bg-slate-50 dark:bg-navy-950">
      {/* Left Brand & Animated Tech Artwork Panel */}
      <div className="lg:col-span-6 relative overflow-hidden bg-navy-950 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
        <NetworkHeroCanvas />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-electric-500/15 blur-[110px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-blue-600/15 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" aria-label="DEVNEXUS TECH Home">
            <BrandLogo />
          </Link>
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-electric-500/10 border border-electric-400/30 text-electric-400">
            Appwrite OAuth 2.0
          </span>
        </div>

        {/* Animated Abstract Lattice Illustration */}
        <div className="relative z-10 my-10 space-y-6">
          <div className="relative w-full max-w-md h-52 rounded-2xl bg-navy-900/75 border border-slate-800 p-5 overflow-hidden backdrop-blur-md">
            <svg viewBox="0 0 360 150" className="w-full h-full" fill="none" aria-hidden="true">
              <motion.circle
                cx="70"
                cy="75"
                r="42"
                stroke="#38BDF8"
                strokeOpacity="0.35"
                strokeDasharray="6 6"
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                style={{ originX: '70px', originY: '75px' }}
              />
              <motion.circle
                cx="180"
                cy="75"
                r="54"
                stroke="#00D2FF"
                strokeOpacity="0.45"
                strokeWidth="1.5"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.path
                d="M70 75 L180 35 L290 75 L180 115 Z"
                stroke="url(#dnx_auth_line)"
                strokeWidth="2"
                fill="rgba(0, 210, 255, 0.06)"
                animate={{ opacity: [0.65, 1, 0.65] }}
                transition={{ duration: 3.2, repeat: Infinity }}
              />
              <circle cx="70" cy="75" r="6" fill="#38BDF8" />
              <circle cx="180" cy="35" r="5" fill="#00D2FF" />
              <circle cx="290" cy="75" r="6" fill="#38BDF8" />
              <circle cx="180" cy="115" r="5" fill="#2563EB" />
              <defs>
                <linearGradient id="dnx_auth_line" x1="70" y1="35" x2="290" y2="115" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38BDF8" />
                  <stop offset="1" stopColor="#2563EB" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Lock className="w-3 h-3" />
                Zero-Trust Session Layer
              </span>
              <span>TLS + JWT Verified</span>
            </div>
          </div>

          <div className="space-y-3 max-w-lg">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-electric-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CLIENT & ENGINEERING WORKSPACE</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">{headline}</h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{subheadline}</p>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-5">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Official Google OAuth 2.0 via Appwrite
          </span>
          <span>•</span>
          <span>No OAuth tokens stored in database</span>
        </div>
      </div>

      {/* Right Authentication Form Panel */}
      <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-md space-y-6">
          {children}

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
            By continuing, you agree to our{' '}
            <Link to="/legal/terms" className="text-sky-600 dark:text-electric-400 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/legal/privacy" className="text-sky-600 dark:text-electric-400 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
