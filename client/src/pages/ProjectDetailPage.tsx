import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Code2, ExternalLink, Server, ShieldCheck } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import { FALLBACK_PORTFOLIO } from '../data/companyData';
import type { PortfolioProject } from '../types';

export default function ProjectDetailPage({ portfolio }: { portfolio?: PortfolioProject[] }) {
  const { slug } = useParams<{ slug: string }>();
  const initialList = portfolio && portfolio.length > 0 ? portfolio : FALLBACK_PORTFOLIO;
  const [project, setProject] = useState<PortfolioProject | undefined>(() =>
    initialList.find((p) => p.slug === slug)
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'code'>('overview');

  useEffect(() => {
    const localMatch = initialList.find((p) => p.slug === slug);
    if (localMatch) setProject(localMatch);
    if (slug) {
      fetch(`/api/portfolio/${encodeURIComponent(slug)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          if (json?.success && json.project) setProject(json.project);
        })
        .catch(() => {});
    }
  }, [slug, initialList]);

  if (!project) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Project Concept Not Found</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The requested portfolio blueprint could not be found.
        </p>
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-navy-950 min-h-screen">
      <SeoHead
        title={`${project.title} — DEVNEXUS TECH Case Study`}
        description={project.description}
      />

      <section className="py-16 bg-white dark:bg-navy-900/40 border-b border-slate-200 dark:border-slate-800/80 architectural-grid">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-xs font-mono text-sky-600 dark:text-electric-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portfolio Gallery</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-sky-500/10 text-sky-700 dark:text-electric-400 border border-sky-500/20">
              {project.category}
            </span>
            <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              {project.badge} • Demonstration Concept
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white">
            {project.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {project.tagline} — {project.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {project.metrics.map((m) => (
              <div key={m.label} className="architectural-card rounded-2xl p-4">
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400">{m.label}</div>
                <div className="font-display text-xl font-bold text-sky-600 dark:text-electric-400 mt-1">
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            {(
              [
                { id: 'overview', label: 'System Overview & Features' },
                { id: 'architecture', label: 'Architecture & Data Flow' },
                { id: 'code', label: 'Reference Implementation' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-navy-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 architectural-card rounded-2xl p-6 space-y-4">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  Key Engineered Capabilities
                </h2>
                <div className="space-y-3">
                  {project.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 architectural-card rounded-2xl p-6 space-y-5">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Technology Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-sky-700 dark:text-electric-400"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-800 dark:text-amber-200 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Clearly marked architectural concept engineered by DEVNEXUS TECH.</span>
                </div>
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-mono text-sky-600 dark:text-electric-400 hover:underline"
                  >
                    <span>View Reference Repository</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="architectural-card rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-sky-600 dark:text-electric-400" />
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  Architectural Blueprint
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-mono">
                {project.architecture}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                {[
                  { step: '01 Client Layer', desc: 'Responsive React + TypeScript interface with role-aware routing.' },
                  { step: '02 API & Auth', desc: 'Appwrite JWT validation, rate limiting, and strict schema sanitization.' },
                  { step: '03 Core Data', desc: 'PostgreSQL / Appwrite transactional storage with foreign-key integrity.' },
                  { step: '04 Automation', desc: 'Signed n8n webhooks, email notifications, and audit logging.' },
                ].map((node) => (
                  <div key={node.step} className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-mono font-bold text-sky-600 dark:text-electric-400">{node.step}</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{node.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="rounded-2xl overflow-hidden bg-navy-950 border border-slate-800 p-6 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-electric-400" />
                  Reference Backend Implementation Snippet
                </span>
                <span className="text-emerald-400">DEVNEXUS Concept Code</span>
              </div>
              <pre className="text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                {project.sample_code ||
                  `# Reference handler pattern for ${project.title}\n# Validated input -> RBAC check -> PostgreSQL / Appwrite persistence -> Signed Webhook`}
              </pre>
            </div>
          )}

          <div className="architectural-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Need a Production Platform Like This?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                We tailor every architecture specifically to your domain rules, security posture, and budget.
              </p>
            </div>
            <Link
              to={`/start-project?service=${encodeURIComponent(project.category)}&ref=${encodeURIComponent(project.title)}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 shrink-0"
            >
              <span>Request Custom Build</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
