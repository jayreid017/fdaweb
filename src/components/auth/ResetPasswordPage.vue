<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService } from '../../services/authService';
import logoFda from '../../assets/logoFDA.png';
import bgLeaves from '../../assets/bg/bg-leaves.png';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  KeyRound,
  RotateCcw
} from 'lucide-vue-next';

const router = useRouter();

// State
const isVerifying = ref<boolean>(true);
const verificationError = ref<string>('');
const isSubmitting = ref<boolean>(false);
const isSuccess = ref<boolean>(false);
const errorMessage = ref<string>('');

// Password fields
const newPassword = ref<string>('');
const confirmPassword = ref<string>('');
const showPassword = ref<boolean>(false);
const showConfirmPassword = ref<boolean>(false);
const isCapsLockOn = ref<boolean>(false);

// Live clock & redirect
const currentTime = ref<string>('');
let clockTimer: any = null;
let redirectTimer: any = null;
const countdown = ref<number>(3);

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

function checkCapsLock(event: KeyboardEvent) {
  isCapsLockOn.value = event.getModifierState('CapsLock');
}

// Password validation criteria
const hasMinLength = computed(() => newPassword.value.length >= 8);
const passwordsMatch = computed(() => {
  return newPassword.value.length > 0 && newPassword.value === confirmPassword.value;
});

// Verify recovery token / session on mount
onMounted(async () => {
  updateTime();
  clockTimer = setInterval(updateTime, 1000);

  try {
    const result = await AuthService.checkRecoveryState();
    if (!result.isValid) {
      verificationError.value = result.error || 'Password reset link is invalid or has expired.';
    }
  } catch (err: any) {
    verificationError.value = err.message || 'Password reset link is invalid or has expired.';
  } finally {
    isVerifying.value = false;
  }
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
  if (redirectTimer) clearInterval(redirectTimer);
});

// Handle password update submission
async function handleResetSubmit() {
  errorMessage.value = '';

  if (!newPassword.value.trim()) {
    errorMessage.value = 'Please enter your new password.';
    return;
  }
  if (newPassword.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters.';
    return;
  }
  if (!confirmPassword.value.trim()) {
    errorMessage.value = 'Please confirm your new password.';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.';
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await AuthService.updatePassword(newPassword.value);
    if (res.success) {
      isSuccess.value = true;

      // Short delay countdown then redirect to /login
      redirectTimer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(redirectTimer);
          router.push('/login');
        }
      }, 1000);
    } else {
      errorMessage.value = res.message.replace(/supabase/gi, 'system');
    }
  } catch (err: any) {
    errorMessage.value = (err.message || 'An error occurred while updating your password.').replace(/supabase/gi, 'system');
  } finally {
    isSubmitting.value = false;
  }
}

async function goToLogin() {
  if (redirectTimer) clearInterval(redirectTimer);
  AuthService.setRecoveryMode(false);
  await AuthService.logout();
  router.push('/login');
}

async function requestNewLink() {
  if (redirectTimer) clearInterval(redirectTimer);
  AuthService.setRecoveryMode(false);
  await AuthService.logout();
  router.push('/forgot-password');
}
</script>

