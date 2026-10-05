import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { AuthService } from '../../services/authService';

const REMEMBER_KEY = 'fda_remember_me';
const REMEMBER_EMAIL_KEY = 'fda_remembered_email';

export function useLogin(emit?: (e: 'login-success') => void) {
  const router = useRouter();
  const route = useRoute();

  // Form states
  const email = ref<string>('');
  const password = ref<string>('');
  const rememberMe = ref<boolean>(true);
  const isRemembered = ref<boolean>(false);
  const showPassword = ref<boolean>(false);
  const isSubmitting = ref<boolean>(false);
  const errorMessage = ref<string>('');
  const successMessage = ref<string>('');
  const isCapsLockOn = ref<boolean>(false);

  // Fast Login / Remembered Officer info
  const rememberedName = ref<string>('');
  const rememberedRole = ref<string>('');
  const rememberedInitials = ref<string>('');

  // Reference to inputs for rapid auto-focus
  const emailInputRef = ref<HTMLInputElement | null>(null);
  const passwordInputRef = ref<HTMLInputElement | null>(null);

  // Forgot Password Modal
  const isForgotModalOpen = ref<boolean>(false);
  const forgotEmail = ref<string>('');
  const isForgotSubmitting = ref<boolean>(false);
  const forgotSubmitted = ref<boolean>(false);
  const forgotError = ref<string>('');

  // Live clock state for official feel
  const currentTime = ref<string>('');
  function updateTime() {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
  }

  function focusPassword() {
    passwordInputRef.value?.focus();
  }

  function focusEmail() {
    emailInputRef.value?.focus();
  }

  onMounted(() => {
    updateTime();
    setInterval(updateTime, 1000);

    // Fast Login: Check if user previously saved their email
    const savedRemember = localStorage.getItem(REMEMBER_KEY);
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (savedRemember === 'true' && savedEmail) {
      rememberMe.value = true;
      email.value = savedEmail;
      isRemembered.value = true;
      rememberedName.value = localStorage.getItem('fda_remembered_name') || '';
      rememberedRole.value = localStorage.getItem('fda_remembered_role') || '';
      rememberedInitials.value = localStorage.getItem('fda_remembered_initials') || '';

      // Auto-focus password input so the officer can immediately type password & press Enter
      setTimeout(() => {
        passwordInputRef.value?.focus();
      }, 100);
    }

    if (route.hash === '#forgot-password' || route.query.modal === 'forgot-password') {
      isForgotModalOpen.value = true;
    }
  });

  // Caps lock detector
  function checkCapsLock(event: KeyboardEvent) {
    isCapsLockOn.value = event.getModifierState('CapsLock');
  }

  // Clear remembered email and reset field
  function clearRemembered() {
    email.value = '';
    password.value = '';
    isRemembered.value = false;
    rememberMe.value = true;
    rememberedName.value = '';
    rememberedRole.value = '';
    rememberedInitials.value = '';
    localStorage.removeItem(REMEMBER_KEY);
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
    localStorage.removeItem('fda_remembered_name');
    localStorage.removeItem('fda_remembered_role');
    localStorage.removeItem('fda_remembered_initials');
    setTimeout(() => {
      emailInputRef.value?.focus();
    }, 50);
  }

  // Handle login submit
  async function handleLogin() {
    errorMessage.value = '';
    successMessage.value = '';

    if (!email.value.trim()) {
      errorMessage.value = 'Please provide your official FDA email address.';
      emailInputRef.value?.focus();
      return;
    }
    if (!password.value) {
      errorMessage.value = 'Please enter your account password.';
      passwordInputRef.value?.focus();
      return;
    }

    isSubmitting.value = true;
    try {
      const res = await AuthService.login(email.value, password.value);
      if (res.success) {
        successMessage.value = res.message;

        // Save or clear Remember Me credentials for next visit
        if (rememberMe.value) {
          localStorage.setItem(REMEMBER_KEY, 'true');
          localStorage.setItem(REMEMBER_EMAIL_KEY, email.value.trim());
          if (res.user?.name) {
            localStorage.setItem('fda_remembered_name', res.user.name);
            rememberedName.value = res.user.name;
          }
          if (res.user?.role) {
            localStorage.setItem('fda_remembered_role', res.user.role);
            rememberedRole.value = res.user.role;
          }
          if (res.user?.avatarInitials) {
            localStorage.setItem('fda_remembered_initials', res.user.avatarInitials);
            rememberedInitials.value = res.user.avatarInitials;
          }
          isRemembered.value = true;
        } else {
          localStorage.removeItem(REMEMBER_KEY);
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
          localStorage.removeItem('fda_remembered_name');
          localStorage.removeItem('fda_remembered_role');
          localStorage.removeItem('fda_remembered_initials');
          isRemembered.value = false;
        }

        const redirectTarget = (route.query.redirect as string) || '/';
        setTimeout(() => {
          if (emit) emit('login-success');
          router.push(redirectTarget);
        }, 500);
      } else {
        errorMessage.value = res.message.replace(/supabase/gi, 'system');
      }
    } catch (err: any) {
      errorMessage.value = (err.message || 'An error occurred during authentication.').replace(/supabase/gi, 'system');
    } finally {
      isSubmitting.value = false;
    }
  }

  // Quick Sample Credentials Fast-Fill
  function handleDemoLogin() {
    email.value = 'officer.jdoe@fda.gov.ph';
    password.value = 'officer123';
    rememberMe.value = true;
    errorMessage.value = '';
    successMessage.value = 'Sample credentials populated. Click Authenticate to proceed.';
    setTimeout(() => {
      passwordInputRef.value?.focus();
    }, 50);
  }

  // Handle Forgot Password
  async function handleForgotSubmit() {
    if (!forgotEmail.value.trim()) return;
    isForgotSubmitting.value = true;
    forgotError.value = '';
    try {
      const res = await AuthService.resetPassword(forgotEmail.value);
      if (res.success) {
        forgotSubmitted.value = true;
      } else {
        forgotError.value = res.message.replace(/supabase/gi, 'system');
      }
    } catch (err: any) {
      forgotError.value = (err.message || 'Failed to dispatch reset request.').replace(/supabase/gi, 'system');
    } finally {
      isForgotSubmitting.value = false;
    }
  }

  function closeForgotModal() {
    isForgotModalOpen.value = false;
    forgotSubmitted.value = false;
    forgotEmail.value = '';
    forgotError.value = '';
    if (route.hash || route.query.modal) {
      router.replace({ path: '/login' });
    }
  }

  return {
    email,
    password,
    rememberMe,
    isRemembered,
    rememberedName,
    rememberedRole,
    rememberedInitials,
    emailInputRef,
    passwordInputRef,
    focusPassword,
    focusEmail,
    showPassword,
    isSubmitting,
    errorMessage,
    successMessage,
    isCapsLockOn,
    isForgotModalOpen,
    forgotEmail,
    isForgotSubmitting,
    forgotSubmitted,
    forgotError,
    currentTime,
    checkCapsLock,
    clearRemembered,
    handleLogin,
    handleDemoLogin,
    handleForgotSubmit,
    closeForgotModal
  };
}
