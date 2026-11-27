import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Sun,
  Moon,
  ArrowRight,
  LogIn,
  LayoutDashboard,
  Shield,
  ChevronRight,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Technologies', to: '/technologies' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar({ announcement }: { announcement?: { enabled?: boolean; badge?: string; text?: string; cta_label?: string; cta_href?: string } }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {announcement?.enabled && announcement?.text && (
        <div className="bg-slate-900 dark:bg-navy-900 border-b border-slate-800 text-slate-200 text-xs py-2 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2.5 text-center">
            {announcement.badge && (
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 font-mono text-[10px] font-semibold tracking-wider">
                {announcement.badge}
              </span>
            )}
            <span className="text-slate-300">{announcement.text}</span>
            {announcement.cta_label && (
              <Link
                to={announcement.cta_href || '/start-project'}
                className="text-electric-400 hover:text-white font-semibold inline-flex items-center gap-1 underline underline-offset-4"
              >
                <span>{announcement.cta_label}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      )}

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass-panel shadow-lg py-3'
            : 'bg-white/70 dark:bg-navy-950/75 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/60 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <Link to="/" aria-label="DEVNEXUS TECH Home" className="shrink-0">
            <BrandLogo />
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-1 px-1.5 py-1 rounded-full bg-slate-100/85 dark:bg-navy-900/80 border border-slate-200/80 dark:border-slate-800/80"
          >
            {NAV_LINKS.map((item) => {
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    isActive
                      ? 'text-sky-700 dark:text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="dnx-nav-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-white dark:bg-navy-800 shadow-sm border border-slate-200 dark:border-sky-500/30 -z-10"
                    />
                  )}
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-electric-400 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="hidden md:flex items-center gap-2.5">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-sky-500/50 transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-sky-600 dark:text-electric-400" />
                    <span className="max-w-[110px] truncate">{user.name}</span>
                  </Link>
                  {user.isAdmin && (
                    <Link
                      to="/admin"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-sky-500/60 hover:text-sky-700 dark:hover:text-electric-400 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}

              <Link
                to="/start-project"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white dark:text-navy-950 bg-gradient-to-r from-sky-600 to-blue-600 dark:from-electric-400 dark:to-electric-500 hover:opacity-95 shadow-glow-sm transition-all"
              >
                <span>Start a Project</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle mobile menu"
              className="lg:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 34 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-white dark:bg-navy-950 border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between z-50 overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800">
                  <BrandLogo size="sm" />
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    aria-label="Close mobile menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="mt-6 flex flex-col gap-1.5">
                  {NAV_LINKS.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-sky-500/10 text-sky-700 dark:text-electric-400 border border-sky-500/20'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-900'
                        }`
                      }
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </NavLink>
                  ))}
                </nav>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white"
                  >
                    <LayoutDashboard className="w-4 h-4 text-sky-600 dark:text-electric-400" />
                    <span>Dashboard ({user.name})</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In / Register</span>
                  </Link>
                )}

                <Link
                  to="/start-project"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white dark:text-navy-950 bg-gradient-to-r from-sky-600 to-blue-600 dark:from-electric-400 dark:to-electric-500 shadow-glow-sm"
                >
                  <span>Start a Project</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