<template>
  <div class="min-h-screen w-full relative flex items-center justify-center bg-[#F7F9F6] text-[#172a1f] overflow-x-hidden selection:bg-[#c5a869]/20 selection:text-[#0f291e]">
    <!-- Ambient Botanical Leaves Watermark -->
    <div 
      class="fixed inset-0 pointer-events-none opacity-40 bg-cover bg-center bg-no-repeat z-0"
      :style="{ backgroundImage: `url(${bgLeaves})` }"
    ></div>

    <!-- Soft Radial Atmospheric Glows -->
    <div class="fixed top-0 left-1/4 w-96 h-96 rounded-full bg-[#c5a869]/5 blur-3xl pointer-events-none z-0"></div>
    <div class="fixed bottom-0 right-1/4 w-[32rem] h-[32rem] rounded-full bg-[#133323]/5 blur-3xl pointer-events-none z-0"></div>

    <!-- Main Container -->
    <div class="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col justify-between min-h-screen">
      
      <!-- TOP STATUS & GOVERNMENT BAR -->
      <header class="flex flex-col sm:flex-row items-center justify-between gap-3 pb-6 border-b border-[#133323]/8">
        <div class="flex items-center gap-2.5">
          <div class="w-2 h-2 rounded-full bg-[#c5a869] shadow-[0_0_8px_#c5a869]"></div>
          <span class="text-[11px] font-semibold tracking-[0.2em] text-[#55695e] uppercase">
            Republic of the Philippines • Department of Health
          </span>
        </div>

        <div class="flex items-center gap-4 text-xs text-[#55695e]">
          <router-link 
            to="/" 
            class="flex items-center gap-2 bg-[#FFFEFB] border border-[#e2e7e2] hover:border-[#c5a869] px-3 py-1 rounded-full shadow-2xs transition-colors group cursor-pointer"
            title="Go to Registry"
          >
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span class="text-[11px] font-medium text-[#2d4d3b] group-hover:text-[#133323]">CDRHR Online Gateway</span>
          </router-link>

          <div class="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-[#718579]">
            <Clock class="w-3.5 h-3.5 text-[#c5a869]" />
            <span>{{ currentTime || 'PHT Active' }}</span>
          </div>
        </div>
      </header>

      <!-- CENTER CONTENT -->
      <main class="my-auto py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        
        <!-- LEFT COLUMN: EDITORIAL BRAND SHOWCASE -->
        <section class="lg:col-span-6 flex flex-col justify-center space-y-8 pr-0 lg:pr-6">
          <router-link to="/login" class="flex items-center gap-4 group cursor-pointer select-none">
            <div class="relative">
              <div class="absolute -inset-1 rounded-full bg-gradient-to-r from-[#c5a869]/20 to-[#133323]/20 blur-md opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-[#FFFEFB] border-2 border-[#c5a869]/60 shadow-[0_8px_24px_rgba(197,168,105,0.15)] flex items-center justify-center transition-transform group-hover:scale-102">
                <img 
                  :src="logoFda" 
                  alt="Philippine Food and Drug Administration CAR Seal" 
                  class="w-full h-full object-contain drop-shadow-xs"
                />
              </div>
            </div>

            <div class="flex flex-col">
              <span class="inline-flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#133323] text-[#f3ebd9] border border-[#c5a869]/30">
                <Sparkles class="w-3 h-3 text-[#c5a869]" /> Credential Security
              </span>
              <h2 class="text-xl sm:text-2xl font-serif font-bold text-[#0f291e] tracking-tight mt-1.5 leading-tight group-hover:text-[#18442f] transition-colors">
                Food and Drug Administration
              </h2>
              <p class="text-xs font-medium text-[#65796d]">
                Cordillera Administrative Region (CAR) • CDRHR
              </p>
            </div>
          </router-link>

          <div class="space-y-4">
            <h1 class="text-4xl sm:text-5xl lg:text-[3.2rem] font-serif font-semibold text-[#0f291e] tracking-tight leading-[1.12]">
              Secure Access.<br />
              <span class="italic font-light text-[#27533b] relative">
                Protected Identity.
                <span class="absolute bottom-1 left-0 w-full h-[1.5px] bg-gradient-to-r from-[#c5a869] to-transparent"></span>
              </span>
            </h1>
            
            <p class="text-sm sm:text-base text-[#465b50] leading-relaxed max-w-xl font-normal">
              Authorize updated cryptographic security credentials for official regulatory oversight of medical devices and radiation health facilities.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-2">
            <div class="bg-[#FFFEFB]/80 backdrop-blur-xs border border-[#e1e7e2] rounded-2xl p-3.5 shadow-2xs">
              <ShieldCheck class="w-5 h-5 text-[#255239] mb-1.5" />
              <p class="text-xs font-bold text-[#142d20]">Mandatory RA 9711</p>
              <p class="text-[10px] text-[#718579] leading-tight mt-0.5">Zero-Trust Officer Verification</p>
            </div>

            <div class="bg-[#FFFEFB]/80 backdrop-blur-xs border border-[#e1e7e2] rounded-2xl p-3.5 shadow-2xs">
              <KeyRound class="w-5 h-5 text-[#255239] mb-1.5" />
              <p class="text-xs font-bold text-[#142d20]">End-to-End Cryptography</p>
              <p class="text-[10px] text-[#718579] leading-tight mt-0.5">TLS & Hash Salt Protection</p>
            </div>
          </div>
        </section>

        <!-- RIGHT COLUMN: RESET PASSWORD CARD -->
        <section class="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
          <div class="relative">
            <div class="absolute -top-4 -right-4 w-72 h-72 bg-[#c5a869]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-4 -left-4 w-72 h-72 bg-[#133323]/8 rounded-full blur-3xl pointer-events-none"></div>

            <div class="relative bg-[#FFFEFB]/95 backdrop-blur-xl rounded-3xl border border-[#c5a869]/30 shadow-[0_20px_60px_-15px_rgba(19,51,35,0.12)] p-7 sm:p-10 transition-all">
              
              <!-- STATE 1: INITIAL VERIFICATION LOADING -->
              <div v-if="isVerifying" class="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
                <div class="relative w-12 h-12">
                  <div class="absolute inset-0 rounded-full border-2 border-[#c5a869]/20 border-t-[#133323] animate-spin"></div>
                </div>
                <div class="space-y-1">
                  <h4 class="text-base font-semibold text-[#0f291e]">Verifying Recovery Link</h4>
                  <p class="text-xs text-[#5f7267]">Checking security authorization tokens from your request link...</p>
                </div>
              </div>

              <!-- STATE 2: INVALID / EXPIRED LINK ERROR -->
              <div v-else-if="verificationError" class="space-y-6 animate-fadeIn">
                <div class="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <AlertCircle class="w-6 h-6" />
                </div>

                <div class="space-y-2">
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-100 text-amber-800 border border-amber-300">
                    Security Notice
                  </div>
                  <h3 class="text-2xl font-serif font-bold text-[#0f291e] tracking-tight">
                    Reset Link Expired or Invalid
                  </h3>
                  <p class="text-xs sm:text-sm text-[#5f7267] leading-relaxed">
                    {{ verificationError }}
                  </p>
                </div>

                <div class="p-4 rounded-2xl bg-[#f7f9f7] border border-[#dbe3dc] text-xs text-[#4a5e52] space-y-1.5">
                  <p class="font-semibold text-[#183a27]">Why did this happen?</p>
                  <ul class="list-disc list-inside space-y-1 text-[11px] text-[#607567]">
                    <li>Password reset links expire shortly after dispatch for security compliance.</li>
                    <li>Links are strictly single-use and become invalid once opened or processed.</li>
                    <li>Direct visits to this URL without an active recovery link require dispatching a new one.</li>
                  </ul>
                </div>

                <div class="space-y-3 pt-2">
                  <button
                    type="button"
                    @click="requestNewLink"
                    class="w-full h-12 rounded-xl bg-gradient-to-r from-[#123122] via-[#1a442f] to-[#123122] text-[#f8f5eb] font-semibold text-xs sm:text-sm tracking-wide shadow-md hover:scale-[1.01] active:scale-[0.99] border border-[#c5a869]/40 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
                  >
                    <RotateCcw class="w-4 h-4 text-[#c5a869]" />
                    <span>Request a new reset link</span>
                  </button>

                  <button
                    type="button"
                    @click="goToLogin"
                    class="w-full py-3 rounded-xl bg-[#f5f8f5] hover:bg-[#edf3ee] border border-[#d3ded5] text-xs font-semibold text-[#183927] flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <ArrowLeft class="w-3.5 h-3.5" />
                    <span>Return to Sign In</span>
                  </button>
                </div>
              </div>

              <!-- STATE 3: SUCCESS STATE -->
              <div v-else-if="isSuccess" class="space-y-6 text-center py-4 animate-fadeIn">
                <div class="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 class="w-7 h-7" />
                </div>

                <div class="space-y-2">
                  <span class="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                    Security Update Complete
                  </span>
                  <h3 class="text-2xl font-serif font-bold text-[#0f291e] tracking-tight">
                    Password updated successfully!
                  </h3>
                  <p class="text-xs sm:text-sm text-[#5f7267] leading-relaxed max-w-sm mx-auto">
                    You can now sign in with your new password.
                  </p>
                </div>

                <div class="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800">
                  Redirecting to Sign In in <span class="font-bold text-emerald-950 font-mono">{{ countdown }}s</span>...
                </div>

                <button
                  type="button"
                  @click="goToLogin"
                  class="w-full h-12 rounded-xl bg-gradient-to-r from-[#123122] via-[#1a442f] to-[#123122] text-[#f8f5eb] font-semibold text-sm tracking-wide shadow-md hover:scale-[1.01] active:scale-[0.99] border border-[#c5a869]/40 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
                >
                  <span>Proceed to Sign In Now</span>
                  <ArrowRight class="w-4 h-4 text-[#c5a869]" />
                </button>
              </div>

              <!-- STATE 4: RESET PASSWORD FORM -->
              <div v-else class="animate-fadeIn">
                <!-- Card Header -->
                <div class="mb-6">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-[11px] font-bold uppercase tracking-widest text-[#937b42]">
                      Credential Security
                    </span>
                    <span class="inline-flex items-center gap-1 text-[11px] text-[#697d72] bg-[#f0f4f1] px-2.5 py-0.5 rounded-full border border-[#dce3de]">
                      <KeyRound class="w-3.5 h-3.5 text-[#2d5c41]" />
                      Session Active
                    </span>
                  </div>

                  <h3 class="text-2xl sm:text-3xl font-serif font-bold text-[#0f291e] tracking-tight">
                    Reset Password
                  </h3>
                  <p class="text-xs sm:text-sm text-[#5f7267] mt-1.5 leading-relaxed font-normal">
                    Create a new password for your FDA Car Portal account.
                  </p>
                </div>

                <!-- Error Alert -->
                <div 
                  v-if="errorMessage" 
                  class="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn"
                >
                  <AlertCircle class="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span class="leading-relaxed flex-1 font-medium">{{ errorMessage }}</span>
                </div>

                <!-- Caps Lock Alert -->
                <div 
                  v-if="isCapsLockOn"
                  class="mb-4 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2"
                >
                  <span class="font-bold">CAPS LOCK is active</span>
                </div>

                <!-- Form -->
                <form @submit.prevent="handleResetSubmit" class="space-y-4 sm:space-y-5">
                  
                  <!-- New Password -->
                  <div>
                    <label for="new-password-input" class="block text-xs font-semibold text-[#1a3828] tracking-wide mb-1.5">
                      New Password
                    </label>
                    <div class="relative group">
                      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d9285] group-focus-within:text-[#255239] transition-colors">
                        <Lock class="w-4 h-4 stroke-[1.8]" />
                      </div>
                      <input
                        id="new-password-input"
                        :type="showPassword ? 'text' : 'password'"
                        v-model="newPassword"
                        @keyup="checkCapsLock"
                        placeholder="••••••••••••••••"
                        autocomplete="new-password"
                        required
                        class="w-full pl-10 pr-11 py-3 bg-[#fdfcf7] hover:bg-white text-sm text-[#0f291e] placeholder:text-[#9bb0a3] rounded-xl border border-[#d6dfd8] focus:border-[#c5a869] focus:ring-2 focus:ring-[#c5a869]/25 shadow-2xs transition-all duration-150 outline-hidden font-medium"
                      />
                      <button
                        type="button"
                        @click="showPassword = !showPassword"
                        class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7d9285] hover:text-[#1a3828] cursor-pointer transition-colors"
                        :title="showPassword ? 'Hide password' : 'Show password'"
                      >
                        <EyeOff v-if="showPassword" class="w-4 h-4" />
                        <Eye v-else class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <!-- Confirm New Password -->
                  <div>
                    <label for="confirm-password-input" class="block text-xs font-semibold text-[#1a3828] tracking-wide mb-1.5">
                      Confirm New Password
                    </label>
                    <div class="relative group">
                      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d9285] group-focus-within:text-[#255239] transition-colors">
                        <Lock class="w-4 h-4 stroke-[1.8]" />
                      </div>
                      <input
                        id="confirm-password-input"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        v-model="confirmPassword"
                        @keyup="checkCapsLock"
                        placeholder="••••••••••••••••"
                        autocomplete="new-password"
                        required
                        class="w-full pl-10 pr-11 py-3 bg-[#fdfcf7] hover:bg-white text-sm text-[#0f291e] placeholder:text-[#9bb0a3] rounded-xl border border-[#d6dfd8] focus:border-[#c5a869] focus:ring-2 focus:ring-[#c5a869]/25 shadow-2xs transition-all duration-150 outline-hidden font-medium"
                      />
                      <button
                        type="button"
                        @click="showConfirmPassword = !showConfirmPassword"
                        class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7d9285] hover:text-[#1a3828] cursor-pointer transition-colors"
                        :title="showConfirmPassword ? 'Hide password' : 'Show password'"
                      >
                        <EyeOff v-if="showConfirmPassword" class="w-4 h-4" />
                        <Eye v-else class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <!-- Requirements helper badges -->
                  <div class="p-3 rounded-xl bg-[#f7f9f7] border border-[#e2e7e2] space-y-1.5">
                    <p class="text-[11px] font-semibold text-[#405448]">Security Requirements:</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                      <div class="flex items-center gap-1.5" :class="hasMinLength ? 'text-emerald-700 font-medium' : 'text-[#7e9085]'">
                        <CheckCircle2 class="w-3.5 h-3.5" :class="hasMinLength ? 'text-emerald-600' : 'text-[#a2b3a8]'" />
                        <span>At least 8 characters</span>
                      </div>
                      <div class="flex items-center gap-1.5" :class="passwordsMatch ? 'text-emerald-700 font-medium' : 'text-[#7e9085]'">
                        <CheckCircle2 class="w-3.5 h-3.5" :class="passwordsMatch ? 'text-emerald-600' : 'text-[#a2b3a8]'" />
                        <span>Passwords match</span>
                      </div>
                    </div>
                  </div>

                  <!-- Submit Action Button -->
                  <div class="pt-2">
                    <button
                      type="submit"
                      :disabled="isSubmitting"
                      class="w-full h-12 rounded-xl bg-gradient-to-r from-[#123122] via-[#1a442f] to-[#123122] text-[#f8f5eb] font-semibold text-sm tracking-wide shadow-[0_4px_16px_rgba(18,49,34,0.25)] hover:shadow-[0_6px_22px_rgba(197,168,105,0.3)] hover:scale-[1.01] active:scale-[0.99] border border-[#c5a869]/40 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                      <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none"></div>

                      <template v-if="isSubmitting">
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-[#c5a869]" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span class="text-[#f8f5eb]">Updating Password...</span>
                      </template>
                      <template v-else>
                        <span class="text-[#f8f5eb]">Update Password</span>
                        <ArrowRight class="w-4 h-4 text-[#c5a869] group-hover:translate-x-0.5 transition-transform" />
                      </template>
                    </button>
                  </div>
                </form>

                <!-- Back to Sign In Link -->
                <div class="mt-6 pt-5 border-t border-[#edf1ee] flex items-center justify-between text-xs text-[#6e8275]">
                  <button
                    type="button"
                    @click="goToLogin"
                    class="inline-flex items-center gap-1.5 text-[#183a28] hover:text-[#c5a869] font-medium transition-colors cursor-pointer group"
                  >
                    <ArrowLeft class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Return to Sign In</span>
                  </button>
                  <span class="text-[11px] text-[#96a99e]">FDA CDRHR Security</span>
                </div>
              </div>

              <!-- Security Notice -->
              <div class="mt-6 pt-5 border-t border-[#edf1ee] flex items-center justify-between text-[11px] text-[#788c80]">
                <div class="flex items-center gap-1.5">
                  <ShieldCheck class="w-3.5 h-3.5 text-[#306245]" />
                  <span>Official Government System</span>
                </div>
                <span class="text-[#96a99e]">v2.4 CDRHR</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      <!-- FOOTER COMPLIANCE & LEGAL ACCENTS -->
      <footer class="pt-6 border-t border-[#133323]/8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#63766c]">
        <div class="flex items-center gap-2 text-center md:text-left">
          <span>&copy; {{ new Date().getFullYear() }} Food and Drug Administration Philippines. All Rights Reserved.</span>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-5 text-[11px]">
          <span class="hover:text-[#133323] cursor-pointer transition-colors">Privacy Policy</span>
          <span>•</span>
          <span class="hover:text-[#133323] cursor-pointer transition-colors">Terms of Regulation</span>
          <span>•</span>
          <span class="hover:text-[#133323] cursor-pointer transition-colors">Help Desk (CAR)</span>
          <span>•</span>
          <span class="text-[#c5a869] font-medium">RA 10175 Compliance</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>
