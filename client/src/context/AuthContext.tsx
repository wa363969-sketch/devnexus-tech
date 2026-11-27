import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  account,
  ID,
  OAuthProvider,
  getAppwriteAvatarUrl,
  isAppwriteConfigured,
  syncProfileToAppwriteCollection,
} from '../lib/appwrite';
import type { AuthUser, UserRole } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  oauthLoading: boolean;
  appwriteReady: boolean;
  error: string | null;
  clearError: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<{ ok: boolean; role?: UserRole; error?: string }>;
  registerWithEmail: (
    name: string,
    email: string,
    password: string,
    company?: string
  ) => Promise<{ ok: boolean; verificationSent?: boolean; error?: string }>;
  sendVerificationEmail: () => Promise<{ ok: boolean; message: string }>;
  completeVerification: (userId: string, secret: string) => Promise<{ ok: boolean; message: string }>;
  requestPasswordReset: (email: string) => Promise<{ ok: boolean; message: string }>;
  completePasswordReset: (userId: string, secret: string, password: string) => Promise<{ ok: boolean; message: string }>;
  handleOAuthCallback: () => Promise<{ ok: boolean; user?: AuthUser; error?: string }>;
  refreshSession: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function extractAppwriteError(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [oauthLoading, setOauthLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const appwriteReady = isAppwriteConfigured();

  const clearError = useCallback(() => setError(null), []);

  const syncWithBackend = useCallback(
    async (appwriteUser: {
      $id: string;
      name: string;
      email: string;
      emailVerification: boolean;
      labels?: string[];
      $createdAt?: string;
    }, provider: string, avatarUrl: string | null): Promise<AuthUser> => {
      let role: UserRole = 'client';
      let isAdmin = false;

      try {
        const jwtObj = await account.createJWT();
        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-JWT': jwtObj.jwt,
          },
          body: JSON.stringify({
            jwt: jwtObj.jwt,
            provider,
            avatar_url: avatarUrl || '',
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.user?.role === 'admin' && json?.user?.is_admin === true) {
            role = 'admin';
            isAdmin = true;
          }
        }
      } catch {
        // Backend sync offline fallback keeps conservative 'client' role — never grants admin
      }

      // Also upsert profile safely in Appwrite Database (no OAuth tokens or passwords stored)
      await syncProfileToAppwriteCollection({
        userId: appwriteUser.$id,
        fullName: appwriteUser.name || appwriteUser.email.split('@')[0],
        email: appwriteUser.email,
        avatarUrl,
        authProvider: provider,
      });

      return {
        id: appwriteUser.$id,
        name: appwriteUser.name || appwriteUser.email.split('@')[0],
        email: appwriteUser.email,
        emailVerified: Boolean(appwriteUser.emailVerification),
        avatarUrl,
        authProvider: provider,
        role,
        isAdmin,
        labels: appwriteUser.labels || [],
        createdAt: appwriteUser.$createdAt,
      };
    },
    []
  );

  const refreshSession = useCallback(async (): Promise<AuthUser | null> => {
    if (!appwriteReady) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const current = await account.get();
      let provider = 'email';
      try {
        const session = await account.getSession({ sessionId: 'current' });
        provider = session.provider || 'email';
      } catch {
        // ignore if current session metadata unavailable
      }
      const avatarUrl = getAppwriteAvatarUrl(current.name || current.email);
      const hydrated = await syncWithBackend(current, provider, avatarUrl);
      setUser(hydrated);
      return hydrated;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [appwriteReady, syncWithBackend]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const loginWithGoogle = async () => {
    setError(null);
    if (!appwriteReady) {
      setError(
        'Google OAuth is pending Appwrite configuration. Set VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID in client/.env and enable Google OAuth 2.0 in your Appwrite Console.'
      );
      return;
    }

    setOauthLoading(true);
    try {
      const origin = window.location.origin;
      account.createOAuth2Session({
        provider: OAuthProvider.Google,
        success: `${origin}/auth/callback`,
        failure: `${origin}/login?error=oauth_cancelled`,
        scopes: ['openid', 'email', 'profile'],
      });
    } catch (err) {
      setOauthLoading(false);
      setError(extractAppwriteError(err, 'Unable to initiate Google OAuth session.'));
    }
  };

  const handleOAuthCallback = async (): Promise<{ ok: boolean; user?: AuthUser; error?: string }> => {
    if (!appwriteReady) {
      return {
        ok: false,
        error: 'Appwrite environment variables (VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID) are not configured.',
      };
    }

    setLoading(true);
    try {
      const hydrated = await refreshSession();
      if (!hydrated) {
        return {
          ok: false,
          error: 'No active Appwrite OAuth session found. Check that your domain and callback URL are authorized in Appwrite Console & Google Cloud.',
        };
      }
      return { ok: true, user: hydrated };
    } catch (err) {
      const msg = extractAppwriteError(err, 'OAuth session verification failed.');
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setError(null);
    if (!appwriteReady) {
      const msg = 'Appwrite authentication is pending configuration (VITE_APPWRITE_PROJECT_ID missing).';
      setError(msg);
      return { ok: false, error: msg };
    }

    try {
      await account.createEmailPasswordSession({ email: email.trim(), password });
      const hydrated = await refreshSession();
      if (!hydrated) {
        const msg = 'Session created, but user profile could not be retrieved.';
        setError(msg);
        return { ok: false, error: msg };
      }
      return { ok: true, role: hydrated.role };
    } catch (err) {
      const msg = extractAppwriteError(err, 'Invalid email or password.');
      setError(msg);
      return { ok: false, error: msg };
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string, company?: string) => {
    setError(null);
    if (!appwriteReady) {
      const msg = 'Appwrite authentication is pending configuration (VITE_APPWRITE_PROJECT_ID missing).';
      setError(msg);
      return { ok: false, error: msg };
    }

    try {
      await account.create({
        userId: ID.unique(),
        email: email.trim(),
        password,
        name: name.trim(),
      });
      await account.createEmailPasswordSession({ email: email.trim(), password });
      if (company?.trim()) {
        try {
          await account.updatePrefs({ prefs: { company: company.trim() } });
        } catch {
          // non-fatal
        }
      }
      let verificationSent = false;
      try {
        await account.createVerification({ url: `${window.location.origin}/auth/verify` });
        verificationSent = true;
      } catch {
        // SMTP may not be configured in Appwrite Console yet
      }
      await refreshSession();
      return { ok: true, verificationSent };
    } catch (err) {
      const msg = extractAppwriteError(err, 'Registration failed. Please verify your details.');
      setError(msg);
      return { ok: false, error: msg };
    }
  };

  const sendVerificationEmail = async () => {
    if (!appwriteReady) {
      return { ok: false, message: 'Appwrite is not configured.' };
    }
    try {
      await account.createVerification({ url: `${window.location.origin}/auth/verify` });
      return { ok: true, message: 'Verification link sent to your email address.' };
    } catch (err) {
      return { ok: false, message: extractAppwriteError(err, 'Could not send verification email.') };
    }
  };

  const completeVerification = async (userId: string, secret: string) => {
    if (!appwriteReady) return { ok: false, message: 'Appwrite is not configured.' };
    try {
      await account.updateVerification({ userId, secret });
      await refreshSession();
      return { ok: true, message: 'Your email address has been verified.' };
    } catch (err) {
      return { ok: false, message: extractAppwriteError(err, 'Invalid or expired verification token.') };
    }
  };

  const requestPasswordReset = async (email: string) => {
    if (!appwriteReady) return { ok: false, message: 'Appwrite is not configured.' };
    try {
      await account.createRecovery({
        email: email.trim(),
        url: `${window.location.origin}/reset-password`,
      });
      return { ok: true, message: 'Password reset instructions sent if the account exists.' };
    } catch (err) {
      return { ok: false, message: extractAppwriteError(err, 'Failed to request password recovery.') };
    }
  };

  const completePasswordReset = async (userId: string, secret: string, password: string) => {
    if (!appwriteReady) return { ok: false, message: 'Appwrite is not configured.' };
    try {
      await account.updateRecovery({ userId, secret, password });
      return { ok: true, message: 'Password updated successfully. You may now sign in.' };
    } catch (err) {
      return { ok: false, message: extractAppwriteError(err, 'Password reset failed or token expired.') };
    }
  };

  const logout = async () => {
    try {
      if (appwriteReady) {
        await account.deleteSession({ sessionId: 'current' });
      }
    } catch {
      // ignore if already expired
    } finally {
      setUser(null);
      setError(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        oauthLoading,
        appwriteReady,
        error,
        clearError,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        sendVerificationEmail,
        completeVerification,
        requestPasswordReset,
        completePasswordReset,
        handleOAuthCallback,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
