import { ref, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { AuthService } from '../../services/authService';

const REMEMBER_KEY = 'fda_remember_me';
const REMEMBER_EMAIL_KEY = 'fda_remembered_email';

export interface SavedAccount {
  name: string;
  role: string;
  email: string;
  initials: string;
}

const DEFAULT_SAVED_ACCOUNT: SavedAccount = {
  name: 'dsupplier0907',
  role: 'Regulatory Officer',
  email: 'dsupplier0907@gmail.com',
  initials: 'DS'
};

export function useLogin(emit?: (e: 'login-success') => void) {
  const router = useRouter();
  const route = useRoute();

  // Form states (Normal Login)
  const email = ref<string>('');
  const password = ref<string>('');
  const rememberMe = ref<boolean>(true);
  const isRemembered = ref<boolean>(true);
  const showPassword = ref<boolean>(false);
  const isSubmitting = ref<boolean>(false);
  const errorMessage = ref<string>('');
  const successMessage = ref<string>('');
  const isCapsLockOn = ref<boolean>(false);

  // Saved Account profile
  const savedAccount = ref<SavedAccount>({ ...DEFAULT_SAVED_ACCOUNT });
  const rememberedName = ref<string>(DEFAULT_SAVED_ACCOUNT.name);
  const rememberedRole = ref<string>(DEFAULT_SAVED_ACCOUNT.role);
  const rememberedInitials = ref<string>(DEFAULT_SAVED_ACCOUNT.initials);

  // Fast Login Modal states
  const isFastLoginModalOpen = ref<boolean>(false);
  const fastLoginPassword = ref<string>('');
  const fastLoginShowPassword = ref<boolean>(false);
  const fastLoginError = ref<string>('');
  const isFastLoginSubmitting = ref<boolean>(false);

  // DOM input refs
  const emailInputRef = ref<HTMLInputElement | null>(null);
  const passwordInputRef = ref<HTMLInputElement | null>(null);
  const fastPasswordInputRef = ref<HTMLInputElement | null>(null);

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

    if (savedRemember === 'false') {
      isRemembered.value = false;
    } else if (savedEmail) {
      isRemembered.value = true;
      const accName = localStorage.getItem('fda_remembered_name') || savedEmail.split('@')[0];
      const accRole = localStorage.getItem('fda_remembered_role') || 'Regulatory Officer';
      const accInitials = localStorage.getItem('fda_remembered_initials') || 'DS';

      savedAccount.value = {
        name: accName,
        role: accRole,
        email: savedEmail,
        initials: accInitials
      };
      rememberedName.value = accName;
      rememberedRole.value = accRole;
      rememberedInitials.value = accInitials;
    } else {
      // Default initial state: dsupplier0907 saved account
      isRemembered.value = true;
      savedAccount.value = { ...DEFAULT_SAVED_ACCOUNT };
      rememberedName.value = DEFAULT_SAVED_ACCOUNT.name;
      rememberedRole.value = DEFAULT_SAVED_ACCOUNT.role;
      rememberedInitials.value = DEFAULT_SAVED_ACCOUNT.initials;
      localStorage.setItem(REMEMBER_KEY, 'true');
      localStorage.setItem(REMEMBER_EMAIL_KEY, DEFAULT_SAVED_ACCOUNT.email);
      localStorage.setItem('fda_remembered_name', DEFAULT_SAVED_ACCOUNT.name);
      localStorage.setItem('fda_remembered_role', DEFAULT_SAVED_ACCOUNT.role);
      localStorage.setItem('fda_remembered_initials', DEFAULT_SAVED_ACCOUNT.initials);
    }

    if (route.hash === '#forgot-password' || route.query.modal === 'forgot-password') {
      router.push('/forgot-password');
    }
  });

  // Caps lock detector
  function checkCapsLock(event: KeyboardEvent) {
    isCapsLockOn.value = event.getModifierState('CapsLock');
  }

  // Fast Login Modal Handlers
  function openFastLoginModal() {
    fastLoginPassword.value = '';
    fastLoginError.value = '';
    fastLoginShowPassword.value = false;
    isFastLoginModalOpen.value = true;
    // Keep page error message clear
    errorMessage.value = '';
    nextTick(() => {
      fastPasswordInputRef.value?.focus();
    });
  }

  function closeFastLoginModal() {
    isFastLoginModalOpen.value = false;
    fastLoginPassword.value = '';
    fastLoginError.value = '';
  }

  function handleSwitchAccount() {
    closeFastLoginModal();
    nextTick(() => {
      emailInputRef.value?.focus();
    });
  }

  function openForgotFromFastLogin() {
    closeFastLoginModal();
    router.push('/forgot-password');
  }

  // Authenticate Fast Login (Password-only)
  async function handleFastLoginSubmit() {
    if (isFastLoginSubmitting.value) return;
    fastLoginError.value = '';

    if (!fastLoginPassword.value) {
      fastLoginError.value = 'Please enter your security password.';
      fastPasswordInputRef.value?.focus();
      return;
    }

    isFastLoginSubmitting.value = true;
    try {
      const res = await AuthService.login(savedAccount.value.email, fastLoginPassword.value);
      if (res.success) {
        isFastLoginModalOpen.value = false;
        successMessage.value = res.message;
        const redirectTarget = (route.query.redirect as string) || '/';
        setTimeout(() => {
          if (emit) emit('login-success');
          router.push(redirectTarget);
        }, 400);
      } else {
        // Compact inline error inside the modal - DO NOT show main banner
        fastLoginError.value = 'Incorrect password. Please try again.';
        nextTick(() => {
          fastPasswordInputRef.value?.focus();
          fastPasswordInputRef.value?.select();
        });
      }
    } catch {
      fastLoginError.value = 'Incorrect password. Please try again.';
      nextTick(() => {
        fastPasswordInputRef.value?.focus();
        fastPasswordInputRef.value?.select();
      });
    } finally {
      isFastLoginSubmitting.value = false;
    }
  }

  // Clear remembered email and reset field
  function clearRemembered() {
    isRemembered.value = false;
    localStorage.setItem(REMEMBER_KEY, 'false');
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
    localStorage.removeItem('fda_remembered_name');
    localStorage.removeItem('fda_remembered_role');
    localStorage.removeItem('fda_remembered_initials');
    email.value = '';
    password.value = '';
    nextTick(() => {
      emailInputRef.value?.focus();
    });
  }

  // Handle normal login submit
  async function handleLogin() {
    if (isSubmitting.value) return;
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
          const accName = res.user?.name || email.value.trim().split('@')[0];
          const accRole = res.user?.role || 'Regulatory Officer';
          const accInitials = res.user?.avatarInitials || (accName.slice(0, 2).toUpperCase());
          localStorage.setItem('fda_remembered_name', accName);
          localStorage.setItem('fda_remembered_role', accRole);
          localStorage.setItem('fda_remembered_initials', accInitials);
          savedAccount.value = {
            name: accName,
            role: accRole,
            email: email.value.trim(),
            initials: accInitials
          };
          rememberedName.value = accName;
          rememberedRole.value = accRole;
          rememberedInitials.value = accInitials;
          isRemembered.value = true;
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
    savedAccount,
    rememberedName,
    rememberedRole,
    rememberedInitials,
    // Fast Login modal
    isFastLoginModalOpen,
    fastLoginPassword,
    fastLoginShowPassword,
    fastLoginError,
    isFastLoginSubmitting,
    fastPasswordInputRef,
    openFastLoginModal,
    closeFastLoginModal,
    handleFastLoginSubmit,
    handleSwitchAccount,
    openForgotFromFastLogin,
    // Normal login
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
