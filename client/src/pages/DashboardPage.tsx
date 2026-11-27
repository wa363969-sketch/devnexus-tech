import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  CreditCard,
  FolderKanban,
  Loader2,
  LogOut,
  Mail,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import SeoHead from '../components/SeoHead';
import type { ClientProject, InquiryRecord, InvoiceRecord, PaymentProviderStatus } from '../types';

export default function DashboardPage() {
  const { user, logout, sendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [providers, setProviders] = useState<Record<string, PaymentProviderStatus>>({});
  const [notifications, setNotifications] = useState<Array<{ id: number; subject: string; summary: string; created_at: string }>>([]);
  const [profileForm, setProfileForm] = useState({ phone: '', company_name: '', country: '' });
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'inquiries' | 'projects' | 'billing' | 'settings'>('overview');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, payRes] = await Promise.all([
        apiRequest<{
          success: boolean;
          profile?: { phone?: string; company_name?: string; country?: string };
          inquiries?: InquiryRecord[];
          projects?: ClientProject[];
          invoices?: InvoiceRecord[];
          notifications?: Array<{ id: number; subject: string; summary: string; created_at: string }>;
        }>('/api/client/dashboard'),
        apiRequest<{ providers?: Record<string, PaymentProviderStatus> }>('/api/payments/providers'),
      ]);

      if (dashRes.ok && dashRes.data.success) {
        setInquiries(dashRes.data.inquiries || []);
        setProjects(dashRes.data.projects || []);
        setInvoices(dashRes.data.invoices || []);
        setNotifications(dashRes.data.notifications || []);
        if (dashRes.data.profile) {
          setProfileForm({
            phone: dashRes.data.profile.phone || '',
            company_name: dashRes.data.profile.company_name || '',
            country: dashRes.data.profile.country || '',
          });
        }
      }
      if (payRes.ok && payRes.data.providers) {
        setProviders(payRes.data.providers);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/api/client/profile', {
      method: 'PATCH',
      body: profileForm,
    });
    setStatusNotice(res.ok ? 'Account settings updated.' : 'Could not update profile settings.');
  };

  const handleCheckout = async (invoiceId: number, providerId: string) => {
    setStatusNotice(null);
    const res = await apiRequest<{
      success: boolean;
      configured?: boolean;
      message?: string;
      checkout_url?: string;
      endpoint?: string;
    }>('/api/payments/checkout', {
      method: 'POST',
      body: { invoice_id: invoiceId, provider: providerId, return_origin: window.location.origin },
    });

    if (!res.ok) {
      setStatusNotice(res.data.message || `Payment provider "${providerId}" is pending configuration.`);
      return;
    }
    if (res.data.checkout_url) {
      window.open(res.data.checkout_url, '_blank', 'noopener,noreferrer');
    } else if (res.data.endpoint) {
      setStatusNotice(`Checkout payload prepared for ${providerId} (${res.data.endpoint}).`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  return (
    <div className="bg-slate-50 dark:bg-navy-950 min-h-screen py-10">
      <SeoHead
        title="Client Dashboard — DEVNEXUS TECH"
        description="Manage your DEVNEXUS TECH profile, project inquiries, milestones, and invoices."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Welcome & Account Identity Card */}
        <div className="architectural-card rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover border border-sky-500/40 bg-slate-200 dark:bg-navy-800"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-display font-bold text-xl">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                  Welcome, {user.name}
                </h1>
                <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-electric-400 border border-sky-500/20">
                  {user.authProvider} auth
                </span>
                <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                  role: {user.role}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                {user.email} • ID: {user.id}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                {user.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Email Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void sendVerificationEmail().then((r) => setStatusNotice(r.message))}
                    className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-300 font-mono underline cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Email unverified — Send verification link</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user.isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Console</span>
              </Link>
            )}
            <Link
              to="/start-project"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950"
            >
              <Plus className="w-4 h-4" />
              <span>New Project Inquiry</span>
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-rose-500/50 hover:text-rose-500 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {statusNotice && (
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-xs font-mono text-sky-800 dark:text-sky-200">
            {statusNotice}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'overview', label: 'Overview', icon: UserIcon },
                { id: 'inquiries', label: `Inquiries (${inquiries.length})`, icon: Mail },
                { id: 'projects', label: `Projects (${projects.length})`, icon: FolderKanban },
                { id: 'billing', label: `Invoices (${invoices.length})`, icon: CreditCard },
                { id: 'settings', label: 'Account Settings', icon: Settings },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold cursor-pointer ${
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

          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-600 dark:text-electric-400 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="architectural-card rounded-3xl p-12 text-center">
            <Loader2 className="w-7 h-7 animate-spin text-sky-600 mx-auto" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="architectural-card rounded-2xl p-5">
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400">Submitted Inquiries</div>
                      <div className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-1">
                        {inquiries.length}
                      </div>
                    </div>
                    <div className="architectural-card rounded-2xl p-5">
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400">Active Projects</div>
                      <div className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-1">
                        {projects.length}
                      </div>
                    </div>
                    <div className="architectural-card rounded-2xl p-5">
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400">Invoices</div>
                      <div className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-1">
                        {invoices.length}
                      </div>
                    </div>
                  </div>

                  <div className="architectural-card rounded-2xl p-6 space-y-4">
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Recent Activity & Project Status
                    </h2>
                    {inquiries.length === 0 && projects.length === 0 ? (
                      <div className="p-6 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          You have not submitted any project inquiries under <strong>{user.email}</strong> yet.
                        </p>
                        <Link
                          to="/start-project"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950"
                        >
                          Submit Your First Project Brief
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {projects.map((p) => (
                          <div key={p.id} className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-sm text-slate-900 dark:text-white">{p.title}</span>
                              <span className="text-xs font-mono text-sky-600 dark:text-electric-400">{p.stage} ({p.progress_pct}%)</span>
                            </div>
                          </div>
                        ))}
                        {inquiries.slice(0, 4).map((inq) => (
                          <div key={inq.id} className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                            <div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-white">{inq.project_type}</div>
                              <div className="text-xs font-mono text-slate-500">Inquiry #{inq.id} • {inq.budget}</div>
                            </div>
                            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-electric-400">
                              {inq.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notifications */}
                <div className="lg:col-span-4 architectural-card rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-sky-600 dark:text-electric-400" />
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Notifications</h2>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No account notifications recorded yet. Inquiry confirmations and milestone notices appear here.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs">
                          <div className="font-semibold text-slate-900 dark:text-white">{n.subject}</div>
                          <p className="text-slate-500 dark:text-slate-400 mt-1">{n.summary}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'inquiries' && (
              <div className="architectural-card rounded-2xl p-6 space-y-4">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Your Project Inquiries</h2>
                {inquiries.length === 0 ? (
                  <p className="text-sm text-slate-500">No inquiries found for your account.</p>
                ) : (
                  <div className="space-y-3">
                    {inquiries.map((inq) => (
                      <div key={inq.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            #{inq.id} — {inq.project_type}
                          </span>
                          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-electric-400">
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-500">
                          Budget: {inq.budget} • Submitted: {inq.created_at ? new Date(inq.created_at).toLocaleString() : 'N/A'}
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{inq.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="architectural-card rounded-2xl p-6 space-y-4">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Active Engagements</h2>
                {projects.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No active engineering projects assigned yet. Once an inquiry converts to an engagement, milestone
                    progress will display here.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {projects.map((p) => (
                      <div key={p.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-slate-900 dark:text-white">{p.title}</h3>
                          <span className="text-xs font-mono text-sky-600 dark:text-electric-400">{p.stage}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-navy-800 overflow-hidden">
                          <div className="h-full bg-sky-600 dark:bg-electric-400" style={{ width: `${p.progress_pct}%` }} />
                        </div>
                        <div className="text-xs font-mono text-slate-500 flex justify-between">
                          <span>Service: {p.service_type}</span>
                          <span>{p.progress_pct}% Complete</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="architectural-card rounded-2xl p-6 space-y-5">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Invoices & Payment Gateways</h2>
                {invoices.length === 0 ? (
                  <p className="text-sm text-slate-500">No invoices issued for {user.email}.</p>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {inv.invoice_number} — {inv.currency} {inv.amount.toFixed(2)}
                            </div>
                            <div className="text-xs text-slate-500">{inv.description}</div>
                          </div>
                          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-700 dark:text-electric-400">
                            {inv.status}
                          </span>
                        </div>
                        {inv.status.toLowerCase() !== 'paid' && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {Object.values(providers).map((prov) => (
                              <button
                                key={prov.id}
                                type="button"
                                onClick={() => void handleCheckout(inv.id, prov.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${
                                  prov.configured
                                    ? 'bg-sky-600 text-white border-transparent'
                                    : 'bg-white dark:bg-navy-900 border-slate-300 dark:border-slate-700 text-slate-500'
                                }`}
                              >
                                {prov.name} ({prov.configured ? prov.mode : 'Pending Setup'})
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <form onSubmit={handleSaveProfile} className="architectural-card rounded-2xl p-6 max-w-xl space-y-4">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Account Settings</h2>
                <div>
                  <label className="block text-xs font-mono text-slate-500 mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-500 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={profileForm.company_name}
                    onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-500 mb-1">Country</label>
                  <input
                    type="text"
                    value={profileForm.country}
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 cursor-pointer"
                >
                  Save Profile Preferences
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
