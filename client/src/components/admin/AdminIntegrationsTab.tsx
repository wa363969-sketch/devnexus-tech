import React, { useState } from 'react';
import { CheckCircle2, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import type { IntegrationStatusItem } from '../../types';

export default function AdminIntegrationsTab({
  integrations,
  auditLogs,
  onRefresh,
}: {
  integrations: Record<string, IntegrationStatusItem>;
  auditLogs: Array<{ id: number; actor_email?: string; action: string; resource: string; ip_address?: string; created_at?: string }>;
  onRefresh: () => void;
}) {
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ key: string; detail: string; ok: boolean } | null>(null);

  const runTest = async (target: string) => {
    setTestingKey(target);
    setTestResult(null);
    const res = await apiRequest<{ success: boolean; result?: { ok?: boolean; dispatched?: boolean; detail?: string; configured?: boolean } }>(
      '/api/admin/integrations/test',
      { method: 'POST', admin: true, body: { target } }
    );
    setTestingKey(null);
    if (res.ok && res.data.result) {
      const r = res.data.result;
      setTestResult({
        key: target,
        ok: Boolean(r.ok || r.dispatched || r.configured),
        detail: r.detail || (r.configured ? 'Integration configured.' : 'Pending configuration.'),
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            API, Email, AI, Payment & Automation Readiness
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Factual server environment inspection — providers remain marked Pending Configuration until real credentials are supplied.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border border-slate-300 dark:border-slate-700 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recheck Status</span>
        </button>
      </div>

      {testResult && (
        <div
          className={`p-4 rounded-2xl border text-xs font-mono flex items-center gap-2 ${
            testResult.ok
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            <strong>[{testResult.key}]</strong> {testResult.detail}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(integrations).map(([key, item]) => (
          <div key={key} className="architectural-card rounded-2xl p-5 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">{item.category}</span>
                {item.configured ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" />
                    {item.mode}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    <Clock className="w-3 h-3" />
                    Pending Setup
                  </span>
                )}
              </div>

              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">{item.name}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.notes}</p>

              {item.missing_vars && item.missing_vars.length > 0 && (
                <div className="pt-1">
                  <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Missing Env Vars:</div>
                  <div className="flex flex-wrap gap-1">
                    {item.missing_vars.map((v) => (
                      <code
                        key={v}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-300"
                      >
                        {v}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {(key === 'appwrite' || key === 'n8n') && (
              <button
                type="button"
                onClick={() => void runTest(key)}
                disabled={testingKey === key}
                className="w-full py-2 rounded-xl text-xs font-mono font-semibold bg-slate-900 dark:bg-navy-800 text-white hover:opacity-90 cursor-pointer"
              >
                {testingKey === key ? 'Testing...' : `Test ${key.toUpperCase()} Connection`}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Audit Logs */}
      <div className="architectural-card rounded-2xl p-6 space-y-4">
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Security Audit Log</h3>
        {auditLogs.length === 0 ? (
          <p className="text-xs font-mono text-slate-500">No audit events logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="py-2 pr-4">Action</th>
                  <th className="py-2 pr-4">Resource</th>
                  <th className="py-2 pr-4">Actor</th>
                  <th className="py-2 pr-4">IP</th>
                  <th className="py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.slice(0, 25).map((log) => (
                  <tr key={log.id} className="border-b border-slate-200/60 dark:border-slate-800/60">
                    <td className="py-2 pr-4 text-sky-600 dark:text-electric-400">{log.action}</td>
                    <td className="py-2 pr-4">{log.resource}</td>
                    <td className="py-2 pr-4">{log.actor_email || 'anonymous'}</td>
                    <td className="py-2 pr-4">{log.ip_address || '-'}</td>
                    <td className="py-2">{log.created_at ? new Date(log.created_at).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
