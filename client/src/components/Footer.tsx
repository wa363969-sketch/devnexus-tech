import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Mail, MessageSquare, Lock, Globe2 } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { COMPANY } from '../data/companyData';

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-slate-100 dark:bg-navy-950 border-t border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-200 dark:border-slate-800/80">
          <div className="lg:col-span-5 space-y-4">
            <BrandLogo />
            <p className="text-sm leading-relaxed max-w-md text-slate-600 dark:text-slate-400">
              {COMPANY.tagline} A modern software development and AI solutions studio serving businesses in Pakistan
              and worldwide across the UK, USA, Canada, UAE, and Australia.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-700 dark:text-electric-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-full">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Pakistan & International Delivery</span>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 dark:text-white">
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-sky-600 dark:hover:text-electric-400">Home</Link></li>
              <li><Link to="/about" className="hover:text-sky-600 dark:hover:text-electric-400">About Us</Link></li>
              <li><Link to="/services" className="hover:text-sky-600 dark:hover:text-electric-400">Services</Link></li>
              <li><Link to="/portfolio" className="hover:text-sky-600 dark:hover:text-electric-400">Portfolio</Link></li>
              <li><Link to="/technologies" className="hover:text-sky-600 dark:hover:text-electric-400">Technologies</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 dark:text-white">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/start-project" className="hover:text-sky-600 dark:hover:text-electric-400">Start a Project</Link></li>
              <li><Link to="/contact" className="hover:text-sky-600 dark:hover:text-electric-400">Contact Us</Link></li>
              <li><Link to="/login" className="hover:text-sky-600 dark:hover:text-electric-400">Client Sign In</Link></li>
              <li><Link to="/register" className="hover:text-sky-600 dark:hover:text-electric-400">Create Account</Link></li>
              <li><Link to="/dashboard" className="hover:text-sky-600 dark:hover:text-electric-400">Client Portal</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 dark:text-white">
              Connect & Governance
            </h4>
            <div className="flex flex-wrap gap-2.5">
              <a
                href={`mailto:${COMPANY.contact.directEmail}`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-xs font-medium hover:border-sky-500/40"
              >
                <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-electric-400" />
                <span>Email</span>
              </a>
              <a
                href={COMPANY.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-xs font-medium hover:border-emerald-500/40"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>WhatsApp</span>
              </a>
            </div>
            <div className="flex flex-col gap-1.5 text-xs font-mono pt-1">
              <Link to="/legal/privacy" className="hover:text-sky-600 dark:hover:text-electric-400">
                Privacy Policy & NDA Standards
              </Link>
              <Link to="/legal/terms" className="hover:text-sky-600 dark:hover:text-electric-400">
                Terms of Service & IP Ownership
              </Link>
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white mt-1"
              >
                <Lock className="w-3 h-3" />
                <span>Admin Console</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <p>© {new Date().getFullYear()} DEVNEXUS TECH. Engineering Digital Excellence.</p>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500/40 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5 text-sky-600 dark:text-electric-400" />
          </button>
        </div>
      </div>
    </footer>
  );
}
