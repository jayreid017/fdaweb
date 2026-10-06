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
  X, 
  Clock,
  ChevronRight,
  KeyRound
} from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'login-success'): void;
}>();

// Auth states, handlers, and modal logic cleanly decoupled in useLogin.ts
const {
  email,
  password,
  rememberMe,
  isRemembered,
  savedAccount,
  // Fast Login Modal states & actions
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
  // Google OAuth
  isGoogleSubmitting,
  handleGoogleLogin,
  // Normal Login states & actions
  emailInputRef,
  passwordInputRef,
  focusPassword,
  showPassword,
  isSubmitting,
  errorMessage,
  successMessage,
  isCapsLockOn,
  currentTime,
  checkCapsLock,
  clearRemembered,
  handleLogin
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
            <div class="relative bg-[#FFFEFB]/95 backdrop-blur-xl rounded-3xl border border-[#c5a869]/30 shadow-[0_20px_60px_-15px_rgba(19,51,35,0.12)] p-7 sm:p-9 transition-all">
              
              <!-- Card Header -->
              <div class="mb-7">
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

              <!-- Main Page Alerts / Feedback Notification (Only for Normal & Google Login) -->
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

              <!-- CAPS LOCK Alert for Normal Login -->
              <div 
                v-if="isCapsLockOn && !isFastLoginModalOpen"
                class="mb-4 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2"
              >
                <span class="font-bold">CAPS LOCK is on</span>
              </div>

              <!-- FAST LOGIN: SAVED ACCOUNT CARD -->
              <div v-if="isRemembered" class="mb-6">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[11px] font-bold uppercase tracking-wider text-[#8b733b] flex items-center gap-1.5">
                    <Sparkles class="w-3 h-3 text-[#c5a869]" /> Fast Login
                  </span>
                  <button 
                    type="button" 
                    @click="clearRemembered"
                    class="text-[11px] font-medium text-[#7a8e81] hover:text-rose-600 cursor-pointer transition-colors"
                    title="Forget saved account on this device"
                  >
                    Forget
                  </button>
                </div>

                <!-- ENTIRE CARD IS CLICKABLE -->
                <div 
                  id="fast-login-account-card"
                  @click="openFastLoginModal"
                  role="button"
                  tabindex="0"
                  aria-label="Fast login as saved account"
                  @keydown.enter="openFastLoginModal"
                  @keydown.space.prevent="openFastLoginModal"
                  class="group relative w-full p-4 rounded-2xl bg-gradient-to-r from-[#123122]/5 via-[#c5a869]/8 to-[#123122]/5 hover:from-[#123122]/10 hover:via-[#c5a869]/14 hover:to-[#123122]/10 border border-[#c5a869]/40 hover:border-[#c5a869] shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 select-none outline-none focus:ring-2 focus:ring-[#c5a869]/50"
                >
                  <div class="flex items-center gap-3.5 min-w-0">
                    <!-- Status Indicator Dot (🟢) -->
                    <div class="relative flex items-center justify-center shrink-0">
                      <span class="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-600 ring-2 ring-emerald-100"></span>
                    </div>

                    <!-- Account Details -->
                    <div class="min-w-0 text-left">
                      <div class="flex items-center gap-2">
                        <p class="text-sm font-bold text-[#0f291e] tracking-tight group-hover:text-[#133323] transition-colors truncate">
                          {{ savedAccount.name }}
                        </p>
                        <span class="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#133323] text-[#e8dfc8]">
                          Saved
                        </span>
                      </div>
                      <p class="text-xs font-medium text-[#2d5c41] mt-0.5 truncate">
                        {{ savedAccount.role }}
                      </p>
                      <p class="text-[11px] text-[#617669] font-mono truncate mt-0.5">
                        {{ savedAccount.email }}
                      </p>
                    </div>
                  </div>

                  <!-- Right Chevron (›) -->
                  <div class="shrink-0 flex items-center text-[#937b42] group-hover:text-[#133323] group-hover:translate-x-1 transition-all">
                    <ChevronRight class="w-5 h-5 stroke-[2.2]" />
                  </div>
                </div>

                <!-- Subtle Section Divider -->
                <div class="relative my-6">
                  <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-[#e2e7e2]"></div>
                  </div>
                  <div class="relative flex justify-center text-xs">
                    <span class="bg-[#FFFEFB] px-3 text-[11px] font-medium text-[#7a8e81]">
                      or sign in with credentials
                    </span>
                  </div>
                </div>
              </div>

              <!-- NORMAL LOGIN FORM -->
              <form @submit.prevent="handleLogin" class="space-y-4 sm:space-y-4.5">
                
                <!-- Email Input Field -->
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label for="login-email-input" class="block text-xs font-semibold text-[#1a3828] tracking-wide">
                      Official Email / Government ID
                    </label>
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
                      class="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#fdfcf7] hover:bg-white text-sm text-[#0f291e] placeholder:text-[#9bb0a3] rounded-xl border border-[#d6dfd8] focus:border-[#c5a869] focus:ring-2 focus:ring-[#c5a869]/25 shadow-2xs transition-all outline-hidden font-medium"
                    />
                  </div>
                </div>

                <!-- Password Input Field -->
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label for="login-password-input" class="block text-xs font-semibold text-[#1a3828] tracking-wide">
                      Security Password
                    </label>
                    <router-link
                      to="/forgot-password"
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
                      id="login-password-input"
                      :type="showPassword ? 'text' : 'password'"
                      v-model="password"
                      @keyup="checkCapsLock"
                      placeholder="••••••••••••"
                      autocomplete="current-password"
                      required
                      class="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-[#fdfcf7] hover:bg-white text-sm text-[#0f291e] placeholder:text-[#9bb0a3] rounded-xl border border-[#d6dfd8] focus:border-[#c5a869] focus:ring-2 focus:ring-[#c5a869]/25 shadow-2xs transition-all outline-hidden font-medium"
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
                <div class="flex items-center justify-between pt-0.5">
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
                <div class="pt-1.5">
                  <button
                    id="normal-login-submit-button"
                    type="submit"
                    :disabled="isSubmitting"
                    class="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-[#123122] via-[#1a442f] to-[#123122] text-[#f8f5eb] font-semibold text-sm tracking-wide shadow-[0_4px_16px_rgba(18,49,34,0.25)] hover:shadow-[0_6px_22px_rgba(197,168,105,0.3)] hover:scale-[1.01] active:scale-[0.99] border border-[#c5a869]/40 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
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
                      <span class="text-[#f8f5eb]">Login</span>
                      <ArrowRight class="w-4 h-4 text-[#c5a869] group-hover:translate-x-0.5 transition-transform" />
                    </template>
                  </button>
                </div>

                <!-- Subtle "or" divider -->
                <div class="relative my-4">
                  <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-[#e2e7e2]"></div>
                  </div>
                  <div class="relative flex justify-center text-xs uppercase">
                    <span class="bg-[#FFFEFB] px-3 text-[10px] font-bold tracking-widest text-[#8ea095]">
                      or
                    </span>
                  </div>
                </div>

                <!-- Continue with Google Button -->
                <div>
                  <button
                    id="google-login-button"
                    type="button"
                    @click="handleGoogleLogin"
                    :disabled="isGoogleSubmitting"
                    class="w-full h-11 rounded-xl bg-white hover:bg-[#f7faf8] text-[#1e3427] font-semibold text-xs tracking-wide border border-[#d6dfd8] hover:border-[#c5a869]/70 shadow-2xs hover:shadow-xs flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <template v-if="isGoogleSubmitting">
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-[#255239]" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Connecting to Google...</span>
                    </template>
                    <template v-else>
                      <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </template>
                  </button>
                </div>
              </form>

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

    <!-- FAST LOGIN MODAL OVERLAY -->
    <Teleport to="body">
      <div 
        v-if="isFastLoginModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a1811]/50 backdrop-blur-xs animate-fadeIn"
        @click.self="closeFastLoginModal"
        @keydown.esc="closeFastLoginModal"
        tabindex="-1"
      >
        <div 
          id="fast-login-modal"
          class="bg-[#FFFEFB] border border-[#c5a869]/40 rounded-2xl sm:rounded-3xl max-w-sm sm:max-w-[400px] w-full p-6 sm:p-7 shadow-[0_20px_50px_rgba(15,41,30,0.25)] relative transition-all"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fast-login-title"
          @click.stop
        >
          <!-- Close button (×) in top-right -->
          <button 
            type="button" 
            id="fast-login-close-button"
            @click="closeFastLoginModal"
            aria-label="Close Fast Login modal"
            class="absolute top-5 right-5 p-1.5 rounded-full text-[#7a8e81] hover:text-[#0f291e] hover:bg-[#edf2ee] transition-colors cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>

          <!-- Modal Title with 🔐 Lock icon -->
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-8 h-8 rounded-lg bg-[#133323] text-[#e8dfc8] flex items-center justify-center shrink-0 shadow-2xs border border-[#c5a869]/30">
              <Lock class="w-4 h-4 text-[#c5a869]" />
            </div>
            <div>
              <h3 id="fast-login-title" class="text-lg font-serif font-bold text-[#0f291e] leading-tight">
                Fast Login
              </h3>
              <p class="text-[11px] text-[#6b7f73] mt-0.5">
                You're signing in as this saved account.
              </p>
            </div>
          </div>

          <!-- Non-editable Account Information Confirmation Box -->
          <div class="mb-5 p-3.5 rounded-xl bg-[#f7f9f6] border border-[#dce4de] flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#123122] to-[#255239] text-[#e8dfc8] font-bold text-xs flex items-center justify-center border border-[#c5a869]/40 shadow-2xs shrink-0">
              {{ savedAccount.initials || 'DS' }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1">
                <p class="text-sm font-bold text-[#0f291e] truncate">
                  {{ savedAccount.name }}
                </p>
                <span class="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full bg-[#133323] text-[#e8dfc8]">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Verified
                </span>
              </div>
              <p class="text-xs font-medium text-[#2d5c41] truncate">
                {{ savedAccount.role }}
              </p>
              <p class="text-[11px] text-[#55695e] font-mono truncate">
                {{ savedAccount.email }}
              </p>
            </div>
          </div>

          <!-- Compact Inline Error inside modal -->
          <div 
            v-if="fastLoginError"
            id="fast-login-error"
            class="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fadeIn"
          >
            <AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
            <span class="flex-1 font-medium">{{ fastLoginError }}</span>
          </div>

          <!-- Caps Lock Alert inside modal -->
          <div 
            v-if="isCapsLockOn"
            class="mb-3 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2"
          >
            <span class="font-bold">CAPS LOCK is on</span>
          </div>

          <!-- Fast Login Password Form -->
          <form @submit.prevent="handleFastLoginSubmit" class="space-y-4">
            <div>
              <label for="fast-password-input" class="block text-xs font-semibold text-[#1a3828] mb-1.5">
                Security Password
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d9285] group-focus-within:text-[#255239] transition-colors">
                  <KeyRound class="w-4 h-4 stroke-[1.8]" />
                </div>
                <input
                  id="fast-password-input"
                  ref="fastPasswordInputRef"
                  :type="fastLoginShowPassword ? 'text' : 'password'"
                  v-model="fastLoginPassword"
                  @keyup="checkCapsLock"
                  placeholder="••••••••••••"
                  autocomplete="current-password"
                  required
                  class="w-full pl-10 pr-11 py-2.5 bg-[#fdfcf7] hover:bg-white text-sm text-[#0f291e] placeholder:text-[#9bb0a3] rounded-xl border border-[#d6dfd8] focus:border-[#c5a869] focus:ring-2 focus:ring-[#c5a869]/25 shadow-2xs transition-all outline-hidden font-medium"
                />
                <button
                  type="button"
                  @click="fastLoginShowPassword = !fastLoginShowPassword"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7d9285] hover:text-[#1a3828] cursor-pointer transition-colors"
                  :title="fastLoginShowPassword ? 'Hide password' : 'Show password'"
                >
                  <EyeOff v-if="fastLoginShowPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Login Button with Loading State -->
            <button
              id="fast-login-submit-button"
              type="submit"
              :disabled="isFastLoginSubmitting"
              class="w-full h-11 rounded-xl bg-gradient-to-r from-[#123122] via-[#1a442f] to-[#123122] text-[#f8f5eb] font-semibold text-sm tracking-wide shadow-[0_4px_16px_rgba(18,49,34,0.25)] hover:shadow-[0_6px_20px_rgba(197,168,105,0.3)] hover:scale-[1.008] active:scale-[0.99] border border-[#c5a869]/40 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <template v-if="isFastLoginSubmitting">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-[#c5a869]" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Authenticating...</span>
              </template>
              <template v-else>
                <span>Login</span>
                <ArrowRight class="w-4 h-4 text-[#c5a869] group-hover:translate-x-0.5 transition-transform" />
              </template>
            </button>

            <!-- Secondary Action: Forgot password? Link directly to /forgot-password -->
            <div class="text-center pt-0.5">
              <router-link
                to="/forgot-password"
                id="fast-login-forgot-button"
                @click="closeFastLoginModal"
                class="text-xs font-medium text-[#89733c] hover:text-[#5c4a1e] hover:underline cursor-pointer transition-colors inline-block"
              >
                Forgot password?
              </router-link>
            </div>

            <!-- Bottom Action: Switch account -->
            <div class="border-t border-[#edf1ee] pt-3 text-center">
              <button
                type="button"
                id="fast-login-switch-button"
                @click="handleSwitchAccount"
                class="text-xs font-semibold text-[#55695e] hover:text-[#133323] hover:underline cursor-pointer transition-colors"
              >
                Switch account
              </button>
            </div>
          </form>
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
