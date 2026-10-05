import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../components/auth/LoginPage.vue';
import EstablishmentPage from '../components/establishment/EstablishmentPage.vue';
import { AuthService, initAuth } from '../services/authService';

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
  // Await Supabase initial session check
  await AuthService.waitForAuthReady();

  if (to.meta.title) {
    document.title = String(to.meta.title);
  }

  const isAuth = AuthService.isAuthenticated.value;

  if (to.meta.requiresAuth && !isAuth) {
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else if (to.meta.guestOnly && isAuth) {
    next({ path: '/' });
  } else {
    next();
  }
});

export default router;
