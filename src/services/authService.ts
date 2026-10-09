import { ref, computed } from 'vue';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  division: string;
  region: string;
  badgeNumber: string;
  avatarInitials: string;
}

const STORAGE_KEY = 'fda_auth_user';
const RECOVERY_STORAGE_KEY = 'fda_recovery_active';

const currentUser = ref<UserProfile | null>(null);
const currentSession = ref<SupabaseSession | null>(null);
const isLoading = ref<boolean>(false);
const isInitialized = ref<boolean>(false);
function detectIncomingRecovery(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    if (hash.includes('error=') || search.includes('error=')) {
      sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
      return false;
    }
    const isUrl = hash.includes('type=recovery') || search.includes('type=recovery');
    const isStored = sessionStorage.getItem(RECOVERY_STORAGE_KEY) === 'true';
    if (isUrl) {
      sessionStorage.setItem(RECOVERY_STORAGE_KEY, 'true');
    }
    return isUrl || isStored;
  } catch {
    return false;
  }
}

const isRecoveryMode = ref<boolean>(detectIncomingRecovery());

let authReadyResolve: () => void;
const authReadyPromise = new Promise<void>((resolve) => {
  authReadyResolve = resolve;
});

function getInitials(nameOrEmail: string): string {
  const parts = nameOrEmail.trim().split(/[\s.@_-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (nameOrEmail.slice(0, 2) || 'JD').toUpperCase();
}

function parseUserProfile(user: SupabaseUser): UserProfile {
  const meta = user.user_metadata || {};
  const email = user.email || 'officer@fda.gov.ph';
  const name = meta.full_name || meta.name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const role = meta.role || 'Regulatory Officer';
  const division = meta.division || 'CDRHR Center';
  const region = meta.region || 'Cordillera Administrative Region (CAR)';
  const badgeNumber = meta.badge_number || `FDA-CAR-${user.id.slice(0, 8).toUpperCase()}`;

  return {
    id: user.id,
    email,
    name,
    role,
    division,
    region,
    badgeNumber,
    avatarInitials: getInitials(name)
  };
}

/**
 * Clean URL hash/search tokens from browser location without triggering page reload
 */
function cleanRecoveryUrl(): void {
  if (typeof window === 'undefined') return;
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  if (hash.includes('type=recovery') || search.includes('type=recovery') || search.includes('code=') || hash.includes('access_token')) {
    window.history.replaceState(null, '', window.location.pathname);
  }
}

/**
 * Initialize Supabase Auth listener and restore existing session
 */
export function initAuth(): Promise<void> {
  if (isInitialized.value) {
    return authReadyPromise;
  }
  isInitialized.value = true;

  // Detect recovery markers in incoming URL
  if (typeof window !== 'undefined') {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    if (!hash.includes('error=') && !search.includes('error=')) {
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        isRecoveryMode.value = true;
        try {
          sessionStorage.setItem(RECOVERY_STORAGE_KEY, 'true');
        } catch {}
      }
    }
  }

  // 1. Initial cached profile for instantaneous UI render (normal sessions only)
  if (!isRecoveryMode.value) {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        currentUser.value = JSON.parse(cached);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  // 2. Single Supabase Auth State Change listener
  supabase.auth.onAuthStateChange((event, session) => {
    currentSession.value = session;

    if (event === 'PASSWORD_RECOVERY') {
      isRecoveryMode.value = true;
      try {
        sessionStorage.setItem(RECOVERY_STORAGE_KEY, 'true');
      } catch {}
      if (session?.user) {
        currentUser.value = parseUserProfile(session.user);
      }
      return;
    }

    if (event === 'SIGNED_OUT') {
      currentUser.value = null;
      currentSession.value = null;
      isRecoveryMode.value = false;
      try {
        sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      return;
    }

    // If in recovery mode, do not treat incoming session as normal persistent login
    if (isRecoveryMode.value) {
      if (session?.user) {
        currentUser.value = parseUserProfile(session.user);
      }
      return;
    }

    // Normal authenticated session handling (SIGNED_IN, TOKEN_REFRESHED, INITIAL_SESSION)
    if (session?.user) {
      const profile = parseUserProfile(session.user);
      currentUser.value = profile;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } else {
      currentUser.value = null;
      localStorage.removeItem(STORAGE_KEY);
    }
  });

  // 3. Fetch current active session from Supabase
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
      console.warn('[Supabase Auth] Session fetch notice:', error.message);
    }

    if (session?.user) {
      currentSession.value = session;
      const profile = parseUserProfile(session.user);
      currentUser.value = profile;

      // Only persist to localStorage if normal authenticated session, not during recovery
      if (!isRecoveryMode.value) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      }
    } else {
      currentSession.value = null;
      if (!isRecoveryMode.value) {
        currentUser.value = null;
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    authReadyResolve();
  }).catch((err) => {
    console.error('[Supabase Auth] Initialization error:', err);
    authReadyResolve();
  });

  return authReadyPromise;
}

export const AuthService = {
  currentUser: computed(() => currentUser.value),
  currentSession: computed(() => currentSession.value),
  isAuthenticated: computed(() => !!currentUser.value && !isRecoveryMode.value),
  isRecoveryMode: computed(() => isRecoveryMode.value),
  isLoading: computed(() => isLoading.value),

  /**
   * Set recovery mode state explicitly
   */
  setRecoveryMode(val: boolean): void {
    isRecoveryMode.value = val;
    if (typeof window !== 'undefined') {
      try {
        if (val) {
          sessionStorage.setItem(RECOVERY_STORAGE_KEY, 'true');
        } else {
          sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
        }
      } catch {}
    }
  },

  /**
   * Await initial Supabase authentication resolution
   */
  async waitForAuthReady(): Promise<void> {
    await initAuth();
    await authReadyPromise;
  },

  /**
   * Connect and sign in with Supabase Authentication
   */
  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: UserProfile }> {
    isLoading.value = true;
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      if (!cleanEmail) {
        throw new Error('Please enter your FDA official email address.');
      }
      if (!cleanPassword) {
        throw new Error('Please enter your password.');
      }

      // Real Supabase Authentication Call
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        console.error('[Supabase Auth] Sign In Error:', error.message);
        throw new Error(error.message);
      }

      if (!data?.user) {
        throw new Error('No user returned from Supabase authentication.');
      }

      isRecoveryMode.value = false;
      try {
        sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
      } catch {}

      currentSession.value = data.session;
      const profile = parseUserProfile(data.user);
      currentUser.value = profile;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));

      return {
        success: true,
        message: `Welcome back, ${profile.name}. Authorized session initialized via Supabase.`,
        user: profile
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Authentication failed. Please verify your credentials.'
      };
    } finally {
      isLoading.value = false;
    }
  },

  /**
   * Register a new Officer account directly in Supabase
   */
  async signUp(
    email: string,
    password: string,
    metadata?: { fullName?: string; role?: string; division?: string }
  ): Promise<{ success: boolean; message: string; requiresEmailConfirmation?: boolean }> {
    isLoading.value = true;
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            full_name: metadata?.fullName || 'FDA Regulatory Officer',
            role: metadata?.role || 'Regulatory Officer',
            division: metadata?.division || 'CDRHR Center',
            region: 'Cordillera Administrative Region (CAR)'
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data?.session?.user) {
        const profile = parseUserProfile(data.session.user);
        currentUser.value = profile;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        return {
          success: true,
          message: 'Account created and authorized successfully.',
          requiresEmailConfirmation: false
        };
      }

      return {
        success: true,
        message: 'Account registered with Supabase! Please check your email inbox to confirm your registration.',
        requiresEmailConfirmation: true
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Unable to register account in Supabase.'
      };
    } finally {
      isLoading.value = false;
    }
  },

  /**
   * Request password reset email via Supabase Auth
   * Uses configured production URL or window.location.origin targeting /reset-password
   */
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        return { success: false, message: 'Please enter your registered email address.' };
      }

      // Priority: VITE_SITE_URL or VITE_APP_URL, falling back to window.location.origin
      const rawBase = (
        import.meta.env.VITE_SITE_URL ||
        import.meta.env.VITE_APP_URL ||
        (typeof window !== 'undefined' ? window.location.origin : '')
      ).trim();

      // Ensure base URL has no accidental /reset-password suffix or trailing slashes
      const baseUrl = rawBase.replace(/\/reset-password\/?$/, '').replace(/\/+$/, '');
      const redirectUrl = `${baseUrl}/reset-password`;

      // Safe debug log: outputs only the target redirectUrl string (never sensitive tokens or credentials)
      console.log('[Password Reset] redirectTo:', redirectUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: `Security instructions dispatched by Supabase to ${cleanEmail}.`
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Could not dispatch password reset request.'
      };
    }
  },

  /**
   * Update password in Supabase Auth using active recovery session
   */
  async updatePassword(password: string): Promise<{ success: boolean; message: string }> {
    isLoading.value = true;
    try {
      const cleanPassword = password.trim();
      if (!cleanPassword || cleanPassword.length < 8) {
        throw new Error('Password must be at least 8 characters.');
      }

      const { error } = await supabase.auth.updateUser({
        password: cleanPassword
      });

      if (error) {
        throw error;
      }

      // 1. Clear recovery mode
      isRecoveryMode.value = false;

      // 2. Remove recovery flag from sessionStorage
      try {
        sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
      } catch {}

      // 3. Clear locally cached user
      currentUser.value = null;
      currentSession.value = null;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}

      // 4. Cleanly sign out recovery session from Supabase
      try {
        await supabase.auth.signOut();
      } catch (signOutErr) {
        console.warn('[Supabase Auth] Recovery signout notice:', signOutErr);
      }

      return {
        success: true,
        message: 'Password updated successfully!'
      };
    } catch (err: any) {
      return {
        success: false,
        message: (err.message || 'Failed to update password.').replace(/supabase/gi, 'system')
      };
    } finally {
      isLoading.value = false;
    }
  },

  /**
   * Update password for an authenticated officer from Settings page
   */
  async updateAuthenticatedPassword(
    currentPassword: string,
    newPassword: string,
    signOutAfter = false
  ): Promise<{ success: boolean; message: string }> {
    isLoading.value = true;
    try {
      const cleanCurrent = currentPassword.trim();
      const cleanNew = newPassword.trim();

      if (!cleanCurrent) {
        throw new Error('Please enter your current password.');
      }
      if (!cleanNew || cleanNew.length < 8) {
        throw new Error('New password must be at least 8 characters.');
      }
      if (cleanCurrent === cleanNew) {
        throw new Error('New password must be different from your current password.');
      }

      // 1. Verify active user session and email
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email || currentUser.value?.email;

      if (!email) {
        throw new Error('Active session could not be verified. Please sign in again.');
      }

      // 2. Authenticate with current password to verify identity
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: cleanCurrent
      });

      if (verifyError) {
        console.warn('[Supabase Auth] Re-authentication failed:', verifyError.message);
        throw new Error('Incorrect current password. Please verify your credentials and try again.');
      }

      // 3. Update to the new password
      const { data, error } = await supabase.auth.updateUser({
        password: cleanNew
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        const profile = parseUserProfile(data.user);
        currentUser.value = profile;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      }

      if (signOutAfter) {
        await this.logout();
      }

      return {
        success: true,
        message: 'Your official credentials have been updated successfully!'
      };
    } catch (err: any) {
      return {
        success: false,
        message: (err.message || 'Failed to update password.').replace(/supabase/gi, 'system')
      };
    } finally {
      isLoading.value = false;
    }
  },

  /**
   * Verify whether the current browser context holds a valid recovery session
   */
  async checkRecoveryState(): Promise<{ isValid: boolean; error?: string }> {
    // 1. Check for error parameters in hash or search query
    const hash = typeof window !== 'undefined' && window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : '';
    const search = typeof window !== 'undefined' && window.location.search.startsWith('?')
      ? window.location.search.slice(1)
      : '';
    const hashParams = new URLSearchParams(hash);
    const searchParams = new URLSearchParams(search);

    const hasError = hashParams.get('error') || searchParams.get('error')
      || hashParams.get('error_description') || searchParams.get('error_description')
      || hashParams.get('error_code') || searchParams.get('error_code');

    if (hasError) {
      cleanRecoveryUrl();
      isRecoveryMode.value = false;
      try {
        sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
      } catch {}
      const errorDesc = hashParams.get('error_description') || searchParams.get('error_description');
      return {
        isValid: false,
        error: errorDesc ? errorDesc.replace(/\+/g, ' ') : 'Password reset link is invalid or has expired.'
      };
    }

    // 2. PKCE code exchange if present
    const code = searchParams.get('code');
    if (code) {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error || !data?.session) {
          cleanRecoveryUrl();
          isRecoveryMode.value = false;
          try {
            sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
          } catch {}
          return { isValid: false, error: 'Password reset link is invalid or has expired.' };
        }
        currentSession.value = data.session;
        if (data.session.user) {
          currentUser.value = parseUserProfile(data.session.user);
        }
        isRecoveryMode.value = true;
        try {
          sessionStorage.setItem(RECOVERY_STORAGE_KEY, 'true');
        } catch {}
        cleanRecoveryUrl();
        return { isValid: true };
      } catch {
        cleanRecoveryUrl();
        isRecoveryMode.value = false;
        try {
          sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
        } catch {}
        return { isValid: false, error: 'Password reset link is invalid or has expired.' };
      }
    }

    // 3. Await Supabase initial session check
    await AuthService.waitForAuthReady();

    let session = currentSession.value;
    if (!session) {
      const initial = await supabase.auth.getSession();
      session = initial.data?.session || null;
    }

    // If session is not immediately ready but recovery markers are present in URL, wait briefly for Supabase hash processing
    if (!session && (hash.includes('access_token') || hash.includes('type=recovery') || isRecoveryMode.value)) {
      for (let i = 0; i < 5 && !session; i++) {
        await new Promise((r) => setTimeout(r, 200));
        session = currentSession.value || (await supabase.auth.getSession()).data?.session || null;
      }
    }

    if (!session) {
      isRecoveryMode.value = false;
      try {
        sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
      } catch {}
      cleanRecoveryUrl();
      return {
        isValid: false,
        error: 'Password reset link is invalid or has expired.'
      };
    }

    // Update active session & user
    currentSession.value = session;
    if (session.user) {
      currentUser.value = parseUserProfile(session.user);
    }

    // 4. Must be a recovery session (either from URL type=recovery, PASSWORD_RECOVERY event, or active recovery storage)
    const isUrlRecovery = hash.includes('type=recovery') || search.includes('type=recovery');
    const isStoredRecovery = typeof window !== 'undefined' && sessionStorage.getItem(RECOVERY_STORAGE_KEY) === 'true';

    if (isRecoveryMode.value || isUrlRecovery || isStoredRecovery) {
      isRecoveryMode.value = true;
      try {
        sessionStorage.setItem(RECOVERY_STORAGE_KEY, 'true');
      } catch {}
      cleanRecoveryUrl();
      return { isValid: true };
    }

    // Normal session visiting /reset-password without recovery intent
    return {
      isValid: false,
      error: 'Password reset link is invalid or has expired.'
    };
  },

  /**
   * Signs out from Supabase Auth and clears session
   */
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Supabase Auth] Sign out notice:', err);
    }
    currentUser.value = null;
    currentSession.value = null;
    isRecoveryMode.value = false;
    try {
      sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
};
