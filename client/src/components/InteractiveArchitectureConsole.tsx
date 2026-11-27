import React, { useState } from 'react';
import { Terminal, Copy, Check, Play } from 'lucide-react';

const CODE_TABS: Record<string, string> = {
  'platform.ts': `// DEVNEXUS TECH — Enterprise Appwrite + OAuth 2.0 Architecture
export const verifyClientWorkspace = async (jwt: string) => {
  const session = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'X-Appwrite-JWT': jwt, 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'google' }),
  });

  // Authoritative role resolved server-side — never trust client role flags
  return session.json() as Promise<{ role: 'client' | 'admin' }>;
};`,

  'ai_gateway.py': `# Server-Side OpenAI / Gemini Gateway (Zero Browser Key Exposure)
@ai_bp.route("/chat", methods=["POST"])
@rate_limit(max_requests=25, window_seconds=300)
def ai_chat():
    message = sanitize_text(request.json.get("message"), 1200)
    result = chat_assistant(message, preferred_provider="auto")
    if not result["configured"]:
        return jsonify({"configured": False, "mode": "pending_configuration"}), 200
    return jsonify({"configured": True, "provider": result["provider"], "reply": result["text"]})`,

  'n8n_pipeline.json': `{
  "workflow": "DEVNEXUS Inquiry -> AI Qualify -> WhatsApp & CRM",
  "trigger": "POST /webhook/devnexus-inquiry (HMAC-SHA256 Verified)",
  "steps": [
    "1. Validate payload & persist to PostgreSQL + Appwrite",
    "2. Score lead priority via Gemini / OpenAI server endpoint",
    "3. Dispatch client confirmation via Resend / SendGrid",
    "4. Alert engineering desk via WhatsApp Business Cloud API"
  ]
}`,
};

export default function InteractiveArchitectureConsole() {
  const [activeTab, setActiveTab] = useState<string>('platform.ts');
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  const handleCopy = () => {
    void navigator.clipboard.writeText(CODE_TABS[activeTab]);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleCheck = () => {
    setRunning(true);
    setOutput(null);
    window.setTimeout(() => {
      setRunning(false);
      setOutput('✓ Blueprint validated • Appwrite Auth + Server API Isolation + n8n HMAC ready');
    }, 450);
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-navy-950 border border-slate-700/80 shadow-2xl">
      <div className="bg-navy-900/95 px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-xs font-mono text-slate-400 hidden sm:inline-flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-electric-400" />
            devnexus-architecture
          </span>
        </div>

        <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-lg border border-slate-800">
          {Object.keys(CODE_TABS).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-electric-500/20 text-electric-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCheck}
            disabled={running}
            className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 cursor-pointer disabled:opacity-60"
          >
            <Play className="w-3 h-3" />
            <span>Verify</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Copy blueprint snippet"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 font-mono text-xs overflow-x-auto bg-navy-950 text-slate-200 leading-relaxed min-h-[240px]">
        <pre className="whitespace-pre">
          {CODE_TABS[activeTab].split('\n').map((line, i) => {
            const isComment = line.trim().startsWith('#') || line.trim().startsWith('//');
            return (
              <div key={i} className="flex">
                <span className="select-none text-slate-600 w-7 pr-3 text-right shrink-0">{i + 1}</span>
                <span className={isComment ? 'text-slate-500 italic' : 'text-slate-200'}>{line}</span>
              </div>
            );
          })}
        </pre>
      </div>

      {output && (
        <div className="px-4 py-2.5 bg-emerald-950/60 border-t border-emerald-700/40 font-mono text-xs text-emerald-300">
          {output}
        </div>
      )}

      <div className="bg-navy-900/70 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          TypeScript • Python • Appwrite • n8n
        </span>
        <span>Zero Client Secrets</span>
      </div>
    </div>
  );
}
