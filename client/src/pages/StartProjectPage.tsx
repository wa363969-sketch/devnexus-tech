import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  FileUp,
  Loader2,
  Send,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import SeoHead from '../components/SeoHead';
import { FALLBACK_SERVICES } from '../data/companyData';
import { apiRequest } from '../lib/api';
import { uploadBriefToAppwriteStorage } from '../lib/appwrite';
import { useAuth } from '../context/AuthContext';
import type { ServiceItem } from '../types';

const INTEGRATIONS_CHECKLIST = [
  'Google OAuth / Appwrite Auth',
  'Stripe / PayPal International Payments',
  'JazzCash / Easypaisa (Pakistan)',
  'OpenAI / Google Gemini AI Assistant',
  'n8n Automation Webhooks',
  'WhatsApp Business Cloud API',
  'Admin CRM Dashboard',
];

export default function StartProjectPage({ services }: { services?: ServiceItem[] }) {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const serviceList = services && services.length > 0 ? services : FALLBACK_SERVICES;

  const [form, setForm] = useState({
    full_name: user?.name || '',
    email: user?.email || '',
    phone: '',
    company_name: '',
    country: 'Pakistan',
    project_type: searchParams.get('service') || serviceList[0].title,
    budget: searchParams.get('estimate') || '$1,500 – $3,500 USD',
    timeline: '4 – 8 Weeks',
    existing_url: '',
    target_audience: 'Pakistan & International',
    message: searchParams.get('ref') ? `Interested in a tailored build inspired by ${searchParams.get('ref')}.\n` : '',
    integrations: [] as string[],
  });

  const [attachment, setAttachment] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    configured: boolean;
    message?: string;
    refined_scope?: string;
    recommended_features?: string[];
    suggested_stack?: string[];
  } | null>(null);
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const toggleIntegration = (item: string) => {
    setForm((prev) => ({
      ...prev,
      integrations: prev.integrations.includes(item)
        ? prev.integrations.filter((x) => x !== item)
        : [...prev.integrations, item],
    }));
  };

  const runAiRequirementHelper = async () => {
    if (form.message.trim().length < 10) {
      setErrors((prev) => ({ ...prev, message: 'Write at least 10 characters first so the AI assistant can analyze your scope.' }));
      return;
    }
    setAiLoading(true);
    setAiAnalysis(null);
    try {
      const res = await apiRequest<{
        success: boolean;
        configured: boolean;
        message?: string;
        analysis?: {
          refined_scope?: string;
          recommended_features?: string[];
          suggested_stack?: string[];
        };
      }>('/api/ai/project-assistant', {
        method: 'POST',
        body: { brief: form.message, service_type: form.project_type },
      });

      if (res.data.configured && res.data.analysis) {
        setAiAnalysis({ configured: true, ...res.data.analysis });
      } else {
        setAiAnalysis({
          configured: false,
          message:
            res.data.message ||
            'AI Requirement Assistant is pending server OpenAI/Gemini API key configuration. You can still submit your complete project brief below.',
        });
      }
    } catch {
      setAiAnalysis({
        configured: false,
        message: 'Could not reach AI Requirement Assistant endpoint.',
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (form.full_name.trim().length < 2) nextErrors.full_name = 'Full name is required.';
    if (!/^[\w.+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email.trim())) {
      nextErrors.email = 'Valid email is required.';
    }
    if (form.message.trim().length < 10) nextErrors.message = 'Provide at least 10 characters of project goals.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setResult(null);

    let fileId: string | undefined;
    let fileNotice = '';
    if (attachment) {
      const uploaded = await uploadBriefToAppwriteStorage(attachment, user?.id);
      if (uploaded.uploaded) {
        fileId = uploaded.fileId;
      } else {
        fileNotice = ` (Note: Brief file upload skipped — ${uploaded.error})`;
      }
    }

    try {
      const res = await apiRequest<{ success: boolean; inquiry_id?: number; message?: string }>('/api/contact', {
        method: 'POST',
        body: {
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          company_name: form.company_name,
          country: form.country,
          project_type: form.project_type,
          budget: form.budget,
          timeline: form.timeline,
          message: form.message,
          source: 'start_project_wizard',
          requirements: {
            target_audience: form.target_audience,
            existing_url: form.existing_url,
            requested_integrations: form.integrations,
            appwrite_file_id: fileId || null,
          },
        },
      });

      if (res.ok && res.data.success) {
        try {
          confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
        setResult({
          type: 'success',
          text: `Project brief #${res.data.inquiry_id ?? ''} submitted successfully!${fileNotice} Our architects will reply within 24 hours with a milestone roadmap.`,
        });
      } else {
        setResult({
          type: 'error',
          text: res.data.message || 'Submission failed. Please verify all required fields.',
        });
      }
    } catch {
      setResult({ type: 'error', text: 'Network error submitting project brief.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-navy-950 min-h-screen py-16">
      <SeoHead
        title="Start a Project — DEVNEXUS TECH | Project Scope & Discovery"
        description="Submit your project requirements, timeline, budget, and integration goals to start building with DEVNEXUS TECH."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-electric-400 font-semibold">
            Project Discovery Intake
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white mt-2">
            Start a Project With DEVNEXUS TECH
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-3 text-sm sm:text-base">
            Complete the structured intake below so our architecture team prepares an accurate milestone plan, stack
            recommendation, and fixed-scope proposal.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="architectural-card rounded-3xl p-7 sm:p-10 space-y-7">
          {result && (
            <div
              role="alert"
              className={`p-4 rounded-2xl flex items-start gap-3 text-sm border ${
                result.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
              }`}
            >
              {result.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              )}
              <span>{result.text}</span>
            </div>
          )}

          {/* Step 1: Client Details */}
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              1. Stakeholder Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                {errors.full_name && <p className="text-xs text-rose-500 mt-1">{errors.full_name}</p>}
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">Work Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">WhatsApp / Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">Company / Venture</label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Project Scope */}
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              2. Solution Scope & Investment
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">Primary Service *</label>
                <select
                  value={form.project_type}
                  onChange={(e) => setForm({ ...form, project_type: e.target.value })}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {serviceList.map((s) => (
                    <option key={s.slug} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">Target Budget</label>
                <input
                  type="text"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">Target Timeline</label>
                <select
                  value={form.timeline}
                  onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option>2 – 4 Weeks (Rapid MVP)</option>
                  <option>4 – 8 Weeks (Standard Production)</option>
                  <option>8 – 12+ Weeks (Complex Platform)</option>
                  <option>Ongoing Retainer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">Region / Market</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-2">
                Required API & Platform Integrations
              </span>
              <div className="flex flex-wrap gap-2">
                {INTEGRATIONS_CHECKLIST.map((item) => {
                  const selected = form.integrations.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleIntegration(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 border-transparent font-semibold'
                          : 'bg-slate-50 dark:bg-navy-950 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 3: Requirements & AI Assistant */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                3. Technical Goals & Brief
              </h2>
              <button
                type="button"
                onClick={() => void runAiRequirementHelper()}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-sky-500/10 text-sky-700 dark:text-electric-400 border border-sky-500/30 hover:bg-sky-500/20 cursor-pointer"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Refine Scope With AI Assistant</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Describe user roles, workflows, key screens, existing tools, or problem you want DEVNEXUS TECH to solve..."
              className="w-full rounded-xl p-4 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            {errors.message && <p className="text-xs text-rose-500">{errors.message}</p>}

            {aiAnalysis && (
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-xs space-y-2">
                {!aiAnalysis.configured ? (
                  <p className="text-sky-900 dark:text-sky-200 font-mono">{aiAnalysis.message}</p>
                ) : (
                  <>
                    <div className="font-mono font-bold text-sky-700 dark:text-electric-400">
                      AI Requirement Breakdown
                    </div>
                    {aiAnalysis.refined_scope && (
                      <p className="text-slate-700 dark:text-slate-200">{aiAnalysis.refined_scope}</p>
                    )}
                    {aiAnalysis.recommended_features && (
                      <ul className="list-disc pl-5 text-slate-600 dark:text-slate-300 space-y-1">
                        {aiAnalysis.recommended_features.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">
                Optional Specification / RFP File (Uploaded via Appwrite Storage if configured)
              </label>
              <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 cursor-pointer text-xs font-mono text-slate-600 dark:text-slate-400">
                <FileUp className="w-4 h-4 text-sky-600 dark:text-electric-400" />
                <span>{attachment ? attachment.name : 'Choose PDF, DOCX, or image specification...'}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-600 to-blue-600 dark:from-electric-400 dark:to-electric-500 text-white dark:text-navy-950 shadow-glow-md hover:opacity-95 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Discovery Brief...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Project Brief</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
