import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, X, Send, Sparkles, MessageCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { COMPANY } from '../data/companyData';

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  badge?: string;
}

const QUICK_PROMPTS = [
  'What services does DEVNEXUS TECH build?',
  'How do payments work for Pakistan & global clients?',
  'How does Google Sign-In & Appwrite security work?',
  'How do I start a project?',
];

function localFaqFallback(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('payment') || q.includes('jazzcash') || q.includes('easypaisa') || q.includes('stripe')) {
    return 'DEVNEXUS TECH supports international Stripe, PayPal, and Payoneer request links alongside Pakistani JazzCash and Easypaisa checkout adapters. Each gateway activates once merchant credentials are configured in the server environment.';
  }
  if (q.includes('google') || q.includes('appwrite') || q.includes('auth') || q.includes('login')) {
    return 'Authentication runs on official Appwrite Authentication and Google OAuth 2.0. Users are verified server-side via JWT, and administrator access is strictly isolated by server-verified roles.';
  }
  if (q.includes('start') || q.includes('hire') || q.includes('price') || q.includes('quote')) {
    return 'You can submit structured requirements on the Start a Project page (/start-project) or reach out via Contact (/contact) or WhatsApp. We respond within 24 business hours.';
  }
  return 'DEVNEXUS TECH builds Websites, Web Applications, E-commerce Platforms, Custom Software, AI Chatbots, n8n AI Automation, Admin Dashboards, UI/UX Systems (Figma), and API Integrations for Pakistan and global clients.';
}

export default function AIAssistantWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! Ask me about DEVNEXUS TECH engineering services, AI automation, tech stack, or starting a project.',
      badge: 'DEVNEXUS Assistant',
    },
  ]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || typing) return;

    const userMsg: ChatMessage = { id: Date.now(), sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.configured && json.reply) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, sender: 'bot', text: json.reply, badge: json.provider || 'Live AI' },
        ]);
      } else {
        const answer = localFaqFallback(text);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: `${answer}\n\n(Note: Live OpenAI/Gemini LLM inference is pending server API key configuration.)`,
            badge: 'FAQ Mode (LLM Key Pending)',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: localFaqFallback(text),
          badge: 'Offline FAQ Assist',
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Toggle DEVNEXUS AI Assistant"
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-sky-600 to-blue-600 dark:from-electric-400 dark:to-electric-500 text-white dark:text-navy-950 shadow-glow-md hover:scale-105 transition-transform flex items-center justify-center cursor-pointer"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[540px] max-h-[78vh] glass-panel rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col overflow-hidden">
          <div className="px-4 py-3.5 bg-slate-900 dark:bg-navy-950 border-b border-slate-800 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-electric-500/20 border border-electric-400/40 flex items-center justify-center text-electric-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold leading-tight">DEVNEXUS AI Assistant</div>
                <div className="text-[10px] font-mono text-slate-400">Server-Side OpenAI / Gemini Ready</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setMessages([
                  {
                    id: Date.now(),
                    sender: 'bot',
                    text: 'Session cleared. How can DEVNEXUS TECH assist with your software or AI initiative?',
                    badge: 'DEVNEXUS Assistant',
                  },
                ])
              }
              className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              title="Reset chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="px-3 py-2 bg-slate-100/80 dark:bg-navy-900/70 border-b border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendMessage(prompt)}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-500 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/80 dark:bg-navy-950/60">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 font-medium rounded-br-none'
                      : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
                {m.badge && (
                  <span className="text-[10px] font-mono text-slate-400 mt-1 px-1">{m.badge}</span>
                )}
              </div>
            ))}
            {typing && (
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 animate-pulse">
                Processing request...
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-3 bg-white dark:bg-navy-950 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void sendMessage();
                }}
                placeholder="Ask about services, stack, or pricing..."
                className="flex-1 rounded-xl px-3.5 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={!input.trim() || typing}
                aria-label="Send chat message"
                className="p-2.5 rounded-xl bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
              <a
                href={COMPANY.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp Direct</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/start-project');
                }}
                className="inline-flex items-center gap-1 text-sky-600 dark:text-electric-400 hover:underline cursor-pointer"
              >
                <span>Start Project</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
