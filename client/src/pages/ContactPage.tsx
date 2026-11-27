import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe2,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import SeoHead from '../components/SeoHead';
import { COMPANY, FALLBACK_SERVICES } from '../data/companyData';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { ServiceItem } from '../types';

const COUNTRIES = [
  'Pakistan',
  'United Kingdom',
  'United States',
  'Canada',
  'United Arab Emirates',
  'Australia',
  'Saudi Arabia',
  'Germany',
  'Singapore',
  'Other International',
];

const BUDGET_RANGES = [
  '$500 – $1,500 USD (or PKR 150k – 400k)',
  '$1,500 – $3,500 USD (or PKR 400k – 950k)',
  '$3,500 – $7,500 USD (Full-Stack / AI Platform)',
  '$7,500+ USD (Custom Enterprise Engagement)',
];

export default function ContactPage({ services }: { services?: ServiceItem[] }) {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const serviceOptions = services && services.length > 0 ? services : FALLBACK_SERVICES;

  const [form, setForm] = useState({
    full_name: user?.name || '',
    email: user?.email || '',
    phone: '',
    company_name: '',
    country: 'Pakistan',
    project_type: searchParams.get('service') || serviceOptions[0].title,
    budget: BUDGET_RANGES[1],
    message: '',
    _gotcha: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
    detail?: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        full_name: prev.full_name || user.name,
        email: prev.email || user.email,
      }));
    }
  }, [user]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (form.full_name.trim().length < 2) nextErrors.full_name = 'Full name must be at least 2 characters.';
    if (!/^[\w.+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!form.project_type.trim()) nextErrors.project_type = 'Please select the service required.';
    if (!form.budget.trim()) nextErrors.budget = 'Please choose an estimated budget range.';
    if (form.message.trim().length < 10) {
      nextErrors.message = 'Please describe your project details (minimum 10 characters).';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || form._gotcha) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await apiRequest<{
        success: boolean;
        message?: string;
        errors?: Record<string, string>;
        inquiry_id?: number;
        integrations?: {
          email?: { admin_notification?: { sent?: boolean } };
          whatsapp?: { sent?: boolean };
          n8n?: { dispatched?: boolean };
        };
      }>('/api/contact', {
        method: 'POST',
        body: { ...form, source: 'contact_page' },
      });

      if (res.ok && res.data.success) {
        try {
          confetti({ particleCount: 65, spread: 60, origin: { y: 0.65 } });
        } catch {
          // ignore if blocked
        }
        const emailSent = res.data.integrations?.email?.admin_notification?.sent;
        setFeedback({
          type: 'success',
          text: `Inquiry #${res.data.inquiry_id ?? ''} received! DEVNEXUS TECH will respond within 24 business hours.`,
          detail: emailSent
            ? 'Email confirmation and admin notification dispatched.'
            : 'Saved securely in the DEVNEXUS TECH CRM database (email delivery activates once SMTP/Resend credentials are configured).',
        });
        setForm((prev) => ({
          ...prev,
          phone: '',
          company_name: '',
          message: '',
          _gotcha: '',
        }));
      } else {
        if (res.data.errors) setErrors(res.data.errors);
        setFeedback({
          type: 'error',
          text: res.data.message || 'Unable to submit your inquiry right now. Please try Email or WhatsApp below.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        text: 'Network error communicating with backend API. Use our direct Email or WhatsApp channels below.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-navy-950 min-h-screen">
      <SeoHead
        title="Contact Us — DEVNEXUS TECH | Start Your Software or AI Consultation"
        description="Contact DEVNEXUS TECH for custom software development, web applications, e-commerce, and AI automation in Pakistan and globally."
      />

      <section className="py-20 bg-white dark:bg-navy-900/40 border-b border-slate-200 dark:border-slate-800/80 architectural-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-electric-400 font-semibold">
            Contact Engineering Desk
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mt-3">
            Let&apos;s Discuss Your Technical Roadmap.
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
            Reach out directly via our validated inquiry form, WhatsApp, or email. All inquiries are handled directly by
            senior engineering leadership.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Direct Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="architectural-card rounded-3xl p-7 space-y-5">
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Direct Communication Channels
              </h2>

              <div className="space-y-3">
                <a
                  href={COMPANY.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <div className="text-xs font-mono text-emerald-700 dark:text-emerald-300">WhatsApp Direct</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {COMPANY.contact.whatsappDisplay}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </a>

                <a
                  href={`mailto:${COMPANY.contact.directEmail}?subject=${encodeURIComponent('DEVNEXUS TECH Project Inquiry')}`}
                  className="flex items-center justify-between p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 hover:border-sky-500/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-sky-600 dark:text-electric-400" />
                    <div>
                      <div className="text-xs font-mono text-sky-700 dark:text-electric-400">Email Engineering</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {COMPANY.contact.directEmail}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-sky-600 dark:text-electric-400" />
                </a>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3 text-xs font-mono text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-sky-600 dark:text-electric-400 shrink-0" />
                  <span>{COMPANY.contact.responseSla}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Globe2 className="w-4 h-4 text-sky-600 dark:text-electric-400 shrink-0" />
                  <span>{COMPANY.contact.timezones}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Protected by mutual confidentiality & NDA readiness</span>
                </div>
              </div>
            </div>
          </div>

          {/* Validated Form */}
          <div className="lg:col-span-7">
            <div className="architectural-card rounded-3xl p-7 sm:p-9">
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1">
                Send a Consultation Request
              </h2>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-6">
                Persisted securely to PostgreSQL/SQLite & Appwrite CRM with webhook triggers.
              </p>

              {feedback && (
                <div
                  role="alert"
                  className={`p-4 rounded-2xl mb-6 text-xs sm:text-sm flex items-start gap-3 border ${
                    feedback.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">{feedback.text}</p>
                    {feedback.detail && <p className="text-xs opacity-85 mt-1">{feedback.detail}</p>}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <input
                  type="text"
                  name="_gotcha"
                  value={form._gotcha}
                  onChange={(e) => setForm({ ...form, _gotcha: e.target.value })}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={(e) => {
                        setForm({ ...form, full_name: e.target.value });
                        if (errors.full_name) setErrors({ ...errors, full_name: '' });
                      }}
                      placeholder="e.g. Ali Raza / Sarah Jenkins"
                      className="w-full rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                    {errors.full_name && <p className="text-xs text-rose-500 mt-1">{errors.full_name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => {
                        setForm({ ...form, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      placeholder="name@company.com"
                      className="w-full rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                    {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">
                      Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+92 / +44 / +1 ..."
                      className="w-full rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={form.company_name}
                      onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                      placeholder="Company or Startup Name"
                      className="w-full rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">
                      Country *
                    </label>
                    <select
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="w-full rounded-xl px-3.5 py-3 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">
                      Service Required *
                    </label>
                    <select
                      value={form.project_type}
                      onChange={(e) => setForm({ ...form, project_type: e.target.value })}
                      className="w-full rounded-xl px-3.5 py-3 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    >
                      {serviceOptions.map((s) => (
                        <option key={s.slug} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">
                      Budget *
                    </label>
                    <select
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                      className="w-full rounded-xl px-3.5 py-3 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    >
                      {BUDGET_RANGES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">
                    Project Details *
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => {
                      setForm({ ...form, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: '' });
                    }}
                    placeholder="Share your goals, key features, integrations (Stripe, JazzCash, Appwrite, AI, n8n), and target timeline..."
                    className="w-full rounded-xl p-4 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                  {errors.message && <p className="text-xs text-rose-500 mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-sky-600 to-blue-600 dark:from-electric-400 dark:to-electric-500 text-white dark:text-navy-950 shadow-glow-sm hover:opacity-95 disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Contact Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
