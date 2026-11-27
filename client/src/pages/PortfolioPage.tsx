import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FolderGit2, ShieldCheck } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import { FALLBACK_PORTFOLIO } from '../data/companyData';
import type { PortfolioProject } from '../types';

export default function PortfolioPage({ portfolio }: { portfolio?: PortfolioProject[] }) {
  const items = portfolio && portfolio.length > 0 ? portfolio : FALLBACK_PORTFOLIO;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTech, setSelectedTech] = useState<string>('All');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(items.map((i) => i.category)))],
    [items]
  );

  const technologies = useMemo(
    () => ['All', ...Array.from(new Set(items.flatMap((i) => i.technologies)))],
    [items]
  );

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const catOk = selectedCategory === 'All' || item.category === selectedCategory;
      const techOk = selectedTech === 'All' || item.technologies.includes(selectedTech);
      return catOk && techOk;
    });
  }, [items, selectedCategory, selectedTech]);

  return (
    <div className="bg-slate-50 dark:bg-navy-950 min-h-screen">
      <SeoHead
        title="Portfolio & Architectural Concepts — DEVNEXUS TECH"
        description="Explore DEVNEXUS TECH architectural concepts across custom software, AI automation, multi-tenant web applications, and global e-commerce."
      />

      <section className="py-20 bg-white dark:bg-navy-900/40 border-b border-slate-200 dark:border-slate-800/80 architectural-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-600 dark:text-electric-400 font-semibold uppercase">
            <FolderGit2 className="w-4 h-4" />
            <span>Portfolio & System Blueprints</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white max-w-3xl">
            Architectural Concepts Demonstrating Real Engineering Depth.
          </h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              Honesty Guarantee: All showcase entries below are clearly marked as demonstration concepts—zero fabricated client logos or fake case claims.
            </span>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl architectural-card">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mr-1">Category:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 font-semibold'
                      : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="tech-filter" className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Tech Filter:
              </label>
              <select
                id="tech-filter"
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="rounded-xl px-3 py-1.5 text-xs font-mono bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                {technologies.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="architectural-card rounded-2xl p-12 text-center space-y-3">
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                No concept projects match the selected filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedTech('All');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((proj) => (
                <article key={proj.slug} className="architectural-card rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-mono uppercase font-semibold text-sky-600 dark:text-electric-400">
                        {proj.category}
                      </span>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        {proj.badge}
                      </span>
                    </div>

                    <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                      {proj.title}
                    </h2>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">{proj.tagline}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={`/portfolio/${proj.slug}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-electric-500 text-white dark:text-navy-950 hover:opacity-90"
                    >
                      <span>View Technical Case Study</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
