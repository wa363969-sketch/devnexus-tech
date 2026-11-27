import { Client, Account, Databases, Storage, Avatars, OAuthProvider, ID, Permission, Role, Query } from 'appwrite';

const endpoint = (import.meta.env.VITE_APPWRITE_ENDPOINT || '').trim();
const projectId = (import.meta.env.VITE_APPWRITE_PROJECT_ID || '').trim();

export const APPWRITE_CONFIG = {
  endpoint,
  projectId,
  databaseId: (import.meta.env.VITE_APPWRITE_DATABASE_ID || 'devnexus_db').trim(),
  collections: {
    profiles: (import.meta.env.VITE_APPWRITE_COLLECTION_PROFILES || 'profiles').trim(),
    inquiries: (import.meta.env.VITE_APPWRITE_COLLECTION_INQUIRIES || 'inquiries').trim(),
    projects: (import.meta.env.VITE_APPWRITE_COLLECTION_PROJECTS || 'projects').trim(),
  },
  bucketId: (import.meta.env.VITE_APPWRITE_BUCKET_ID || 'project_briefs').trim(),
};

export function isAppwriteConfigured(): boolean {
  if (!endpoint || !projectId) return false;
  const lowered = projectId.toLowerCase();
  if (lowered.includes('your-') || lowered.includes('placeholder') || lowered === 'none') {
    return false;
  }
  return true;
}

const client = new Client();
if (isAppwriteConfigured()) {
  client.setEndpoint(endpoint).setProject(projectId);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);

export { client, OAuthProvider, ID, Permission, Role, Query };

export function getAppwriteAvatarUrl(name?: string): string | null {
  if (!isAppwriteConfigured()) return null;
  try {
    return avatars.getPhoto({ width: 160, height: 160, name: name || 'User' });
  } catch {
    try {
      return avatars.getInitials({ name: name || 'User', width: 160, height: 160 });
    } catch {
      return null;
    }
  }
}

export async function syncProfileToAppwriteCollection(params: {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  authProvider: string;
}): Promise<void> {
  if (!isAppwriteConfigured() || !APPWRITE_CONFIG.databaseId) return;
  try {
    await databases.upsertDocument({
      databaseId: APPWRITE_CONFIG.databaseId,
      collectionId: APPWRITE_CONFIG.collections.profiles,
      documentId: params.userId,
      data: {
        userId: params.userId,
        fullName: params.fullName,
        email: params.email,
        avatarUrl: params.avatarUrl || '',
        authProvider: params.authProvider,
        role: 'client',
      },
      permissions: [
        Permission.read(Role.user(params.userId)),
        Permission.update(Role.user(params.userId)),
      ],
    });
  } catch {
    // Profile collection may not exist yet in a fresh Appwrite project; fail silently while preserving auth
  }
}

export async function uploadBriefToAppwriteStorage(file: File, userId?: string): Promise<{ uploaded: boolean; fileId?: string; error?: string }> {
  if (!isAppwriteConfigured()) {
    return { uploaded: false, error: 'Appwrite Storage not configured in VITE_APPWRITE_PROJECT_ID.' };
  }
  try {
    const perms = userId ? [Permission.read(Role.user(userId))] : undefined;
    const uploaded = await storage.createFile({
      bucketId: APPWRITE_CONFIG.bucketId,
      fileId: ID.unique(),
      file,
      permissions: perms,
    });
    return { uploaded: true, fileId: uploaded.$id };
  } catch (err) {
    return {
      uploaded: false,
      error: err instanceof Error ? err.message : 'Could not upload file to Appwrite Storage.',
    };
  }
}
