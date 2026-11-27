import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Cpu } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import { TECHNOLOGIES } from '../data/companyData';

export default function TechnologiesPage() {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...Array.from(new Set(TECHNOLOGIES.map((t) => t.category)))];
  const items = filter === 'All' ? TECHNOLOGIES : TECHNOLOGIES.filter((t) => t.category === filter);

  return (
    <div className="bg-slate-50 dark:bg-navy-950 min-h-screen">
      <SeoHead
        title="Technologies — DEVNEXUS TECH | React, Next.js, Node.js, Python, PostgreSQL, Appwrite, n8n"
        description="Explore the core engineering technologies at DEVNEXUS TECH: HTML/CSS/JavaScript, React, Next.js, Node.js, Python, PostgreSQL, Appwrite, n8n, Figma, and Git/GitHub."
      />

      <section className="py-20 bg-white dark:bg-navy-900/40 border-b border-slate-200 dark:border-slate-800/80 architectural-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-electric-400 font-semibold">
            Engineering Stack
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mt-3">
            Modern Technologies Chosen for Reliability & Velocity.
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
            From Figma architecture and React/Next.js interfaces to Python, Node.js, PostgreSQL, Appwrite, and n8n
            automation—every tool serves a clear architectural responsibility.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold cursor-pointer transition-colors ${
                  filter === cat
                    ? 'bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950'
                    : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((tech) => (
              <div key={tech.name} className="architectural-card rounded-2xl p-6 sm:p-7 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-600 dark:text-electric-400">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>{tech.category}</span>
                  </span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    Production Standard
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{tech.name}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{tech.role}</p>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{tech.details}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="architectural-card rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Have an Existing Stack or Integration Requirement?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                We integrate cleanly with Appwrite, PostgreSQL, OpenAI, Gemini, Stripe, PayPal, JazzCash, Easypaisa, and n8n.
              </p>
            </div>
            <Link
              to="/start-project"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 shrink-0"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
