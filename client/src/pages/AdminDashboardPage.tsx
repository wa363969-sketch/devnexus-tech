import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BarChart3,
  Briefcase,
  CreditCard,
  FolderKanban,
  Key,
  Layers,
  Loader2,
  Lock,
  LogOut,
  Mail,
  RefreshCw,
  Settings,
  ShieldAlert,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest, getStoredAdminKey, setStoredAdminKey } from '../lib/api';
import AdminIntegrationsTab from '../components/admin/AdminIntegrationsTab';
import SeoHead from '../components/SeoHead';
import type {
  ClientProject,
  InquiryRecord,
  IntegrationStatusItem,
  InvoiceRecord,
  PortfolioProject,
  ServiceItem,
  TestimonialItem,
} from '../types';

type AdminTab =
  | 'overview'
  | 'inquiries'
  | 'crm'
  | 'portfolio'
  | 'services'
  | 'testimonials'
  | 'billing'
  | 'content'
  | 'integrations';

export default function AdminDashboardPage({ onContentUpdated }: { onContentUpdated?: () => void }) {
  const { user, logout } = useAuth();
  const [adminKeyInput, setAdminKeyInput] = useState(getStoredAdminKey());
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [notice, setNotice] = useState<string | null>(null);

  // Loaded data states
  const [overview, setOverview] = useState<Record<string, any>>({});
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [clients, setClients] = useState<Array<{ id: number; full_name: string; email: string; company_name?: string; country?: string; status: string }>>([]);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [integrations, setIntegrations] = useState<Record<string, IntegrationStatusItem>>({});
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});

  // Quick creation forms
  const [newPortfolio, setNewPortfolio] = useState({ title: '', tagline: '', category: 'Web Applications', description: '', architecture: '', technologies: 'React, TypeScript, Appwrite' });
  const [newInvoice, setNewInvoice] = useState({ client_email: '', client_name: '', description: '', amount: '', currency: 'USD' });
  const [newProject, setNewProject] = useState({ title: '', client_email: '', service_type: 'Web Application Development', stage: 'Discovery', progress_pct: 15 });
  const [newTestimonial, setNewTestimonial] = useState({ author_name: '', author_role: '', company: '', region: 'International', quote: '', is_demo: false });

  const loadAllAdminData = useCallback(async () => {
    setCheckingAuth(true);
    setAuthError(null);
    const analyticsRes = await apiRequest<{ success: boolean; overview?: Record<string, any>; error?: string }>('/api/admin/analytics', {
      admin: true,
    });

    if (!analyticsRes.ok) {
      setAuthorized(false);
      setCheckingAuth(false);
      if (getStoredAdminKey() || user?.isAdmin) {
        setAuthError(analyticsRes.data.error || 'Administrator authorization rejected.');
      }
      return;
    }

    setAuthorized(true);
    setOverview(analyticsRes.data.overview || {});

    const [inqR, cliR, projR, portR, svcR, testR, invR, setR, intR, audR] = await Promise.all([
      apiRequest<{ inquiries: InquiryRecord[] }>('/api/admin/inquiries', { admin: true }),
      apiRequest<{ clients: any[] }>('/api/admin/clients', { admin: true }),
      apiRequest<{ projects: ClientProject[] }>('/api/admin/projects', { admin: true }),
      apiRequest<{ portfolio: PortfolioProject[] }>('/api/admin/portfolio', { admin: true }),
      apiRequest<{ services: ServiceItem[] }>('/api/admin/services', { admin: true }),
      apiRequest<{ testimonials: TestimonialItem[] }>('/api/admin/testimonials', { admin: true }),
      apiRequest<{ invoices: InvoiceRecord[] }>('/api/admin/invoices', { admin: true }),
      apiRequest<{ settings: Record<string, any> }>('/api/admin/settings', { admin: true }),
      apiRequest<{ integrations: Record<string, IntegrationStatusItem> }>('/api/admin/integrations', { admin: true }),
      apiRequest<{ logs: any[] }>('/api/admin/audit-logs', { admin: true }),
    ]);

    if (inqR.ok) setInquiries(inqR.data.inquiries || []);
    if (cliR.ok) setClients(cliR.data.clients || []);
    if (projR.ok) setProjects(projR.data.projects || []);
    if (portR.ok) setPortfolio(portR.data.portfolio || []);
    if (svcR.ok) setServices(svcR.data.services || []);
    if (testR.ok) setTestimonials(testR.data.testimonials || []);
    if (invR.ok) setInvoices(invR.data.invoices || []);
    if (setR.ok) setSettings(setR.data.settings || {});
    if (intR.ok) setIntegrations(intR.data.integrations || {});
    if (audR.ok) setAuditLogs(audR.data.logs || []);
    setCheckingAuth(false);
  }, [user?.isAdmin]);

  useEffect(() => {
    void loadAllAdminData();
  }, [loadAllAdminData]);

  const handleAdminKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKeyInput.trim()) {
      setAuthError('Please enter the server-configured Admin API Key.');
      return;
    }
    setStoredAdminKey(adminKeyInput.trim());
    await loadAllAdminData();
  };

  const handleAdminSignOut = async () => {
    setStoredAdminKey('');
    setAdminKeyInput('');
    setAuthorized(false);
    if (user) await logout();
  };

  const updateInquiryStatus = async (id: number, status: string) => {
    const res = await apiRequest(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      admin: true,
      body: { status },
    });
    if (res.ok) {
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
      setNotice(`Inquiry #${id} status updated to ${status}.`);
    }
  };

  const runAiQualify = async (id: number) => {
    setNotice('Running AI Lead Qualification...');
    const res = await apiRequest<{ success: boolean; error?: string; inquiry?: InquiryRecord }>('/api/ai/qualify-lead', {
      method: 'POST',
      admin: true,
      body: { inquiry_id: id },
    });
    if (res.ok && res.data.inquiry) {
      setInquiries((prev) => prev.map((i) => (i.id === id ? res.data.inquiry! : i)));
      setNotice(`Inquiry #${id} scored by AI.`);
    } else {
      setNotice(res.data.error || 'AI Qualification requires OPENAI_API_KEY or GEMINI_API_KEY configured on the server.');
    }
  };

  const convertToProject = async (id: number) => {
    const res = await apiRequest<{ success: boolean; project?: ClientProject }>(`/api/admin/inquiries/${id}/convert-project`, {
      method: 'POST',
      admin: true,
      body: {},
    });
    if (res.ok && res.data.project) {
      setProjects((prev) => [res.data.project!, ...prev]);
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'Converted' } : i)));
      setNotice(`Inquiry #${id} converted to project "${res.data.project.title}".`);
    }
  };

  const deleteInquiry = async (id: number) => {
    const res = await apiRequest(`/api/admin/inquiries/${id}`, { method: 'DELETE', admin: true });
    if (res.ok) setInquiries((prev) => prev.filter((i) => i.id !== id));
  };

  const createPortfolioItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest<{ success: boolean; project?: PortfolioProject }>('/api/admin/portfolio', {
      method: 'POST',
      admin: true,
      body: {
        ...newPortfolio,
        technologies: newPortfolio.technologies.split(',').map((s) => s.trim()).filter(Boolean),
        features: ['Server-verified architecture', 'Responsive UI/UX'],
        metrics: [{ label: 'Status', value: 'Concept Demo' }],
      },
    });
    if (res.ok && res.data.project) {
      setPortfolio((prev) => [...prev, res.data.project!]);
      setNewPortfolio({ title: '', tagline: '', category: 'Web Applications', description: '', architecture: '', technologies: 'React, TypeScript, Appwrite' });
      onContentUpdated?.();
      setNotice('Portfolio item added.');
    }
  };

  const deletePortfolioItem = async (id: number) => {
    const res = await apiRequest(`/api/admin/portfolio/${id}`, { method: 'DELETE', admin: true });
    if (res.ok) {
      setPortfolio((prev) => prev.filter((p) => p.id !== id));
      onContentUpdated?.();
    }
  };

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest<{ success: boolean; invoice?: InvoiceRecord; error?: string }>('/api/admin/invoices', {
      method: 'POST',
      admin: true,
      body: { ...newInvoice, amount: Number(newInvoice.amount) },
    });
    if (res.ok && res.data.invoice) {
      setInvoices((prev) => [res.data.invoice!, ...prev]);
      setNewInvoice({ client_email: '', client_name: '', description: '', amount: '', currency: 'USD' });
      setNotice(`Invoice ${res.data.invoice.invoice_number} created.`);
    } else {
      setNotice(res.data.error || 'Could not create invoice.');
    }
  };

  const createProjectRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest<{ success: boolean; project?: ClientProject }>('/api/admin/projects', {
      method: 'POST',
      admin: true,
      body: newProject,
    });
    if (res.ok && res.data.project) {
      setProjects((prev) => [res.data.project!, ...prev]);
      setNewProject({ title: '', client_email: '', service_type: 'Web Application Development', stage: 'Discovery', progress_pct: 15 });
      setNotice('Project created.');
    }
  };

  const createTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest<{ success: boolean; testimonial?: TestimonialItem }>('/api/admin/testimonials', {
      method: 'POST',
      admin: true,
      body: newTestimonial,
    });
    if (res.ok && res.data.testimonial) {
      setTestimonials((prev) => [res.data.testimonial!, ...prev]);
      setNewTestimonial({ author_name: '', author_role: '', company: '', region: 'International', quote: '', is_demo: false });
      onContentUpdated?.();
      setNotice('Testimonial saved.');
    }
  };

  const saveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/api/admin/settings', {
      method: 'PUT',
      admin: true,
      body: settings,
    });
    if (res.ok) {
      onContentUpdated?.();
      setNotice('Website announcements & settings updated.');
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600 dark:text-electric-400" />
        <p className="text-xs font-mono text-slate-500">Verifying administrator authorization...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-navy-950">
        <SeoHead title="Admin Authentication — DEVNEXUS TECH" description="Protected DEVNEXUS TECH operations console." />
        <div className="architectural-card rounded-3xl p-8 max-w-md w-full space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-electric-400">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              DEVNEXUS Admin Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Protected by server-side Role-Based Access Control. Standard Google OAuth accounts never receive automatic
              admin privileges.
            </p>
          </div>

          {user && !user.isAdmin && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Signed in as <strong>{user.email}</strong> (role: <code>{user.role}</code>). To access admin controls,
                sign in with an Appwrite admin-labelled user or provide the server Admin API Key below.
              </span>
            </div>
          )}

          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminKeySubmit} className="space-y-3">
            <label className="block text-xs font-mono text-slate-500 dark:text-slate-400">
              Server Admin Key (<code>ADMIN_API_KEY</code>)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={adminKeyInput}
                onChange={(e) => setAdminKeyInput(e.target.value)}
                placeholder="Enter ADMIN_API_KEY"
                className="w-full rounded-xl pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-sm bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 cursor-pointer"
            >
              Authenticate Admin Session
            </button>
          </form>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
            <Link to="/login" className="text-sky-600 dark:text-electric-400 hover:underline">
              Sign in via Appwrite
            </Link>
            <Link to="/dashboard" className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
              Client Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'inquiries', label: `Inquiries (${inquiries.length})`, icon: Mail },
    { id: 'crm', label: `Clients & Projects`, icon: FolderKanban },
    { id: 'portfolio', label: 'Portfolio', icon: Layers },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'testimonials', label: 'Testimonials', icon: Users },
    { id: 'billing', label: 'Invoices', icon: CreditCard },
    { id: 'content', label: 'Site Content', icon: Settings },
    { id: 'integrations', label: 'APIs & Audit', icon: Sparkles },
  ];

  return (
    <div className="bg-slate-50 dark:bg-navy-950 min-h-screen py-10">
      <SeoHead title="Admin Command Center — DEVNEXUS TECH" description="Enterprise CRM, CMS & API management console." />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="architectural-card rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-sky-600 dark:text-electric-400 uppercase font-semibold">
              DEVNEXUS TECH • Enterprise Control Plane
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Admin Dashboard & CRM
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void loadAllAdminData()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync</span>
            </button>
            <button
              type="button"
              onClick={() => void handleAdminSignOut()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono border border-rose-500/30 text-rose-600 dark:text-rose-300 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Console</span>
            </button>
          </div>
        </div>

        {notice && (
          <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-xs font-mono text-sky-800 dark:text-sky-200 flex items-center justify-between">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice(null)} className="underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold cursor-pointer ${
                activeTab === id
                  ? 'bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950'
                  : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Inquiries', val: overview.total_inquiries ?? 0 },
              { label: 'Registered Clients', val: overview.total_clients ?? 0 },
              { label: 'Active Projects', val: overview.total_projects ?? 0 },
              { label: 'Paid Revenue (USD)', val: `$${(overview.paid_revenue_usd ?? 0).toLocaleString()}` },
            ].map((stat) => (
              <div key={stat.label} className="architectural-card rounded-2xl p-6">
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400">{stat.label}</div>
                <div className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.val}</div>
              </div>
            ))}
          </div>
        )}

        {/* INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            {inquiries.length === 0 ? (
              <div className="architectural-card rounded-2xl p-8 text-center text-sm text-slate-500">
                No inquiries received yet. Submit via Contact or Start Project to test.
              </div>
            ) : (
              inquiries.map((inq) => (
                <div key={inq.id} className="architectural-card rounded-2xl p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        #{inq.id} {inq.full_name}
                      </span>{' '}
                      <span className="text-xs font-mono text-slate-500">
                        ({inq.email}) • {inq.country}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={inq.status}
                        onChange={(e) => void updateInquiryStatus(inq.id, e.target.value)}
                        className="rounded-lg px-2.5 py-1 text-xs font-mono bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
                      >
                        {['New', 'Qualified', 'Contacted', 'Proposal Sent', 'Converted', 'Archived'].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => void runAiQualify(inq.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono bg-sky-500/15 text-sky-700 dark:text-electric-400 cursor-pointer"
                      >
                        AI Score
                      </button>
                      <button
                        type="button"
                        onClick={() => void convertToProject(inq.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 cursor-pointer"
                      >
                        Convert to Project
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteInquiry(inq.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                        title="Delete inquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-slate-500">
                    Service: <strong className="text-sky-600 dark:text-electric-400">{inq.project_type}</strong> • Budget:{' '}
                    <strong>{inq.budget}</strong>
                    {inq.lead_score !== null && inq.lead_score !== undefined && (
                      <span> • AI Score: {inq.lead_score}/100</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-navy-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    {inq.message}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* CRM CLIENTS & PROJECTS */}
        {activeTab === 'crm' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form onSubmit={createProjectRecord} className="lg:col-span-5 architectural-card rounded-2xl p-6 space-y-3 h-fit">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Create Project</h3>
              <input
                type="text"
                required
                placeholder="Project title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
              />
              <input
                type="email"
                required
                placeholder="Client email"
                value={newProject.client_email}
                onChange={(e) => setNewProject({ ...newProject, client_email: e.target.value })}
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
              />
              <select
                value={newProject.stage}
                onChange={(e) => setNewProject({ ...newProject, stage: e.target.value })}
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
              >
                {['Discovery', 'Architecture', 'UI/UX Design', 'Development', 'QA & Security', 'Launched'].map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <button type="submit" className="w-full py-2.5 rounded-xl font-semibold text-xs bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 cursor-pointer">
                Add Project
              </button>
            </form>

            <div className="lg:col-span-7 space-y-4">
              <div className="architectural-card rounded-2xl p-6 space-y-3">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Active Projects ({projects.length})
                </h3>
                {projects.length === 0 ? (
                  <p className="text-xs text-slate-500">No projects recorded yet.</p>
                ) : (
                  projects.map((p) => (
                    <div key={p.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{p.title}</div>
                        <div className="font-mono text-slate-500">{p.client_email}</div>
                      </div>
                      <span className="font-mono text-sky-600 dark:text-electric-400">
                        {p.stage} ({p.progress_pct}%)
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="architectural-card rounded-2xl p-6 space-y-3">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Client Directory ({clients.length})
                </h3>
                {clients.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white">{c.full_name} ({c.email})</span>
                    <span className="font-mono text-slate-500">{c.country || 'Global'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PORTFOLIO CMS */}
        {activeTab === 'portfolio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form onSubmit={createPortfolioItem} className="lg:col-span-5 architectural-card rounded-2xl p-6 space-y-3 h-fit">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Add Portfolio Concept</h3>
              <input
                type="text"
                required
                placeholder="Project Title"
                value={newPortfolio.title}
                onChange={(e) => setNewPortfolio({ ...newPortfolio, title: e.target.value })}
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
              />
              <input
                type="text"
                placeholder="Tagline"
                value={newPortfolio.tagline}
                onChange={(e) => setNewPortfolio({ ...newPortfolio, tagline: e.target.value })}
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
              />
              <input
                type="text"
                placeholder="Category (e.g. AI & Automation)"
                value={newPortfolio.category}
                onChange={(e) => setNewPortfolio({ ...newPortfolio, category: e.target.value })}
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
              />
              <textarea
                rows={3}
                placeholder="Description"
                value={newPortfolio.description}
                onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
              />
              <input
                type="text"
                placeholder="Technologies (comma-separated)"
                value={newPortfolio.technologies}
                onChange={(e) => setNewPortfolio({ ...newPortfolio, technologies: e.target.value })}
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
              />
              <button type="submit" className="w-full py-2.5 rounded-xl font-semibold text-xs bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 cursor-pointer">
                Publish Portfolio Item
              </button>
            </form>

            <div className="lg:col-span-7 space-y-3">
              {portfolio.map((p) => (
                <div key={p.id || p.slug} className="architectural-card rounded-2xl p-5 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono text-sky-600 dark:text-electric-400">{p.category} • {p.badge}</div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{p.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                  </div>
                  {p.id && (
                    <button
                      type="button"
                      onClick={() => void deletePortfolioItem(p.id!)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SERVICES */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
              <div key={s.slug} className="architectural-card rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-sky-600 dark:text-electric-400">{s.badge}</span>
                  <span>{s.is_active ? 'Active' : 'Hidden'}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">{s.short_desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* TESTIMONIALS */}
        {activeTab === 'testimonials' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form onSubmit={createTestimonial} className="lg:col-span-5 architectural-card rounded-2xl p-6 space-y-3 h-fit">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Add Testimonial</h3>
              <input
                type="text"
                required
                placeholder="Author Name"
                value={newTestimonial.author_name}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, author_name: e.target.value })}
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
              />
              <input
                type="text"
                placeholder="Role & Company"
                value={newTestimonial.company}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, company: e.target.value, author_role: e.target.value })}
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
              />
              <textarea
                rows={3}
                required
                placeholder="Client Quote"
                value={newTestimonial.quote}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, quote: e.target.value })}
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
              />
              <label className="flex items-center gap-2 text-xs font-mono">
                <input
                  type="checkbox"
                  checked={newTestimonial.is_demo}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, is_demo: e.target.checked })}
                />
                <span>Mark as Demo / Sample Format</span>
              </label>
              <button type="submit" className="w-full py-2.5 rounded-xl font-semibold text-xs bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 cursor-pointer">
                Save Testimonial
              </button>
            </form>

            <div className="lg:col-span-7 space-y-3">
              {testimonials.map((t) => (
                <div key={t.id} className="architectural-card rounded-2xl p-5 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-300">
                      {t.is_demo ? 'DEMO' : 'VERIFIED'} • {t.region}
                    </span>
                    <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">{t.author_name}</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{t.quote}</p>
                  </div>
                  {t.id && (
                    <button
                      type="button"
                      onClick={() =>
                        void apiRequest(`/api/admin/testimonials/${t.id}`, { method: 'DELETE', admin: true }).then(() =>
                          setTestimonials((prev) => prev.filter((x) => x.id !== t.id))
                        )
                      }
                      className="p-2 text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BILLING & INVOICES */}
        {activeTab === 'billing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form onSubmit={createInvoice} className="lg:col-span-5 architectural-card rounded-2xl p-6 space-y-3 h-fit">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Issue Client Invoice</h3>
              <input
                type="email"
                required
                placeholder="Client Email"
                value={newInvoice.client_email}
                onChange={(e) => setNewInvoice({ ...newInvoice, client_email: e.target.value })}
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
              />
              <input
                type="text"
                required
                placeholder="Client Name"
                value={newInvoice.client_name}
                onChange={(e) => setNewInvoice({ ...newInvoice, client_name: e.target.value })}
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
              />
              <input
                type="text"
                required
                placeholder="Milestone Description"
                value={newInvoice.description}
                onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                className="w-full rounded-xl px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Amount"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                  className="w-full rounded-xl px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
                />
                <select
                  value={newInvoice.currency}
                  onChange={(e) => setNewInvoice({ ...newInvoice, currency: e.target.value })}
                  className="w-full rounded-xl px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
                >
                  <option value="USD">USD</option>
                  <option value="PKR">PKR</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl font-semibold text-xs bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 cursor-pointer">
                Generate Invoice
              </button>
            </form>

            <div className="lg:col-span-7 space-y-3">
              {invoices.length === 0 ? (
                <div className="architectural-card rounded-2xl p-6 text-sm text-slate-500">No invoices created yet.</div>
              ) : (
                invoices.map((inv) => (
                  <div key={inv.id} className="architectural-card rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {inv.invoice_number} • {inv.currency} {inv.amount}
                      </div>
                      <div className="text-xs text-slate-500">{inv.client_email} — {inv.description}</div>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-electric-400">
                      {inv.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CONTENT & ANNOUNCEMENTS */}
        {activeTab === 'content' && (
          <form onSubmit={saveSiteSettings} className="architectural-card rounded-2xl p-6 max-w-2xl space-y-4">
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Website Announcements & Settings
            </h3>
            <label className="flex items-center gap-2 text-xs font-mono">
              <input
                type="checkbox"
                checked={Boolean(settings.announcement?.enabled)}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcement: { ...(settings.announcement || {}), enabled: e.target.checked },
                  })
                }
              />
              <span>Show Top Announcement Banner</span>
            </label>
            <input
              type="text"
              value={settings.announcement?.text || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  announcement: { ...(settings.announcement || {}), text: e.target.value },
                })
              }
              placeholder="Announcement banner message"
              className="w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
            />
            <input
              type="text"
              value={settings.contact?.whatsapp_number || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact: { ...(settings.contact || {}), whatsapp_number: e.target.value },
                })
              }
              placeholder="Configurable WhatsApp Number (E.164 digits)"
              className="w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
            />
            <button type="submit" className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 cursor-pointer">
              Save Content Settings
            </button>
          </form>
        )}

        {/* INTEGRATIONS & AUDIT */}
        {activeTab === 'integrations' && (
          <AdminIntegrationsTab
            integrations={integrations}
            auditLogs={auditLogs}
            onRefresh={() => void loadAllAdminData()}
          />
        )}
      </div>
    </div>
  );
}
