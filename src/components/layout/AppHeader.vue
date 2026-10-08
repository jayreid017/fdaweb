<script setup lang="ts">
import { ref } from 'vue';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search, Bell, ChevronDown, LogOut, KeyRound } from 'lucide-vue-next';
import { AuthService } from '../../services/authService';

defineProps<{
  activeNav: string;
  globalSearch: string;
}>();

const emit = defineEmits<{
  (e: 'update:globalSearch', value: string): void;
  (e: 'logout'): void;
}>();

const isUserMenuOpen = ref<boolean>(false);

function handleSignOut() {
  isUserMenuOpen.value = false;
  emit('logout');
}
</script>

<template>
  <header class="bg-[#F9F6ED]/90 z-40 backdrop-blur-sm border-b border-[#ecebe4] h-16 py-9 flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0">
    <!-- Left: Sidebar trigger + Breadcrumbs -->
    <div class="flex items-center gap-3">
      <SidebarTrigger
        id="sidebar-toggle-btn"
        class="text-[#5c6e64] hover:text-[#1a2b21] hover:bg-[#eae8df] rounded-lg border border-[#e2e1d7] h-8 w-8 flex items-center justify-center transition-colors shadow-2xs"
      />

      <div class="h-4 w-px bg-[#e0ded5]"></div>

      <!-- Breadcrumb Navigation with Router Link -->
      <nav class="flex items-center text-xs sm:text-sm" aria-label="Breadcrumb">
        <router-link to="/" class="text-[#738278] hover:text-[#1a2b21] cursor-pointer transition-colors font-normal whitespace-nowrap">CDRHR Registry</router-link>
        <span class="text-[#9caaa1] mx-2 font-light">/</span>
        <span class="font-semibold text-[#1e2e25] whitespace-nowrap">{{ activeNav }}</span>
      </nav>
    </div>

    <!-- Center: Pill Global Search Bar -->
    <div class="relative w-full max-w-sm lg:max-w-md mx-4 hidden md:block">
      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8a9b91]">
        <Search class="w-4 h-4 stroke-[1.8]" />
      </div>
      <input
        type="text"
        :value="globalSearch"
        @input="emit('update:globalSearch', ($event.target as HTMLInputElement).value)"
        placeholder="Search establishment, license..."
        class="w-full pl-10 pr-4 py-2 bg-[#FFFEFB] text-xs sm:text-sm text-[#1e2e25] placeholder:text-[#8a9b91] rounded-full border border-[#dfe5df] shadow-xs focus:outline-hidden focus:border-[#7e855a] focus:ring-1 focus:ring-[#7e855a]/30 transition-all duration-150"
      />
    </div>

    <!-- Right: Bell + Divider + User Profile -->
    <div class="flex items-center gap-3 sm:gap-4 shrink-0">
      <!-- Notifications Bell with Amber Dot -->
      <button
        type="button"
        class="relative p-2 text-[#63766c] hover:text-[#1a2b21] hover:bg-[#eae8df] rounded-full transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell class="w-4.5 h-4.5 stroke-[1.8]" />
        <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#c99a38] ring-2 ring-[#f7f6f1]"></span>
      </button>

      <!-- Vertical Divider -->
      <div class="h-7 w-px bg-[#e1e4de]"></div>

      <!-- User Profile (Dark Green Avatar with Gold Ring & Dropdown) -->
      <div class="relative">
        <div 
          @click="isUserMenuOpen = !isUserMenuOpen"
          class="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div class="w-10 h-10 rounded-full bg-[#1b3829] border border-[#c4a675] text-[#f3ebd9] flex items-center justify-center font-bold text-xs shadow-xs shrink-0 transition-transform group-hover:scale-105">
            {{ AuthService.currentUser.value?.avatarInitials || 'JD' }}
          </div>
          <div class="hidden sm:block text-left">
            <p class="text-xs sm:text-sm font-bold text-[#1a2c22] leading-tight group-hover:text-[#1b3829] transition-colors">
              {{ AuthService.currentUser.value?.name || 'John Doe' }}
            </p>
            <p class="text-[10px] sm:text-[11px] text-[#718579] font-medium leading-tight mt-0.5">
              {{ AuthService.currentUser.value?.role || 'Regulatory Officer' }}
            </p>
          </div>
          <ChevronDown class="w-3.5 h-3.5 text-[#718579] group-hover:text-[#1a2c22] transition-transform" :class="{ 'rotate-180': isUserMenuOpen }" />
        </div>

        <!-- Backdrop to close dropdown on click outside -->
        <div 
          v-if="isUserMenuOpen" 
          @click="isUserMenuOpen = false" 
          class="fixed inset-0 z-40 cursor-default"
        ></div>

        <!-- Luxury User Profile Dropdown Menu -->
        <div 
          v-if="isUserMenuOpen"
          class="absolute right-0 mt-3 w-64 bg-[#FFFEFB] border border-[#c4a675]/35 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn"
        >
          <div class="px-4 py-2.5 border-b border-[#ecebe4]">
            <p class="text-[10px] font-bold text-[#8fa797] uppercase tracking-wider">Signed in as</p>
            <p class="text-xs font-bold text-[#0f291e] truncate mt-0.5">{{ AuthService.currentUser.value?.email || 'officer.jdoe@fda.gov.ph' }}</p>
            <p class="text-[10px] text-[#55695e] mt-0.5">{{ AuthService.currentUser.value?.division || 'CDRHR Center • CAR' }}</p>
          </div>
          <div class="py-1">
            <!-- Reset Password / Security settings button placed BEFORE Sign Out -->
            <router-link
              to="/settings"
              @click="isUserMenuOpen = false"
              class="w-full px-4 py-2.5 text-left text-xs font-semibold text-[#183927] hover:bg-[#f3f7f4] flex items-center gap-2.5 cursor-pointer transition-colors group"
            >
              <div class="w-6 h-6 rounded-lg bg-[#183927]/10 flex items-center justify-center text-[#183927] group-hover:bg-[#183927] group-hover:text-[#f3ebd9] transition-colors">
                <KeyRound class="w-3.5 h-3.5" />
              </div>
              <div class="flex-1">
                <p class="leading-tight text-xs font-bold text-[#183927]">Reset Password</p>
                <p class="text-[10px] text-[#708477] font-normal leading-tight mt-0.5">Account Security & Credentials</p>
              </div>
            </router-link>

            <div class="my-1 border-t border-[#ecebe4]"></div>

            <button 
              type="button"
              @click="handleSignOut"
              class="w-full px-4 py-2.5 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer transition-colors"
            >
              <LogOut class="w-3.5 h-3.5 text-rose-600" />
              <span>Sign Out to Login Page</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
