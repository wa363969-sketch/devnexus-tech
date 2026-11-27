import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  Code2,
  Cpu,
  Globe2,
  Layers,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Workflow,
} from 'lucide-react';
import SeoHead from '../components/SeoHead';
import NetworkHeroCanvas from '../components/NetworkHeroCanvas';
import InteractiveArchitectureConsole from '../components/InteractiveArchitectureConsole';
import ProjectEstimator from '../components/ProjectEstimator';
import {
  COMPANY,
  DEVELOPMENT_PROCESS,
  FALLBACK_PORTFOLIO,
  FALLBACK_SERVICES,
  FALLBACK_TESTIMONIALS,
  FAQ_ITEMS,
  TECHNOLOGIES,
  WHY_CHOOSE_US,
} from '../data/companyData';
import type { PortfolioProject, ServiceItem, TestimonialItem } from '../types';

interface HomePageProps {
  services?: ServiceItem[];
  portfolio?: PortfolioProject[];
  testimonials?: TestimonialItem[];
}

const reveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function HomePage({ services, portfolio, testimonials }: HomePageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activePillar, setActivePillar] = useState<'software' | 'ai' | 'webapps' | 'ecommerce'>('software');

  const activeServices = services && services.length > 0 ? services : FALLBACK_SERVICES;
  const activePortfolio = (portfolio && portfolio.length > 0 ? portfolio : FALLBACK_PORTFOLIO).slice(0, 4);
  const activeTestimonials = testimonials && testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS;

  const expertisePillars = {
    software: {
      title: 'Custom Software Engineering',
      eyebrow: '01 • BESPOKE SYSTEMS',
      summary:
        'Tailor-made internal platforms, ERP modules, and API-driven applications built from normalized data schemas instead of fragile spreadsheets.',
      bullets: [
        'Relational PostgreSQL & Appwrite data architecture',
        'Granular Role-Based Access Control & security audit trails',
        'Clean Python & Node.js service layers with full documentation',
      ],
      serviceLink: '/services#custom-software-development',
    },
    ai: {
      title: 'AI Agents & n8n Automation',
      eyebrow: '02 • INTELLIGENT WORKFLOWS',
      summary:
        'Practical artificial intelligence powered by server-side OpenAI and Google Gemini APIs, wired into n8n webhooks, email, and WhatsApp Cloud.',
      bullets: [
        'Zero API key exposure in browser code (100% server-side inference)',
        'Automated inquiry triage, lead scoring & reply drafting',
        'HMAC-SHA256 secured n8n CRM & follow-up orchestration',
      ],
      serviceLink: '/services#ai-automation',
    },
    webapps: {
      title: 'Scalable Web Applications',
      eyebrow: '03 • FULL-STACK PLATFORMS',
      summary:
        'Multi-tenant SaaS products, client portals, and executive admin consoles engineered with React, Next.js, TypeScript, and Appwrite Auth.',
      bullets: [
        'Real Google OAuth 2.0 & encrypted session persistence',
        'Accessible dark & light interfaces with Framer Motion transitions',
        'Vercel-ready edge deployment and Core Web Vitals optimization',
      ],
      serviceLink: '/services#web-application-development',
    },
    ecommerce: {
      title: 'Global & Pakistani E-Commerce',
      eyebrow: '04 • DIGITAL COMMERCE',
      summary:
        'High-converting storefronts unifying international Stripe, PayPal, and Payoneer checkouts with Pakistani JazzCash and Easypaisa gateways.',
      bullets: [
        'Multi-currency catalogs (USD, GBP, EUR, CAD, AUD, PKR)',
        'Atomic inventory reservations and webhook payment verification',
        'Automated order receipts via Resend, SendGrid & WhatsApp',
      ],
      serviceLink: '/services#ecommerce-development',
    },
  };

  return (
    <>
      <SeoHead
        title="DEVNEXUS TECH — Engineering Tomorrow's Digital World"
        description="DEVNEXUS TECH is a software development and AI solutions company serving Pakistan and international clients with scalable web apps, custom software, e-commerce, and AI automation."
      />

      {/* 1. HERO EXPERIENCE */}
      <section className="relative overflow-hidden bg-slate-50 dark:bg-navy-950 architectural-grid border-b border-slate-200 dark:border-slate-800/80">
        <NetworkHeroCanvas />
        <div className="absolute -top-24 left-1/3 w-[520px] h-[360px] bg-sky-500/10 dark:bg-electric-500/12 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{COMPANY.foundedStage}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono bg-white/80 dark:bg-navy-900/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  <Globe2 className="w-3.5 h-3.5 text-sky-600 dark:text-electric-400" />
                  <span>Pakistan • UK • USA • Global</span>
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[62px] font-bold tracking-tight leading-[1.06] text-slate-950 dark:text-white">
                Engineering Tomorrow&apos;s{' '}
                <span className="text-gradient">Digital World.</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {COMPANY.heroSubtext}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  to="/start-project"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl font-semibold text-sm sm:text-base text-white dark:text-navy-950 bg-gradient-to-r from-sky-600 to-blue-600 dark:from-electric-400 dark:to-electric-500 hover:opacity-95 shadow-glow-md transition-all"
                >
                  <span>Start a Project</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/portfolio"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl font-semibold text-sm sm:text-base text-slate-800 dark:text-white bg-white/90 dark:bg-navy-900/90 border border-slate-300 dark:border-slate-700 hover:border-sky-500/60 transition-all"
                >
                  <span>Explore Our Work</span>
                </Link>
              </div>

              <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-electric-400 shrink-0" />
                  <span>Appwrite + Google OAuth</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-sky-600 dark:text-electric-400 shrink-0" />
                  <span>OpenAI • Gemini • n8n</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <Code2 className="w-4 h-4 text-sky-600 dark:text-electric-400 shrink-0" />
                  <span>100% Client IP Ownership</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="lg:col-span-5"
            >
              <InteractiveArchitectureConsole />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT DEVNEXUS TECH */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={reveal}
        className="py-20 bg-white dark:bg-navy-900/40 border-b border-slate-200 dark:border-slate-800/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-electric-400 font-semibold">
              About DEVNEXUS TECH
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Enterprise Engineering Discipline. Founding-Studio Agility.
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              DEVNEXUS TECH is a newly launched software development and AI solutions company headquartered in
              Pakistan, engineered from day one to serve ambitious Pakistani enterprises and international teams across
              the UK, USA, Canada, UAE, and Australia.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Rather than hiding behind inflated metrics or middleman layers, we pair transparent architectural
              craftsmanship with direct leadership from founder Shabeer Ahmed.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 dark:text-electric-400 hover:underline pt-1"
            >
              <span>Read our story, mission & founder background</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Tagline', val: COMPANY.tagline, note: 'Precision across every sprint' },
              { title: 'Focus', val: 'Software & AI Solutions', note: 'Full-stack web + n8n automation' },
              { title: 'Delivery Model', val: 'Direct Architect Access', note: 'Pakistan & International hours' },
              { title: 'Transparency', val: 'Zero Fabricated Claims', note: 'Honest concepts & live code' },
            ].map((item) => (
              <div key={item.title} className="architectural-card rounded-2xl p-5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {item.title}
                </div>
                <div className="font-display font-bold text-base text-slate-900 dark:text-white mt-1.5">
                  {item.val}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 3. WHAT WE BUILD (9 Core Services Matrix) */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={reveal}
        className="py-24 bg-slate-50 dark:bg-navy-950"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-electric-400 font-semibold">
                What We Build
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2">
                Nine Integrated Engineering Capabilities
              </h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 dark:text-electric-400 hover:underline shrink-0"
            >
              <span>Inspect detailed service specs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeServices.slice(0, 9).map((svc, idx) => (
              <div key={svc.slug} className="architectural-card rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-slate-400">0{idx + 1}</span>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-electric-400 border border-sky-500/20">
                      {svc.badge}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {svc.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {svc.short_desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {svc.technologies.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={`/start-project?service=${encodeURIComponent(svc.title)}`}
                    className="text-xs font-semibold text-sky-600 dark:text-electric-400 hover:underline inline-flex items-center gap-1 shrink-0 ml-2"
                  >
                    <span>Inquire</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 4, 5, 6, 7, 8. OUR EXPERTISE — Interactive Domain Deep-Dive (Software, AI, Web Apps, E-commerce) */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={reveal}
        className="py-24 bg-white dark:bg-navy-900/50 border-y border-slate-200 dark:border-slate-800/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-electric-400 font-semibold">
              Our Expertise
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2">
              Specialized Practice Areas Built for Scale
            </h2>
          </div>

          {/* Interactive Pillar Switcher */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {(
              [
                { id: 'software', label: 'Software Development', icon: Code2 },
                { id: 'ai', label: 'AI & Automation', icon: Bot },
                { id: 'webapps', label: 'Web Applications', icon: Layers },
                { id: 'ecommerce', label: 'E-commerce Solutions', icon: ShoppingBag },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActivePillar(id)}
                className={`flex items-center gap-3 p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  activePillar === id
                    ? 'bg-slate-900 dark:bg-navy-800 text-white border-sky-500/60 shadow-glow-sm'
                    : 'bg-slate-50 dark:bg-navy-950/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-sky-500/40'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${activePillar === id ? 'text-electric-400' : 'text-sky-600 dark:text-slate-400'}`} />
                <span className="font-display font-semibold text-sm">{label}</span>
              </button>
            ))}
          </div>

          {/* Active Pillar Spotlight */}
          <div className="architectural-card rounded-3xl p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="text-xs font-mono text-sky-600 dark:text-electric-400 font-semibold">
                {expertisePillars[activePillar].eyebrow}
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {expertisePillars[activePillar].title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {expertisePillars[activePillar].summary}
              </p>
              <div className="space-y-2.5 pt-2">
                {expertisePillars[activePillar].bullets.map((b) => (
                  <div key={b} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 flex flex-wrap gap-3">
                <Link
                  to={expertisePillars[activePillar].serviceLink}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 hover:opacity-95"
                >
                  <span>Explore Practice Details</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/start-project"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:border-sky-500/50"
                >
                  <span>Request Architecture Call</span>
                </Link>
              </div>
            </div>

            {/* 4 Architectural Domain Cards (Guarantees visible dedicated blocks for Software, AI, Web Apps, E-commerce) */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                <Code2 className="w-5 h-5 text-sky-600 dark:text-electric-400 mb-2" />
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Software Development</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Custom ERPs, APIs & PostgreSQL cores.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                <Workflow className="w-5 h-5 text-sky-600 dark:text-electric-400 mb-2" />
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">AI & Automation</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">OpenAI, Gemini & n8n CRM pipelines.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                <Layers className="w-5 h-5 text-sky-600 dark:text-electric-400 mb-2" />
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Web Applications</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">React, Next.js & Appwrite SaaS suites.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                <ShoppingBag className="w-5 h-5 text-sky-600 dark:text-electric-400 mb-2" />
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">E-commerce Solutions</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Stripe, PayPal, JazzCash & Easypaisa.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 9. SELECTED PROJECTS */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={reveal}
        className="py-24 bg-slate-50 dark:bg-navy-950"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-electric-400 font-semibold">
                Selected Projects
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2">
                Architectural Concepts & System Blueprints
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Transparently labelled demonstration concepts showcasing real-world system modeling and engineering quality.
              </p>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 dark:text-electric-400 hover:underline shrink-0"
            >
              <span>View all concepts</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activePortfolio.map((proj) => (
              <Link
                key={proj.slug}
                to={`/portfolio/${proj.slug}`}
                className="architectural-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-xs font-mono text-sky-600 dark:text-electric-400 font-semibold uppercase">
                      {proj.category}
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      {proj.badge}
                    </span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-electric-400 transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-electric-400 shrink-0">
                    <span>Case Study</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 10. TECHNOLOGIES & TOOLS */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={reveal}
        className="py-20 bg-white dark:bg-navy-900/40 border-y border-slate-200 dark:border-slate-800/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-electric-400 font-semibold">
                Technologies & Tools
              </span>
              <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-2">
                Production Stack Chosen for Longevity
              </h2>
            </div>
            <Link to="/technologies" className="text-sm font-semibold text-sky-600 dark:text-electric-400 hover:underline inline-flex items-center gap-1.5">
              <span>Explore full technology matrix</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TECHNOLOGIES.map((tech) => (
              <div key={tech.name} className="architectural-card rounded-2xl p-5">
                <div className="flex items-center gap-2 text-sky-600 dark:text-electric-400 font-mono text-[11px] uppercase mb-2">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{tech.category}</span>
                </div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">{tech.name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{tech.role}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 11. OUR DEVELOPMENT PROCESS */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={reveal}
        className="py-24 bg-slate-50 dark:bg-navy-950"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-electric-400 font-semibold">
              Our Development Process
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2">
              Six Milestones From Discovery to Production
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEVELOPMENT_PROCESS.map((stage) => (
              <div key={stage.step} className="architectural-card rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-bold text-sky-600 dark:text-electric-400">{stage.step}</span>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                      {stage.window}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-2">{stage.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{stage.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                  {stage.deliverables.map((d) => (
                    <div key={d} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-electric-400 shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 12. WHY CHOOSE US + INTERACTIVE ESTIMATOR */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={reveal}
        className="py-24 bg-white dark:bg-navy-900/40 border-y border-slate-200 dark:border-slate-800/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div>
            <div className="max-w-2xl mb-10">
              <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-electric-400 font-semibold">
                Why Choose Us
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2">
                Built on Engineering Integrity & Direct Accountability
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {WHY_CHOOSE_US.map((item) => (
                <div key={item.title} className="architectural-card rounded-2xl p-6">
                  <span className="inline-block text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-electric-400 border border-sky-500/20 mb-3">
                    {item.tag}
                  </span>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <ProjectEstimator />
        </div>
      </motion.section>

      {/* 13. CLIENT TESTIMONIALS (Clearly Labelled Demo Content) */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={reveal}
        className="py-24 bg-slate-50 dark:bg-navy-950"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-electric-400 font-semibold">
              Client Testimonials (Demo Preview Format)
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2">
              Transparent Endorsements — Ready for Founding Partners
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              As a newly launched engineering firm, DEVNEXUS TECH never publishes fake reviews. The cards below show our
              verified testimonial layout using clearly labelled illustrative demo text.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeTestimonials.map((t, idx) => (
              <div key={t.id || idx} className="architectural-card rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-semibold">
                      {t.is_demo ? 'DEMO / SAMPLE FORMAT' : 'VERIFIED CLIENT'}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{t.region}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">{t.author_name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{t.author_role} • {t.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 14. FREQUENTLY ASKED QUESTIONS */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={reveal}
        className="py-24 bg-white dark:bg-navy-900/40 border-t border-slate-200 dark:border-slate-800/80"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-electric-400 font-semibold">
              Frequently Asked Questions
            </span>
            <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-2">
              Clarity Before You Commit
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, idx) => {
              const open = openFaq === idx;
              return (
                <div key={faq.q} className="architectural-card rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : idx)}
                    aria-expanded={open}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left font-semibold text-sm sm:text-base text-slate-900 dark:text-white cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-sky-600 dark:text-electric-400 transition-transform ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {open && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* 15. CONTACT CTA */}
      <section className="py-20 bg-slate-900 dark:bg-navy-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-600/15 via-transparent to-blue-600/15 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-500/10 border border-electric-400/30 text-electric-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>READY TO ARCHITECT YOUR PLATFORM?</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
            Let&apos;s Engineer Your Next Digital Product.
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
            Start with a structured project scope wizard or connect directly with DEVNEXUS TECH via Email or WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/start-project"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-navy-950 bg-gradient-to-r from-electric-400 to-electric-500 shadow-glow-md hover:opacity-95"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm text-white border border-slate-600 hover:border-electric-400"
            >
              <span>Contact Engineering Desk</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
