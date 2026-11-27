import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { fetchPublicBootstrap } from './lib/api';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageLoader from './components/PageLoader';
import ConsentBanner from './components/ConsentBanner';
import AIAssistantWidget from './components/AIAssistantWidget';
import { GuestOnlyRoute, ProtectedRoute } from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const TechnologiesPage = lazy(() => import('./pages/TechnologiesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const StartProjectPage = lazy(() => import('./pages/StartProjectPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AuthCallbackPage = lazy(() =>
  import('./pages/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage }))
);
const EmailVerifyPage = lazy(() =>
  import('./pages/AuthCallbackPage').then((m) => ({ default: m.EmailVerifyPage }))
);
const ResetPasswordPage = lazy(() =>
  import('./pages/AuthCallbackPage').then((m) => ({ default: m.ResetPasswordPage }))
);
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
import type { PublicBootstrapData } from './types';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);
  return null;
}

function NotFoundPage() {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
      <span className="text-xs font-mono text-sky-600 dark:text-electric-400">ERROR 404</span>
      <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-white">Page Not Found</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
        The route you requested does not exist on DEVNEXUS TECH.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950"
      >
        Return Home
      </Link>
    </div>
  );
}

function AppShell() {
  const [bootstrap, setBootstrap] = useState<PublicBootstrapData | null>(null);

  const loadBootstrap = useCallback(async () => {
    const data = await fetchPublicBootstrap();
    if (data) setBootstrap(data);
  }, []);

  useEffect(() => {
    void loadBootstrap();
  }, [loadBootstrap]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <ScrollToTop />
      <PageLoader />
      <Navbar announcement={bootstrap?.announcement} />

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center text-xs font-mono text-slate-500">
              Loading module...
            </div>
          }
        >
          <Routes>
          <Route
            path="/"
            element={
              <HomePage
                services={bootstrap?.services}
                portfolio={bootstrap?.portfolio}
                testimonials={bootstrap?.testimonials}
              />
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage services={bootstrap?.services} />} />
          <Route path="/portfolio" element={<PortfolioPage portfolio={bootstrap?.portfolio} />} />
          <Route path="/portfolio/:slug" element={<ProjectDetailPage portfolio={bootstrap?.portfolio} />} />
          <Route path="/technologies" element={<TechnologiesPage />} />
          <Route path="/contact" element={<ContactPage services={bootstrap?.services} />} />
          <Route path="/start-project" element={<StartProjectPage services={bootstrap?.services} />} />

          <Route
            path="/login"
            element={
              <GuestOnlyRoute>
                <LoginPage />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnlyRoute>
                <RegisterPage />
              </GuestOnlyRoute>
            }
          />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/auth/verify" element={<EmailVerifyPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={<AdminDashboardPage onContentUpdated={() => void loadBootstrap()} />}
          />

          <Route path="/legal/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/legal/terms" element={<LegalPage type="terms" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <AIAssistantWidget />
      <ConsentBanner
        ga4Id={bootstrap?.analytics?.ga4_measurement_id}
        gtmId={bootstrap?.analytics?.gtm_container_id}
        metaPixelId={bootstrap?.analytics?.meta_pixel_id}
      />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
