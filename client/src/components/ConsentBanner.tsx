import React, { useEffect, useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'devnexus_analytics_consent';

function injectConsentGatedScripts(config: {
  ga4Id?: string | null;
  gtmId?: string | null;
  metaPixelId?: string | null;
}) {
  if (config.ga4Id && !document.getElementById('dnx-ga4-script')) {
    const s = document.createElement('script');
    s.id = 'dnx-ga4-script';
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4Id)}`;
    document.head.appendChild(s);

    const inline = document.createElement('script');
    inline.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${config.ga4Id}', { anonymize_ip: true });`;
    document.head.appendChild(inline);
  }

  if (config.gtmId && !document.getElementById('dnx-gtm-script')) {
    const gtm = document.createElement('script');
    gtm.id = 'dnx-gtm-script';
    gtm.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${config.gtmId}');`;
    document.head.appendChild(gtm);
  }
}

export default function ConsentBanner({
  ga4Id,
  gtmId,
  metaPixelId,
}: {
  ga4Id?: string | null;
  gtmId?: string | null;
  metaPixelId?: string | null;
}) {
  const [choice, setChoice] = useState<'accepted' | 'declined' | null>(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      if (saved === 'accepted' || saved === 'declined') return saved;
    } catch {
      // ignore
    }
    return null;
  });

  const resolvedGa4 = ga4Id || import.meta.env.VITE_GA4_MEASUREMENT_ID || null;
  const resolvedGtm = gtmId || import.meta.env.VITE_GTM_CONTAINER_ID || null;
  const resolvedPixel = metaPixelId || import.meta.env.VITE_META_PIXEL_ID || null;

  useEffect(() => {
    if (choice === 'accepted' && (resolvedGa4 || resolvedGtm || resolvedPixel)) {
      injectConsentGatedScripts({ ga4Id: resolvedGa4, gtmId: resolvedGtm, metaPixelId: resolvedPixel });
    }
  }, [choice, resolvedGa4, resolvedGtm, resolvedPixel]);

  if (choice !== null) return null;

  const handleDecision = (value: 'accepted' | 'declined') => {
    setChoice(value);
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-40 glass-panel rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-700/70">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-electric-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white mb-1">Privacy & Analytics Preferences</p>
            <p>
              Essential cookies support authentication & theme state. Analytics tags load only with consent.{' '}
              <Link to="/legal/privacy" className="text-sky-600 dark:text-electric-400 underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleDecision('declined')}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
          aria-label="Close privacy banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center justify-end gap-2 mt-3">
        <button
          type="button"
          onClick={() => handleDecision('declined')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
        >
          Essential Only
        </button>
        <button
          type="button"
          onClick={() => handleDecision('accepted')}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 hover:opacity-90 cursor-pointer"
        >
          Accept Analytics
        </button>
      </div>
    </div>
  );
}
