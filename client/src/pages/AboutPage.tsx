import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Compass, Eye, ShieldCheck, Target, UserCheck } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import { COMPANY, WHY_CHOOSE_US } from '../data/companyData';

export default function AboutPage() {
  const values = [
    {
      title: 'Radical Transparency',
      desc: 'Honest timelines, zero fabricated case studies, and direct architectural communication from day one.',
    },
    {
      title: 'Security By Default',
      desc: 'Server-side API secrets, validated inputs, RBAC authorization, and signed webhooks in every system.',
    },
    {
      title: 'Maintainable Craft',
      desc: 'Clean TypeScript, Python, and SQL codebases organized so your internal team can scale effortlessly.',
    },
    {
      title: 'Global & Local Fluency',
      desc: 'Engineered in Pakistan with UK, US, UAE, Canadian, and Australian timezone overlap and payment readiness.',
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-navy-950 min-h-screen">
      <SeoHead
        title="About Us — DEVNEXUS TECH | Mission, Approach & Founder"
        description="Learn about DEVNEXUS TECH, our mission, engineering values, delivery approach, and founder Shabeer Ahmed."
      />

      {/* Header */}
      <section className="py-20 bg-white dark:bg-navy-900/40 border-b border-slate-200 dark:border-slate-800/80 architectural-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-electric-400 font-semibold">
            About DEVNEXUS TECH
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mt-3 leading-tight">
            Engineering Digital Excellence for Pakistan & Global Markets.
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mt-5 leading-relaxed">
            DEVNEXUS TECH is a newly launched software development and AI solutions company built to unite enterprise
            architectural standards with agile, transparent execution.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="architectural-card rounded-3xl p-8 space-y-3">
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-electric-400">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              To empower growing businesses in Pakistan and worldwide with custom software, resilient web platforms,
              and practical AI automation that eliminate operational bottlenecks and compound long-term value.
            </p>
          </div>

          <div className="architectural-card rounded-3xl p-8 space-y-3">
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-electric-400">
              <Eye className="w-5 h-5" />
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Our Vision</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              To establish DEVNEXUS TECH as a trusted international engineering partner recognized for technical rigor,
              AI-augmented delivery velocity, and uncompromising honesty with every founding client.
            </p>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-16 bg-white dark:bg-navy-900/40 border-y border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-electric-400 font-semibold">
              Company Values
            </span>
            <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-2">
              Principles Guiding Every Commit
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v) => (
              <div key={v.title} className="architectural-card rounded-2xl p-6">
                <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-electric-400 mb-3" />
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">{v.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach & Why Work With Us */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-600 dark:text-electric-400 uppercase font-semibold">
              <Compass className="w-4 h-4" />
              <span>Our Engineering Approach</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
              Architecture Before Aesthetics. Proof Before Promises.
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Every project begins with relational schema design, API boundary mapping, and Figma validation. We ship
              vertical slices early to staging links so stakeholders inspect real working software throughout delivery.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHY_CHOOSE_US.slice(0, 4).map((item) => (
              <div key={item.title} className="architectural-card rounded-2xl p-5">
                <span className="text-[10px] font-mono uppercase text-sky-600 dark:text-electric-400">{item.tag}</span>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mt-1">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 bg-white dark:bg-navy-900/40 border-t border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="architectural-card rounded-3xl p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 flex flex-col items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 dark:from-electric-400 dark:to-blue-600 flex items-center justify-center text-white dark:text-navy-950 font-display font-bold text-2xl shadow-glow-sm">
                SA
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-600 dark:text-electric-400">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>FOUNDER LEADERSHIP</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {COMPANY.founder.name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{COMPANY.founder.role}</p>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              {COMPANY.founder.bio.map((p) => (
                <p key={p} className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {p}
                </p>
              ))}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {COMPANY.founder.credentials.map((cred) => (
                  <div key={cred} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{cred}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 flex flex-wrap gap-3">
                <Link
                  to="/start-project"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950"
                >
                  <span>Start a Project With Us</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white"
                >
                  <span>Contact Founder Directly</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
