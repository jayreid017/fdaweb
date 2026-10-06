<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService } from '../../services/authService';
import logoFda from '../../assets/logoFDA.png';
import bgLeaves from '../../assets/bg/bg-leaves.png';
import { 
  ShieldCheck, 
  Mail, 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  Landmark,
  CheckCircle2, 
  AlertCircle, 
  Clock,
  KeyRound,
  RotateCcw
} from 'lucide-vue-next';

const router = useRouter();

const email = ref<string>('');
const isSubmitting = ref<boolean>(false);
const isSuccess = ref<boolean>(false);
const errorMessage = ref<string>('');
const emailInputRef = ref<HTMLInputElement | null>(null);

// Live clock state
const currentTime = ref<string>('');
let clockTimer: any = null;

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

onMounted(() => {
  updateTime();
  clockTimer = setInterval(updateTime, 1000);
  emailInputRef.value?.focus();
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
});

async function handleSubmit() {
  errorMessage.value = '';
  const cleanEmail = email.value.trim();

  if (!cleanEmail) {
    errorMessage.value = 'Please provide your registered FDA email address.';
    emailInputRef.value?.focus();
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await AuthService.resetPassword(cleanEmail);
    if (res.success) {
      isSuccess.value = true;
    } else {
      errorMessage.value = res.message.replace(/supabase/gi, 'system');
    }
  } catch (err: any) {
    errorMessage.value = (err.message || 'Failed to dispatch reset request.').replace(/supabase/gi, 'system');
  } finally {
    isSubmitting.value = false;
  }
}

