<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService } from '../../../services/authService';
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
  KeyRound, 
  Mail,
  User,
  BadgeCheck,
  RotateCcw
} from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'toast', type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string): void;
}>();

const router = useRouter();

// Form State
const currentPassword = ref<string>('');
const newPassword = ref<string>('');
const confirmPassword = ref<string>('');
const showCurrentPassword = ref<boolean>(false);
const showPassword = ref<boolean>(false);
const showConfirmPassword = ref<boolean>(false);
const isCapsLockOn = ref<boolean>(false);
const signOutAfterUpdate = ref<boolean>(false);

const isSubmitting = ref<boolean>(false);
const errorMessage = ref<string>('');
const successMessage = ref<string>('');
const countdown = ref<number>(3);
let redirectTimer: any = null;

// Email dispatch state
const isDispatchingEmail = ref<boolean>(false);
const emailDispatchSuccess = ref<string>('');
const emailDispatchError = ref<string>('');

const currentUser = computed(() => AuthService.currentUser.value);

// Validation
const hasCurrentPassword = computed(() => currentPassword.value.trim().length > 0);
const hasMinLength = computed(() => newPassword.value.length >= 8);
const hasNumberOrSymbol = computed(() => /[0-9!@#$%^&*(),.?":{}|<>]/.test(newPassword.value));
const passwordsMatch = computed(() => {
  return newPassword.value.length > 0 && newPassword.value === confirmPassword.value;
});
const isSameAsCurrent = computed(() => {
  return hasCurrentPassword.value && newPassword.value.trim().length > 0 && currentPassword.value.trim() === newPassword.value.trim();
});
const isFormValid = computed(() => hasCurrentPassword.value && hasMinLength.value && passwordsMatch.value && !isSameAsCurrent.value);

function checkCapsLock(event: KeyboardEvent) {
  isCapsLockOn.value = event.getModifierState('CapsLock');
}

async function handlePasswordUpdate() {
  errorMessage.value = '';
  successMessage.value = '';

  const cleanCurrent = currentPassword.value.trim();
  const cleanNew = newPassword.value.trim();
  const cleanConfirm = confirmPassword.value.trim();

  if (!cleanCurrent) {
    errorMessage.value = 'Please enter your current password.';
    return;
  }
  if (!cleanNew) {
    errorMessage.value = 'Please enter your new password.';
    return;
  }
  if (cleanNew.length < 8) {
    errorMessage.value = 'New password must be at least 8 characters.';
    return;
  }
  if (cleanCurrent === cleanNew) {
    errorMessage.value = 'New password cannot be the same as your current password.';
    return;
  }
  if (cleanNew !== cleanConfirm) {
    errorMessage.value = 'New passwords do not match.';
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await AuthService.updateAuthenticatedPassword(cleanCurrent, cleanNew, signOutAfterUpdate.value);
    if (res.success) {
      successMessage.value = res.message;
      emit('toast', 'success', 'Password Updated', 'Your security credentials have been updated successfully.');

      currentPassword.value = '';
      newPassword.value = '';
      confirmPassword.value = '';

      if (signOutAfterUpdate.value) {
        redirectTimer = setInterval(() => {
          countdown.value--;
          if (countdown.value <= 0) {
            clearInterval(redirectTimer);
            router.push('/login');
          }
        }, 1000);
      }
    } else {
      errorMessage.value = res.message;
      emit('toast', 'error', 'Update Failed', res.message);
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'An unexpected error occurred.';
    emit('toast', 'error', 'Update Error', errorMessage.value);
  } finally {
    isSubmitting.value = false;
  }
}

async function handleDispatchEmail() {
  const email = currentUser.value?.email;
  if (!email) return;

  emailDispatchError.value = '';
  emailDispatchSuccess.value = '';
  isDispatchingEmail.value = true;

  try {
    const res = await AuthService.resetPassword(email);
    if (res.success) {
      emailDispatchSuccess.value = `Authorized reset link dispatched to ${email}. Check your inbox.`;
      emit('toast', 'success', 'Reset Link Dispatched', `Instructions sent to ${email}`);
    } else {
      emailDispatchError.value = res.message;
    }
  } catch (err: any) {
    emailDispatchError.value = err.message || 'Failed to dispatch email link.';
  } finally {
    isDispatchingEmail.value = false;
  }
}
</script>

<template>
  <div class="space-y-7">
    <!-- Header banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <div class="w-2 h-2 rounded-full bg-[#c5a869] shadow-[0_0_8px_#c5a869]"></div>
          <p class="text-xs font-semibold tracking-[0.16em] text-[#a47c3b] uppercase">
            FDA REGULATORY PORTAL • ACCOUNT SECURITY
          </p>
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-[#0f241a] tracking-tight leading-[1.15] mb-2 flex items-center gap-3">
          <span>Settings & Reset Password</span>
        </h1>
        <p class="text-xs sm:text-sm text-[#667a6e] font-normal max-w-2xl">
          Manage your FDA regulatory officer security credentials and cryptographic access password under Administrative Order compliance.
        </p>
      </div>

      <div class="flex items-center gap-2.5 self-start sm:self-auto">
        <button
          type="button"
          @click="emit('back')"
          class="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-[#f5f3ec] hover:bg-[#eae6d9] active:bg-[#ded9cb] text-[#1c2e23] text-xs sm:text-sm font-semibold rounded-2xl border border-[#dcd6c8] transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Back to Establishments</span>
        </button>
      </div>
    </div>

    <!-- Main Grid Content -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- LEFT COLUMN: Officer Identity Card & Compliance -->
      <div class="lg:col-span-5 space-y-6">
        <!-- Officer Badge Summary Card -->
        <div class="bg-[#FFFEFB] border border-[#c5a869]/30 rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_-10px_rgba(19,51,35,0.08)] relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-[#c5a869]/10 rounded-full blur-2xl pointer-events-none"></div>

          <div class="flex items-start justify-between mb-5">
            <div class="flex items-center gap-3.5">
              <div class="w-14 h-14 rounded-2xl bg-[#1b3829] border-2 border-[#c5a869] text-[#f3ebd9] flex items-center justify-center font-bold text-lg shadow-sm">
                {{ currentUser?.avatarInitials || 'JD' }}
              </div>
              <div>
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#133323] text-[#f3ebd9] border border-[#c5a869]/30 mb-1">
                  <BadgeCheck class="w-3 h-3 text-[#c5a869]" /> Active Session
                </span>
                <h3 class="text-base sm:text-lg font-serif font-bold text-[#0f241a] leading-tight">
                  {{ currentUser?.name || 'FDA Regulatory Officer' }}
                </h3>
                <p class="text-xs text-[#55695e] font-medium mt-0.5">
                  {{ currentUser?.role || 'Regulatory Officer' }}
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-3 pt-3 border-t border-[#edf1ee] text-xs">
            <div class="flex items-center justify-between">
              <span class="text-[#718579]">Official Email:</span>
              <span class="font-semibold text-[#183927]">{{ currentUser?.email || 'officer@fda.gov.ph' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#718579]">Division / Center:</span>
              <span class="font-semibold text-[#183927]">{{ currentUser?.division || 'CDRHR Center' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#718579]">Regional Jurisdiction:</span>
              <span class="font-semibold text-[#183927]">{{ currentUser?.region || 'CAR' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#718579]">Badge Identifier:</span>
              <span class="font-mono text-[11px] font-bold text-[#c5a869] bg-[#1b3829] px-2 py-0.5 rounded-md">
                {{ currentUser?.badgeNumber || 'FDA-CAR-OFFICER' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Security & Compliance Guidelines Card -->
        <div class="bg-[#FFFEFB]/80 border border-[#e1e7e2] rounded-3xl p-6 text-xs text-[#4e6255] space-y-3 shadow-2xs">
          <div class="flex items-center gap-2 text-[#183927] font-semibold text-sm">
            <ShieldCheck class="w-4.5 h-4.5 text-[#2d5c41]" />
            <span>Administrative Security Protocol</span>
          </div>
          <p class="text-[11px] leading-relaxed text-[#607467]">
            Under FDA Information Security Policy (AO 2024-0019) and RA 10175, all officers managing establishment credentials must observe the following:
          </p>
          <ul class="list-disc list-inside space-y-1.5 text-[11px] text-[#55695e]">
            <li>Passwords must contain at least 8 characters.</li>
            <li>Do not reuse previous regulatory portal passwords.</li>
            <li>Credentials are cryptographically salted and hashed via Supabase TLS.</li>
            <li>Never disclose badge credentials or passwords to third parties.</li>
          </ul>
        </div>

        <!-- Dispatch Email Card -->
        <div class="bg-[#f7f9f7] border border-[#dbe3dc] rounded-3xl p-6 text-xs space-y-3">
          <div class="flex items-center gap-2 text-[#183927] font-semibold">
            <Mail class="w-4 h-4 text-[#c5a869]" />
            <span>Prefer a Password Reset Email?</span>
          </div>
          <p class="text-[11px] text-[#657a6d] leading-relaxed">
            Alternatively, dispatch an authorized single-use recovery link directly to your official FDA inbox.
          </p>
          
          <div v-if="emailDispatchSuccess" class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
            <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{{ emailDispatchSuccess }}</span>
          </div>

          <div v-if="emailDispatchError" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-2">
            <AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
            <span>{{ emailDispatchError }}</span>
          </div>

          <button
            type="button"
            @click="handleDispatchEmail"
            :disabled="isDispatchingEmail"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFFEFB] hover:bg-white text-xs font-semibold text-[#183927] border border-[#c5a869]/50 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60"
          >
            <RotateCcw class="w-3.5 h-3.5 text-[#c5a869]" :class="{ 'animate-spin': isDispatchingEmail }" />
            <span>{{ isDispatchingEmail ? 'Dispatching Link...' : 'Send Reset Link to Email' }}</span>
          </button>
        </div>
      </div>

      <!-- RIGHT COLUMN: Direct Reset Password Form -->
      <div class="lg:col-span-7">
        <div class="bg-[#FFFEFB] border border-[#c5a869]/30 rounded-3xl p-7 sm:p-9 shadow-[0_20px_50px_-15px_rgba(19,51,35,0.1)] relative">
          
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-bold uppercase tracking-widest text-[#937b42]">
                Credential Management
              </span>
              <span class="inline-flex items-center gap-1 text-[11px] text-[#697d72] bg-[#f0f4f1] px-2.5 py-0.5 rounded-full border border-[#dce3de]">
                <KeyRound class="w-3.5 h-3.5 text-[#2d5c41]" />
                Direct Update
              </span>
            </div>

            <h2 class="text-2xl sm:text-3xl font-serif font-bold text-[#0f291e] tracking-tight">
              Change Security Password
            </h2>
            <p class="text-xs sm:text-sm text-[#5f7267] mt-1.5 leading-relaxed font-normal">
              Enter your current password to verify your identity, followed by your new regulatory account password.
            </p>
          </div>

          <!-- Success Alert -->
          <div 
            v-if="successMessage" 
            class="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2 animate-fadeIn"
          >
            <div class="flex items-center gap-2 font-bold text-emerald-800">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Password Updated Successfully!</span>
            </div>
            <p class="text-[11px] text-emerald-700 leading-relaxed">
              {{ successMessage }}
            </p>
            <div v-if="signOutAfterUpdate" class="text-[11px] text-emerald-900 font-medium">
              Redirecting to Sign In in <span class="font-bold font-mono">{{ countdown }}s</span>...
            </div>
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

          <!-- Password Form -->
          <form @submit.prevent="handlePasswordUpdate" class="space-y-5">
            
            <!-- Current Password -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="settings-current-password" class="block text-xs font-semibold text-[#1a3828] tracking-wide">
                  Current Password
                </label>
                <span class="text-[11px] text-[#718579]">Identity Verification</span>
              </div>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d9285] group-focus-within:text-[#255239] transition-colors">
                  <KeyRound class="w-4 h-4 stroke-[1.8]" />
                </div>
                <input
                  id="settings-current-password"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  v-model="currentPassword"
                  @keyup="checkCapsLock"
                  placeholder="Enter your current password"
                  autocomplete="current-password"
                  required
                  class="w-full pl-10 pr-11 py-3 bg-[#fdfcf7] hover:bg-white text-sm text-[#0f291e] placeholder:text-[#9bb0a3] rounded-xl border border-[#d6dfd8] focus:border-[#c5a869] focus:ring-2 focus:ring-[#c5a869]/25 shadow-2xs transition-all duration-150 outline-hidden font-medium"
                />
                <button
                  type="button"
                  @click="showCurrentPassword = !showCurrentPassword"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7d9285] hover:text-[#1a3828] cursor-pointer transition-colors"
                  :title="showCurrentPassword ? 'Hide current password' : 'Show current password'"
                >
                  <EyeOff v-if="showCurrentPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- New Password -->
            <div>
              <label for="settings-new-password" class="block text-xs font-semibold text-[#1a3828] tracking-wide mb-1.5">
                New Security Password
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d9285] group-focus-within:text-[#255239] transition-colors">
                  <Lock class="w-4 h-4 stroke-[1.8]" />
                </div>
                <input
                  id="settings-new-password"
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
              <label for="settings-confirm-password" class="block text-xs font-semibold text-[#1a3828] tracking-wide mb-1.5">
                Confirm New Password
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d9285] group-focus-within:text-[#255239] transition-colors">
                  <Lock class="w-4 h-4 stroke-[1.8]" />
                </div>
                <input
                  id="settings-confirm-password"
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

            <!-- Same as current password alert -->
            <div 
              v-if="isSameAsCurrent"
              class="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2 animate-fadeIn"
            >
              <AlertCircle class="w-4 h-4 shrink-0 text-amber-600" />
              <span>New password cannot be the same as your current password.</span>
            </div>

            <!-- Requirements validation badges -->
            <div class="p-3.5 rounded-2xl bg-[#f7f9f7] border border-[#e2e7e2] space-y-2">
              <p class="text-[11px] font-semibold text-[#405448]">Security Verification Criteria:</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div class="flex items-center gap-1.5" :class="hasCurrentPassword ? 'text-emerald-700 font-medium' : 'text-[#7e9085]'">
                  <CheckCircle2 class="w-3.5 h-3.5" :class="hasCurrentPassword ? 'text-emerald-600' : 'text-[#a2b3a8]'" />
                  <span>Current password entered</span>
                </div>
                <div class="flex items-center gap-1.5" :class="hasMinLength ? 'text-emerald-700 font-medium' : 'text-[#7e9085]'">
                  <CheckCircle2 class="w-3.5 h-3.5" :class="hasMinLength ? 'text-emerald-600' : 'text-[#a2b3a8]'" />
                  <span>At least 8 characters</span>
                </div>
                <div class="flex items-center gap-1.5" :class="passwordsMatch ? 'text-emerald-700 font-medium' : 'text-[#7e9085]'">
                  <CheckCircle2 class="w-3.5 h-3.5" :class="passwordsMatch ? 'text-emerald-600' : 'text-[#a2b3a8]'" />
                  <span>New passwords match</span>
                </div>
                <div class="flex items-center gap-1.5" :class="hasNumberOrSymbol ? 'text-emerald-700 font-medium' : 'text-[#7e9085]'">
                  <CheckCircle2 class="w-3.5 h-3.5" :class="hasNumberOrSymbol ? 'text-emerald-600' : 'text-[#a2b3a8]'" />
                  <span>Contains number or symbol</span>
                </div>
              </div>
            </div>

            <!-- Sign out option checkbox -->
            <div class="flex items-center gap-2.5 pt-1">
              <input
                id="sign-out-after-update"
                type="checkbox"
                v-model="signOutAfterUpdate"
                class="w-4 h-4 rounded text-[#1b3829] border-[#d6dfd8] focus:ring-[#c5a869] cursor-pointer"
              />
              <label for="sign-out-after-update" class="text-xs text-[#405448] font-medium cursor-pointer select-none">
                Sign out of portal after updating password (recommended for shared terminals)
              </label>
            </div>

            <!-- Submit Action -->
            <div class="pt-2">
              <button
                type="submit"
                :disabled="isSubmitting || !isFormValid"
                class="w-full h-12 rounded-xl bg-gradient-to-r from-[#123122] via-[#1a442f] to-[#123122] text-[#f8f5eb] font-semibold text-sm tracking-wide shadow-[0_4px_16px_rgba(18,49,34,0.25)] hover:shadow-[0_6px_22px_rgba(197,168,105,0.3)] hover:scale-[1.01] active:scale-[0.99] border border-[#c5a869]/40 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <template v-if="isSubmitting">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-[#c5a869]" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating Security Password...</span>
                </template>
                <template v-else>
                  <KeyRound class="w-4 h-4 text-[#c5a869]" />
                  <span>Update Password Now</span>
                  <ArrowRight class="w-4 h-4 text-[#c5a869] group-hover:translate-x-0.5 transition-transform" />
                </template>
              </button>
            </div>
          </form>

        </div>
      </div>

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
