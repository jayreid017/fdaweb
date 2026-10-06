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
  // 1. Intercept password recovery tokens from email links
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  const isUrlRecovery = hash.includes('type=recovery') || search.includes('type=recovery');

  if (isUrlRecovery && to.path !== '/reset-password') {
    next({ path: '/reset-password', hash: window.location.hash, query: to.query });
    return;
  }

  // Await Supabase initial session check
  await AuthService.waitForAuthReady();

  // If in active password recovery session, restrict access to /reset-password
  if (AuthService.isRecoveryMode.value && to.path !== '/reset-password' && to.path !== '/login') {
    next({ path: '/reset-password' });
    return;
  }

  if (to.meta.title) {
    document.title = String(to.meta.title);
  }

  const isAuth = AuthService.isAuthenticated.value;

  if (to.meta.requiresAuth && !isAuth) {
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else if (to.meta.guestOnly && isAuth && !AuthService.isRecoveryMode.value) {
    next({ path: '/' });
  } else {
    next();
  }
});

export default router;