function handleRetry() {
  isSuccess.value = false;
  errorMessage.value = '';
  setTimeout(() => {
    emailInputRef.value?.focus();
  }, 50);
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
                <Sparkles class="w-3 h-3 text-[#c5a869]" /> Account Recovery
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
              Credential Recovery.<br />
              <span class="italic font-light text-[#27533b] relative">
                Seamless Continuity.
                <span class="absolute bottom-1 left-0 w-full h-[1.5px] bg-gradient-to-r from-[#c5a869] to-transparent"></span>
              </span>
            </h1>
            
            <p class="text-sm sm:text-base text-[#465b50] leading-relaxed max-w-xl font-normal">
              Self-service password recovery protocol for authorized regulatory officers and establishments under Administrative Order compliance.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-2">
            <div class="bg-[#FFFEFB]/80 backdrop-blur-xs border border-[#e1e7e2] rounded-2xl p-3.5 shadow-2xs">
              <ShieldCheck class="w-5 h-5 text-[#255239] mb-1.5" />
              <p class="text-xs font-bold text-[#142d20]">Encrypted Dispatch</p>
              <p class="text-[10px] text-[#718579] leading-tight mt-0.5">Time-Limited Single Use Tokens</p>
            </div>

            <div class="bg-[#FFFEFB]/80 backdrop-blur-xs border border-[#e1e7e2] rounded-2xl p-3.5 shadow-2xs">
              <KeyRound class="w-5 h-5 text-[#255239] mb-1.5" />
              <p class="text-xs font-bold text-[#142d20]">Zero-Trust Security</p>
              <p class="text-[10px] text-[#718579] leading-tight mt-0.5">TLS & Hash Salt Protection</p>
            </div>
          </div>
        </section>

        <!-- RIGHT COLUMN: FORGOT PASSWORD CARD -->
        <section class="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
          <div class="relative">
            <div class="absolute -top-4 -right-4 w-72 h-72 bg-[#c5a869]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-4 -left-4 w-72 h-72 bg-[#133323]/8 rounded-full blur-3xl pointer-events-none"></div>

            <div class="relative bg-[#FFFEFB]/95 backdrop-blur-xl rounded-3xl border border-[#c5a869]/30 shadow-[0_20px_60px_-15px_rgba(19,51,35,0.12)] p-7 sm:p-10 transition-all">
              
              <!-- SUCCESS STATE -->
              <div v-if="isSuccess" class="space-y-6 animate-fadeIn py-2">
                <div class="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shadow-xs">
                  <CheckCircle2 class="w-7 h-7" />
                </div>

                <div class="space-y-2">
                  <span class="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                    Dispatch Instruction Issued
                  </span>
                  <h3 class="text-2xl font-serif font-bold text-[#0f291e] tracking-tight">
                    Check Your Inbox
                  </h3>
                  <p class="text-xs sm:text-sm text-[#5f7267] leading-relaxed">
                    If <strong class="font-medium text-[#142d20]">{{ email }}</strong> matches an active officer record in the CDRHR directory, a secure recovery link has been dispatched.
                  </p>
                </div>

                <div class="p-4 rounded-2xl bg-[#f7f9f7] border border-[#dbe3dc] text-xs text-[#4a5e52] space-y-1.5">
                  <p class="font-semibold text-[#183a27]">Next Steps:</p>
                  <ul class="list-disc list-inside space-y-1 text-[11px] text-[#607567]">
                    <li>Open the recovery email received from the CDRHR Portal.</li>
                    <li>Click the authorized link within 15 minutes before expiration.</li>
                    <li>You will be directed to the secure Reset Password screen.</li>
                  </ul>
                </div>

                <div class="space-y-3 pt-2">
                  <router-link
                    to="/login"
                    class="w-full h-12 rounded-xl bg-gradient-to-r from-[#123122] via-[#1a442f] to-[#123122] text-[#f8f5eb] font-semibold text-sm tracking-wide shadow-md hover:scale-[1.01] active:scale-[0.99] border border-[#c5a869]/40 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
                  >
                    <span>Return to Sign In</span>
                    <ArrowRight class="w-4 h-4 text-[#c5a869]" />
                  </router-link>

                  <button
                    type="button"
                    @click="handleRetry"
                    class="w-full py-2.5 text-xs text-[#89733c] hover:underline cursor-pointer font-medium"
                  >
                    Resend to a different email address
                  </button>
                </div>
              </div>

              <!-- EMAIL INPUT FORM -->
              <div v-else class="animate-fadeIn">
                <div class="mb-6">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-[11px] font-bold uppercase tracking-widest text-[#937b42]">
                      Credential Recovery
                    </span>
                    <span class="inline-flex items-center gap-1 text-[11px] text-[#697d72] bg-[#f0f4f1] px-2.5 py-0.5 rounded-full border border-[#dce3de]">
                      <KeyRound class="w-3.5 h-3.5 text-[#2d5c41]" />
                      Self-Service
                    </span>
                  </div>

                  <h3 class="text-2xl sm:text-3xl font-serif font-bold text-[#0f291e] tracking-tight">
                    Forgot Password
                  </h3>
                  <p class="text-xs sm:text-sm text-[#5f7267] mt-1.5 leading-relaxed font-normal">
                    Enter your registered FDA email address. An authorized password reset link will be dispatched to your inbox.
                  </p>
                </div>

                <!-- Error Alert -->
                <div 
                  v-if="errorMessage" 
                  class="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn"
                >
                  <AlertCircle class="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span class="leading-relaxed flex-1">{{ errorMessage }}</span>
                </div>

                <form @submit.prevent="handleSubmit" class="space-y-5">
                  <div>
                    <label for="forgot-email-input" class="block text-xs font-semibold text-[#1a3828] tracking-wide mb-1.5">
                      Official FDA Email Address
                    </label>
                    <div class="relative group">
                      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d9285] group-focus-within:text-[#255239] transition-colors">
                        <Mail class="w-4 h-4 stroke-[1.8]" />
                      </div>
                      <input
                        ref="emailInputRef"
                        id="forgot-email-input"
                        type="email"
                        v-model="email"
                        placeholder="e.g. officer.name@fda.gov.ph"
                        autocomplete="email"
                        required
                        class="w-full pl-10 pr-4 py-3 bg-[#fdfcf7] hover:bg-white text-sm text-[#0f291e] placeholder:text-[#9bb0a3] rounded-xl border border-[#d6dfd8] focus:border-[#c5a869] focus:ring-2 focus:ring-[#c5a869]/25 shadow-2xs transition-all duration-150 outline-hidden font-medium"
                      />
                    </div>
                  </div>

                  <div class="pt-2">
                    <button
                      type="submit"
                      :disabled="isSubmitting"
                      class="w-full h-12 rounded-xl bg-gradient-to-r from-[#123122] via-[#1a442f] to-[#123122] text-[#f8f5eb] font-semibold text-sm tracking-wide shadow-[0_4px_16px_rgba(18,49,34,0.25)] hover:shadow-[0_6px_22px_rgba(197,168,105,0.3)] hover:scale-[1.01] active:scale-[0.99] border border-[#c5a869]/40 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                      <template v-if="isSubmitting">
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-[#c5a869]" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span class="text-[#f8f5eb]">Dispatching Link...</span>
                      </template>
                      <template v-else>
                        <span class="text-[#f8f5eb]">Request Reset Link</span>
                        <ArrowRight class="w-4 h-4 text-[#c5a869] group-hover:translate-x-0.5 transition-transform" />
                      </template>
                    </button>
                  </div>
                </form>

                <div class="mt-6 pt-5 border-t border-[#edf1ee] flex items-center justify-between text-xs text-[#6e8275]">
                  <router-link
                    to="/login"
                    class="inline-flex items-center gap-1.5 text-[#183a28] hover:text-[#c5a869] font-medium transition-colors cursor-pointer group"
                  >
                    <ArrowLeft class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Return to Sign In</span>
                  </router-link>
                  <span class="text-[11px] text-[#96a99e]">FDA CDRHR Support</span>
                </div>
              </div>

              <!-- Bottom Security Notice -->
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
