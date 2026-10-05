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

const currentUser = ref<UserProfile | null>(null);
const currentSession = ref<SupabaseSession | null>(null);
const isLoading = ref<boolean>(false);
const isInitialized = ref<boolean>(false);

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
 * Initialize Supabase Auth listener and restore existing session
 */
export function initAuth(): Promise<void> {
  if (isInitialized.value) {
    return authReadyPromise;
  }
  isInitialized.value = true;

  // 1. Initial cached profile for instantaneous UI render
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      currentUser.value = JSON.parse(cached);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // 2. Fetch current active session from Supabase
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
      console.warn('[Supabase Auth] Session fetch notice:', error.message);
    }

    if (session?.user) {
      currentSession.value = session;
      const profile = parseUserProfile(session.user);
      currentUser.value = profile;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } else {
      currentSession.value = null;
      currentUser.value = null;
      localStorage.removeItem(STORAGE_KEY);
    }
    authReadyResolve();
  }).catch((err) => {
    console.error('[Supabase Auth] Initialization error:', err);
    authReadyResolve();
  });

  // 3. Listen to all Supabase Auth State changes in real time
  supabase.auth.onAuthStateChange((event, session) => {
    currentSession.value = session;
    if (session?.user) {
      const profile = parseUserProfile(session.user);
      currentUser.value = profile;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } else if (event === 'SIGNED_OUT') {
      currentUser.value = null;
      currentSession.value = null;
      localStorage.removeItem(STORAGE_KEY);
    }
  });

  return authReadyPromise;
}

export const AuthService = {
  currentUser: computed(() => currentUser.value),
  currentSession: computed(() => currentSession.value),
  isAuthenticated: computed(() => !!currentUser.value),
  isLoading: computed(() => isLoading.value),

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
        console.error('[Supabase Auth] Sign In Error:', error);
        throw new Error(error.message);
      }

      if (!data?.user) {
        throw new Error('No user returned from Supabase authentication.');
      }

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
   * Request real password reset email via Supabase Auth
   */
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        return { success: false, message: 'Please enter your registered email address.' };
      }

      const redirectUrl = `${window.location.origin}/login`;
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
    localStorage.removeItem(STORAGE_KEY);
  }
};
