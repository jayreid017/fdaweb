import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../components/auth/LoginPage.vue';
import ForgotPasswordPage from '../components/auth/ForgotPasswordPage.vue';
import ResetPasswordPage from '../components/auth/ResetPasswordPage.vue';
import EstablishmentPage from '../components/establishment/EstablishmentPage.vue';
import { AuthService } from '../services/authService';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: {
      title: 'Sign In | FDA-CAR CDRHR Regulatory Portal',
      guestOnly: true
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordPage,
    meta: {
      title: 'Forgot Password | FDA-CAR CDRHR Regulatory Portal',
      guestOnly: true
    }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPasswordPage,
    meta: {
      title: 'Reset Password | FDA-CAR CDRHR Regulatory Portal'
    }
  },
  {
    path: '/',
    name: 'Establishments',
    component: EstablishmentPage,
    meta: {
      title: 'Establishment Management | FDA-CAR CDRHR',
      requiresAuth: true
    }
  },
  {
    path: '/establishments',
    redirect: '/'
  },
  {
    path: '/trash',
    name: 'Trash',
    component: EstablishmentPage,
    meta: {
      title: 'Trash | FDA-CAR CDRHR Regulatory Portal',
      requiresAuth: true
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: EstablishmentPage,
    meta: {
      title: 'Settings & Reset Password | FDA-CAR CDRHR Regulatory Portal',
      requiresAuth: true
    }
  },
  {
    path: '/settings/password',
    redirect: '/settings'
  },
  {
    path: '/change-password',
    redirect: '/settings'
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

// Navigation Guards with Supabase Session Verification
router.beforeEach(async (to, _from, next) => {
  // Step 1: Detect Supa
  //  recovery information in URL hash or search
  const hash = typeof window !== 'undefined' ? window.location.hash || '' : '';
  const search = typeof window !== 'undefined' ? window.location.search || '' : '';
  const isUrlRecovery = hash.includes('type=recovery') || search.includes('type=recovery');

  // Step 2: Set recovery mode if detected
  if (isUrlRecovery) {
    AuthService.setRecoveryMode(true);
  }

  // Step 3: Wait for auth initialization
  await AuthService.waitForAuthReady();

  // Set document title if specified
  if (to.meta.title) {
    document.title = String(to.meta.title);
  }

  // Step 4: Recovery mode gets priority over normal authentication
  if (AuthService.isRecoveryMode.value) {
    if (to.path === '/reset-password') {
      next();
      return;
    }
    // Any other route attempted during recovery redirects to /reset-password
    next({ path: '/reset-password' });
    return;
  }

  // Step 5: Normal authentication checks (only when recovery mode is false)
  const isAuth = AuthService.isAuthenticated.value;

  if (to.meta.requiresAuth && !isAuth) {
    next({ path: '/login', query: { redirect: to.fullPath } });
    return;
  }

  if (to.meta.guestOnly && isAuth) {
    next({ path: '/' });
    return;
  }

  next();
});

export default router;
