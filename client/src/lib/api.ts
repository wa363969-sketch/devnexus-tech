import { account, isAppwriteConfigured } from './appwrite';
import type { PublicBootstrapData } from '../types';

const ADMIN_KEY_STORAGE = 'devnexus_admin_key_session';

export function getStoredAdminKey(): string {
  try {
    return sessionStorage.getItem(ADMIN_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setStoredAdminKey(key: string): void {
  try {
    if (key) sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
    else sessionStorage.removeItem(ADMIN_KEY_STORAGE);
  } catch {
    // ignore storage restriction
  }
}

async function getAuthHeaders(includeAdminKey = false): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeAdminKey) {
    const adminKey = getStoredAdminKey();
    if (adminKey) {
      headers['X-Admin-Key'] = adminKey;
    }
  }

  if (isAppwriteConfigured()) {
    try {
      const jwt = await account.createJWT();
      if (jwt?.jwt) {
        headers['X-Appwrite-JWT'] = jwt.jwt;
      }
    } catch {
      // User not logged into Appwrite
    }
  }

  return headers;
}

export async function apiRequest<T = any>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    admin?: boolean;
    customHeaders?: Record<string, string>;
  } = {}
): Promise<{ ok: boolean; status: number; data: T }> {
  const baseHeaders = await getAuthHeaders(Boolean(options.admin));
  const response = await fetch(path, {
    method: options.method || 'GET',
    headers: {
      ...baseHeaders,
      ...(options.customHeaders || {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = (await response.json().catch(() => ({}))) as T;
  return { ok: response.ok, status: response.status, data };
}

export async function fetchPublicBootstrap(): Promise<PublicBootstrapData | null> {
  try {
    const res = await fetch('/api/public/bootstrap');
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? (json as PublicBootstrapData) : null;
  } catch {
    return null;
  }
}
