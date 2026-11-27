import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import { FALLBACK_SERVICES } from '../data/companyData';
import type { ServiceItem } from '../types';

export default function ServicesPage({ services }: { services?: ServiceItem[] }) {
  const activeServices = services && services.length > 0 ? services : FALLBACK_SERVICES;

  return (
    <div className="bg-slate-50 dark:bg-navy-950 min-h-screen">
      <SeoHead
        title="Services — DEVNEXUS TECH | Software, Web, E-Commerce & AI Solutions"
        description="Explore all 9 engineering services at DEVNEXUS TECH: Website Development, Web Apps, E-commerce, Custom Software, AI Chatbots, AI Automation, Admin Dashboards, UI/UX Design, and API Integration."
      />

      <section className="py-20 bg-white dark:bg-navy-900/40 border-b border-slate-200 dark:border-slate-800/80 architectural-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-600 dark:text-electric-400 font-semibold uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Engineering & AI Capabilities</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
            Full-Lifecycle Software & AI Solutions.
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
            Every engagement includes clean architecture, validated security, responsive UI, and complete source code
            ownership tailored for Pakistani and international clients.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {activeServices.map((svc, idx) => (
            <article
              id={svc.slug}
              key={svc.slug}
              className="architectural-card rounded-3xl p-7 sm:p-10 scroll-mt-24"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-sky-600 dark:text-electric-400">
                      0{idx + 1}
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-electric-400 border border-sky-500/20">
                      {svc.badge}
                    </span>
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {svc.title}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {svc.full_desc}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {svc.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                    {svc.starting_price_usd && (
                      <span>
                        From <strong className="text-slate-900 dark:text-white">${svc.starting_price_usd.toLocaleString()} USD</strong>
                      </span>
                    )}
                    {svc.delivery_window && <span>Timeline: {svc.delivery_window}</span>}
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/start-project?service=${encodeURIComponent(svc.title)}`}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 hover:opacity-95 shadow-glow-sm"
                    >
                      <span>Inquire About {svc.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 dark:text-white">
                      Key Engineering Features
                    </h3>
                    <div className="space-y-2.5">
                      {svc.features.map((f) => (
                        <div key={f} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-electric-400 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 dark:text-white">
                      Business Benefits
                    </h3>
                    <div className="space-y-2.5">
                      {svc.benefits.map((b) => (
                        <div key={b} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
