<script setup lang="ts">
import { useLogin } from './useLogin';
import logoFda from '../../assets/logoFDA.png';
import bgLeaves from '../../assets/bg/bg-leaves.png';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Landmark, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  X, 
  Clock 
} from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'login-success'): void;
}>();

// All auth states, handlers, and logic separated cleanly in useLogin.ts
const {
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
} = useLogin(emit);
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
        <!-- Republic of the Philippines Seal Title -->
        <div class="flex items-center gap-2.5">
          <div class="w-2 h-2 rounded-full bg-[#c5a869] shadow-[0_0_8px_#c5a869]"></div>
          <span class="text-[11px] font-semibold tracking-[0.2em] text-[#55695e] uppercase">
            Republic of the Philippines • Department of Health
          </span>
        </div>

        <!-- Official Live System Status Indicator with Router Link -->
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

      <!-- CENTER CONTENT: LUXURY MINIMALIST SPLIT PRESENTATION -->
      <main class="my-auto py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        
        <!-- LEFT COLUMN: EDITORIAL BRAND SHOWCASE -->
        <section class="lg:col-span-6 flex flex-col justify-center space-y-8 pr-0 lg:pr-6">
          
          <!-- Official Seal Badge with Link -->
          <router-link to="/" class="flex items-center gap-4 group cursor-pointer select-none">
            <div class="relative">
              <!-- Soft Gold Glow behind Seal -->
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
                <Sparkles class="w-3 h-3 text-[#c5a869]" /> Official Portal
              </span>
              <h2 class="text-xl sm:text-2xl font-serif font-bold text-[#0f291e] tracking-tight mt-1.5 leading-tight group-hover:text-[#18442f] transition-colors">
                Food and Drug Administration
              </h2>
              <p class="text-xs font-medium text-[#65796d]">
                Cordillera Administrative Region (CAR) • CDRHR
              </p>
            </div>
          </router-link>

          <!-- Editorial Lead Headline -->
          <div class="space-y-4">
            <h1 class="text-4xl sm:text-5xl lg:text-[3.4rem] font-serif font-semibold text-[#0f291e] tracking-tight leading-[1.12]">
              Safer Devices.<br />
              <span class="italic font-light text-[#27533b] relative">
                Healthier Tomorrow.
                <span class="absolute bottom-1 left-0 w-full h-[1.5px] bg-gradient-to-r from-[#c5a869] to-transparent"></span>
              </span>
            </h1>
            
            <p class="text-sm sm:text-base text-[#465b50] leading-relaxed max-w-xl font-normal">
              Unified Regulatory Licensing & Establishment Inspection System for medical devices, radiation health facilities, and health-related enterprises across Northern Luzon.
            </p>
          </div>

          <!-- Luxury Pillars & Trust Proof Chips -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div class="bg-[#FFFEFB]/80 backdrop-blur-xs border border-[#e1e7e2] hover:border-[#c5a869]/50 rounded-2xl p-3.5 transition-all shadow-2xs group">
              <ShieldCheck class="w-5 h-5 text-[#255239] mb-1.5 group-hover:text-[#c5a869] transition-colors" />
              <p class="text-xs font-bold text-[#142d20]">RA 9711 Compliant</p>
              <p class="text-[10px] text-[#718579] leading-tight mt-0.5">Enforcement & Audits</p>
            </div>

            <div class="bg-[#FFFEFB]/80 backdrop-blur-xs border border-[#e1e7e2] hover:border-[#c5a869]/50 rounded-2xl p-3.5 transition-all shadow-2xs group">
              <Landmark class="w-5 h-5 text-[#255239] mb-1.5 group-hover:text-[#c5a869] transition-colors" />
              <p class="text-xs font-bold text-[#142d20]">CDRHR Center</p>
              <p class="text-[10px] text-[#718579] leading-tight mt-0.5">Device Regulation</p>
            </div>

            <div class="col-span-2 sm:col-span-1 bg-[#FFFEFB]/80 backdrop-blur-xs border border-[#e1e7e2] hover:border-[#c5a869]/50 rounded-2xl p-3.5 transition-all shadow-2xs group">
              <Lock class="w-5 h-5 text-[#255239] mb-1.5 group-hover:text-[#c5a869] transition-colors" />
              <p class="text-xs font-bold text-[#142d20]">256-Bit TLS</p>
              <p class="text-[10px] text-[#718579] leading-tight mt-0.5">Encrypted Security</p>
            </div>
          </div>

          <!-- Regional Advisory Note -->
          <div class="flex items-center gap-3 py-2 border-l-2 border-[#c5a869] pl-3.5 text-xs text-[#5f7467]">
            <span>Serving Abra, Apayao, Benguet, Ifugao, Kalinga, Mt. Province & Baguio City.</span>
          </div>
        </section>

        <!-- RIGHT COLUMN: MINIMALIST LUXURY AUTHENTICATION CARD -->
        <section class="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
          
          <div class="relative">
            <!-- Subtle Gold Accent Halo -->
            <div class="absolute -top-4 -right-4 w-72 h-72 bg-[#c5a869]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-4 -left-4 w-72 h-72 bg-[#133323]/8 rounded-full blur-3xl pointer-events-none"></div>

            <!-- Pristine Glass Card -->
            <div class="relative bg-[#FFFEFB]/90 backdrop-blur-xl rounded-3xl border border-[#c5a869]/30 shadow-[0_20px_60px_-15px_rgba(19,51,35,0.12)] p-7 sm:p-10 transition-all">
              
              <!-- Card Header -->
              <div class="mb-8">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[11px] font-bold uppercase tracking-widest text-[#937b42]">
                    Secure Sign In
                  </span>
                  <span class="inline-flex items-center gap-1 text-[11px] text-[#697d72] bg-[#f0f4f1] px-2.5 py-0.5 rounded-full border border-[#dce3de]">
                    <ShieldCheck class="w-3.5 h-3.5 text-[#2d5c41]" />
                    Authorized Access
                  </span>
                </div>

                <h3 class="text-2xl sm:text-3xl font-serif font-bold text-[#0f291e] tracking-tight">
                  Welcome to Portal
                </h3>
                <p class="text-xs sm:text-sm text-[#5f7267] mt-1.5 leading-relaxed font-normal">
                  Enter your official regulatory credentials to access the establishment registry and inspection services.
                </p>
              </div>

              <!-- Fast Login: Remembered Officer Profile Banner -->
              <div 
                v-if="isRemembered" 
                class="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-[#123122]/6 via-[#c5a869]/10 to-[#123122]/6 border border-[#c5a869]/40 flex items-center justify-between gap-3 shadow-2xs animate-fadeIn"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#123122] to-[#255239] text-[#e8dfc8] font-bold text-xs flex items-center justify-center border border-[#c5a869]/40 shadow-xs shrink-0">
                    {{ rememberedInitials || 'FDA' }}
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <p class="text-xs font-bold text-[#0f291e] truncate">
                        {{ rememberedName || email }}
                      </p>
                      <span class="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full bg-[#133323] text-[#e8dfc8]">
                        Fast Login
                      </span>
                    </div>
                    <p class="text-[11px] text-[#55695e] truncate">
                      {{ rememberedRole || 'Authorized Regulatory Officer' }}
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  @click="clearRemembered"
                  class="text-[11px] font-semibold text-[#8b733b] hover:text-[#55421a] hover:underline cursor-pointer shrink-0"
                >
                  Switch Account
                </button>
              </div>

              <!-- Alerts / Feedback Notification -->
              <div 
                v-if="errorMessage" 
                class="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn"
              >
                <AlertCircle class="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span class="leading-relaxed flex-1">{{ errorMessage }}</span>
              </div>

              <div 
                v-if="successMessage" 
                class="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-fadeIn"
              >
                <CheckCircle2 class="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span class="leading-relaxed flex-1">{{ successMessage }}</span>
              </div>

              <!-- Caps Lock Alert -->
              <div 
                v-if="isCapsLockOn"
                class="mb-4 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2"
              >
                <span class="font-bold">CAPS LOCK is on</span>
              </div>

              <!-- LOGIN FORM -->
              <form @submit.prevent="handleLogin" class="space-y-5">
                
                <!-- Email Input Field -->
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="block text-xs font-semibold text-[#1a3828] tracking-wide">
                      Official Email / Government ID
                    </label>
                    <span 
                      v-if="isRemembered" 
                      class="inline-flex items-center gap-1.5 text-[10px] text-[#245237] bg-[#eaf3ed] border border-[#c6dfcd] px-2 py-0.5 rounded-full font-medium select-none"
                    >
                      <span>Saved</span>
                      <button 
                        type="button" 
                        @click="clearRemembered" 
                        class="hover:text-rose-600 cursor-pointer font-bold leading-none" 
                        title="Forget this email"
                      >
                        ✕
                      </button>
                    </span>
                  </div>
                  <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d9285] group-focus-within:text-[#255239] transition-colors">
                      <Mail class="w-4 h-4 stroke-[1.8]" />
                    </div>
                    <input
                      ref="emailInputRef"
                      id="login-email-input"
                      type="email"
                      v-model="email"
                      @keydown.enter.prevent="focusPassword"
                      placeholder="e.g. officer.name@fda.gov.ph"
                      autocomplete="email"
                      required
                      class="w-full pl-10 pr-4 py-3 bg-[#fdfcf7] hover:bg-white text-sm text-[#0f291e] placeholder:text-[#9bb0a3] rounded-xl border border-[#d6dfd8] focus:border-[#c5a869] focus:ring-2 focus:ring-[#c5a869]/25 shadow-2xs transition-all duration-150 outline-hidden font-medium"
                    />
                  </div>
                </div>

                <!-- Password Input Field -->
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="block text-xs font-semibold text-[#1a3828] tracking-wide">
                      Security Password
                    </label>
                    <router-link
                      :to="{ path: '/login', hash: '#forgot-password' }"
                      @click="isForgotModalOpen = true"
                      class="text-xs font-medium text-[#89733c] hover:text-[#5c4a1e] hover:underline cursor-pointer transition-colors"
                    >
                      Forgot password?
                    </router-link>
                  </div>
                  
                  <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d9285] group-focus-within:text-[#255239] transition-colors">
                      <Lock class="w-4 h-4 stroke-[1.8]" />
                    </div>
                    <input
                      ref="passwordInputRef"
                      :type="showPassword ? 'text' : 'password'"
                      v-model="password"
                      @keyup="checkCapsLock"
                      placeholder="••••••••••••"
                      autocomplete="current-password"
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

                <!-- Remember Me & Trust Device -->
                <div class="flex items-center justify-between pt-1">
                  <label class="flex items-center gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      v-model="rememberMe"
                      class="w-4 h-4 rounded-md border-[#c5a869] text-[#133323] focus:ring-[#c5a869] cursor-pointer accent-[#133323]" 
                    />
                    <span class="text-xs text-[#52665b] font-medium">Remember me for faster sign-in</span>
                  </label>
                  
                  <span class="text-[11px] text-[#86998e] hidden sm:inline">Saved on this device</span>
                </div>

                <!-- Primary Submit Action: Deep Forest Green with Gold Tone Sheen -->
                <div class="pt-2">
                  <button
                    type="submit"
                    :disabled="isSubmitting"
                    class="w-full h-12 rounded-xl bg-gradient-to-r from-[#123122] via-[#1a442f] to-[#123122] text-[#f8f5eb] font-semibold text-sm tracking-wide shadow-[0_4px_16px_rgba(18,49,34,0.25)] hover:shadow-[0_6px_22px_rgba(197,168,105,0.3)] hover:scale-[1.01] active:scale-[0.99] border border-[#c5a869]/40 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                  >
                    <!-- Shimmer Highlight Effect -->
                    <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none"></div>

                    <!-- Button Content -->
                    <template v-if="isSubmitting">
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-[#c5a869]" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span class="text-[#f8f5eb]">Authenticating...</span>
                    </template>
                    <template v-else>
                      <span class="text-[#f8f5eb]">Authenticate & Access Portal</span>
                      <ArrowRight class="w-4 h-4 text-[#c5a869] group-hover:translate-x-0.5 transition-transform" />
                    </template>
                  </button>
                </div>
              </form>

              <!-- Subtle Divider -->
              <div class="relative my-7">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-[#e2e7e2]"></div>
                </div>
                <div class="relative flex justify-center text-xs uppercase">
                  <span class="bg-[#FFFEFB] px-3 text-[10px] font-bold tracking-widest text-[#8ea095]">
                    Evaluation Shortcut
                  </span>
                </div>
              </div>

              <!-- Quick Demo Login Button -->
              <div>
                <button
                  type="button"
                  @click="handleDemoLogin"
                  class="w-full py-2.5 px-4 rounded-xl bg-[#f5f8f5] hover:bg-[#edf3ee] border border-[#d3ded5] hover:border-[#c5a869]/60 text-xs font-semibold text-[#183927] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs group"
                >
                  <Sparkles class="w-3.5 h-3.5 text-[#bfa05d] group-hover:rotate-12 transition-transform" />
                  <span>Populate Sample Officer Credentials</span>
                </button>
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

    <!-- FORGOT PASSWORD MODAL -->
    <Teleport to="body">
      <div 
        v-if="isForgotModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
      >
        <div 
          class="bg-[#FFFEFB] border border-[#c5a869]/40 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative"
          @click.stop
        >
          <button 
            type="button"
            @click="closeForgotModal"
            class="absolute top-5 right-5 p-1.5 rounded-full text-[#7d9084] hover:text-[#0f291e] hover:bg-[#edf2ee] transition-colors cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>

          <div class="mb-4">
            <div class="w-10 h-10 rounded-xl bg-[#f0f4f1] text-[#245037] flex items-center justify-center mb-3">
              <HelpCircle class="w-5 h-5 text-[#bfa05d]" />
            </div>
            <h4 class="text-xl font-serif font-bold text-[#0f291e]">
              Reset Officer Credentials
            </h4>
            <p class="text-xs text-[#5e7166] mt-1 leading-relaxed">
              Enter your registered FDA email address. An authorized password reset link will be dispatched with security validation.
            </p>
          </div>

          <div v-if="forgotError" class="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle class="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{{ forgotError }}</span>
          </div>

          <div v-if="forgotSubmitted" class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2 mb-4">
            <p class="font-semibold flex items-center gap-1.5">
              <CheckCircle2 class="w-4 h-4 text-emerald-600" />
              Dispatch Instruction Issued
            </p>
            <p>
              If <strong class="font-medium">{{ forgotEmail }}</strong> matches an active officer record in the CDRHR directory, recovery instructions have been sent.
            </p>
          </div>

          <form v-else @submit.prevent="handleForgotSubmit" class="space-y-4 mb-4">
            <div>
              <label class="block text-xs font-semibold text-[#183927] mb-1">
                Official FDA Email
              </label>
              <input 
                type="email" 
                v-model="forgotEmail" 
                required 
                placeholder="e.g. officer.name@fda.gov.ph"
                class="w-full px-3.5 py-2.5 bg-[#fdfcf7] text-sm text-[#0f291e] rounded-xl border border-[#d6dfd8] focus:border-[#c5a869] focus:ring-2 focus:ring-[#c5a869]/20 outline-hidden font-medium"
              />
            </div>

            <button
              type="submit"
              :disabled="isForgotSubmitting"
              class="w-full py-2.5 rounded-xl bg-[#133323] hover:bg-[#1b4330] text-[#f8f5eb] font-semibold text-xs tracking-wide shadow-xs cursor-pointer transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <span v-if="isForgotSubmitting">Dispatching...</span>
              <span v-else>Request Password Dispatch</span>
            </button>
          </form>

          <div class="border-t border-[#edf1ee] pt-3 text-[11px] text-[#718579] flex items-center justify-between">
            <span>Regional IT Hotline: (074) 442-1234</span>
            <router-link 
              to="/login"
              @click="closeForgotModal"
              class="text-[#89733c] hover:underline cursor-pointer font-medium"
            >
              Back to Sign In
            </router-link>
          </div>
        </div>
      </div>
    </Teleport>
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
