import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, ArrowRight, CheckCircle2 } from 'lucide-react';
import { FALLBACK_SERVICES } from '../data/companyData';

export default function ProjectEstimator() {
  const navigate = useNavigate();
  const [serviceSlug, setServiceSlug] = useState('web-application-development');
  const [complexity, setComplexity] = useState<'mvp' | 'growth' | 'enterprise'>('growth');
  const [currency, setCurrency] = useState<'USD' | 'PKR'>('USD');
  const [aiAddon, setAiAddon] = useState(true);

  const selectedService = FALLBACK_SERVICES.find((s) => s.slug === serviceSlug) || FALLBACK_SERVICES[0];
  const baseUsd = selectedService.starting_price_usd || 1500;
  const multiplier = complexity === 'mvp' ? 1 : complexity === 'growth' ? 1.55 : 2.3;
  const rawMin = Math.round(baseUsd * multiplier + (aiAddon ? 450 : 0));
  const rawMax = Math.round(rawMin * 1.35);

  const formatEstimate = () => {
    if (currency === 'PKR') {
      const pkrRate = 278;
      return `PKR ${(rawMin * pkrRate).toLocaleString()} – PKR ${(rawMax * pkrRate).toLocaleString()}`;
    }
    return `$${rawMin.toLocaleString()} – $${rawMax.toLocaleString()} USD`;
  };

  return (
    <div className="architectural-card rounded-3xl p-7 sm:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-sky-500/10 text-sky-700 dark:text-electric-400 border border-sky-500/20">
            <Calculator className="w-3.5 h-3.5" />
            <span>INTERACTIVE INVESTMENT ESTIMATOR</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Estimate Scope & Milestone Budget
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Configure your service type, engineering depth, and AI integration needs for a transparent indicative range in USD or PKR.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5">
                Primary Service
              </label>
              <select
                value={serviceSlug}
                onChange={(e) => setServiceSlug(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              >
                {FALLBACK_SERVICES.map((svc) => (
                  <option key={svc.slug} value={svc.slug}>
                    {svc.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5">
                Architecture Tier
              </label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value as 'mvp' | 'growth' | 'enterprise')}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              >
                <option value="mvp">Launch / MVP Scope</option>
                <option value="growth">Growth / Multi-Integration</option>
                <option value="enterprise">Custom Enterprise Platform</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <label className="inline-flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={aiAddon}
                onChange={(e) => setAiAddon(e.target.checked)}
                className="rounded border-slate-400 text-sky-600 focus:ring-sky-500"
              />
              <span>Include AI Chatbot / n8n Automation Setup</span>
            </label>

            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 p-1 text-xs font-mono">
              {(['USD', 'PKR'] as const).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setCurrency(cur)}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    currency === cur
                      ? 'bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-2xl p-6 bg-slate-900 dark:bg-navy-950 border border-sky-500/30 text-white space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Indicative Milestone Range
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-electric-400">
              {formatEstimate()}
            </div>
            <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Estimated Delivery: {selectedService.delivery_window || '3 – 6 Weeks'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>100% Source Code & Repository Ownership</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Stripe, PayPal, Payoneer, JazzCash & Easypaisa Ready</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(`/start-project?service=${encodeURIComponent(selectedService.title)}&estimate=${encodeURIComponent(formatEstimate())}`)
              }
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-electric-400 to-electric-500 text-navy-950 hover:opacity-95 transition-opacity cursor-pointer"
            >
              <span>Continue With This Scope</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
