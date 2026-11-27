import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';
import SeoHead from '../components/SeoHead';

export default function LegalPage({ type }: { type: 'privacy' | 'terms' }) {
  const isPrivacy = type === 'privacy';

  return (
    <div className="bg-slate-50 dark:bg-navy-950 min-h-screen py-16">
      <SeoHead
        title={`${isPrivacy ? 'Privacy Policy' : 'Terms of Service'} — DEVNEXUS TECH`}
        description="DEVNEXUS TECH confidentiality, data security, NDA practices, and intellectual property terms."
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono text-sky-600 dark:text-electric-400">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="architectural-card rounded-3xl p-8 sm:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-electric-400">
              {isPrivacy ? <ShieldCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {isPrivacy ? 'Privacy Policy & Confidentiality' : 'Terms of Service & IP Ownership'}
              </h1>
              <p className="text-xs font-mono text-slate-500">DEVNEXUS TECH • Updated 2026</p>
            </div>
          </div>

          {isPrivacy ? (
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>1. Information We Collect:</strong> When you submit inquiries or register via Appwrite
                Authentication (Google OAuth 2.0 or Email/Password), DEVNEXUS TECH stores only your name, email,
                optional company/contact metadata, and project specifications.
              </p>
              <p>
                <strong>2. OAuth Security:</strong> Google OAuth credentials and access tokens are never stored in our
                application database. Authentication is handled directly by Appwrite Auth and verified via server-side JWT.
              </p>
              <p>
                <strong>3. Analytics Consent:</strong> Optional telemetry tags (GA4, GTM, Meta Pixel) remain inactive
                until you explicitly opt in via the privacy preference banner.
              </p>
              <p>
                <strong>4. Confidentiality & NDA:</strong> Project specifications and architectural documents are treated
                strictly confidentially and never sold or shared with third-party data brokers.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>1. Scope & Milestones:</strong> All engagements proceed according to agreed technical
                specifications, staging deliverables, and milestone approval checkpoints.
              </p>
              <p>
                <strong>2. 100% Intellectual Property Ownership:</strong> Upon final milestone settlement, full copyright,
                Git repositories, schemas, and custom design assets transfer completely to the client.
              </p>
              <p>
                <strong>3. Architectural Concepts Disclaimer:</strong> Portfolio blueprints displayed prior to
                completed commercial releases are transparently identified as functional demonstration concepts.
              </p>
              <p>
                <strong>4. Payment Processing:</strong> International and Pakistani gateways (Stripe, PayPal, Payoneer,
                JazzCash, Easypaisa) operate strictly in accordance with configured merchant rules.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
