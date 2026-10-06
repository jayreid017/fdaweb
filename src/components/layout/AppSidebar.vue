<script setup lang="ts">
import logoFda from '../../assets/logoFDA.png';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarRail,
} from '@/components/ui/sidebar';

import { 
  Home, 
  FileText, 
  ShieldCheck, 
  BarChart2, 
  Landmark, 
  Sun,
  Trash2
} from 'lucide-vue-next';

defineProps<{
  activeNav: string;
  trashCount: number;
}>();

const emit = defineEmits<{
  (e: 'navigate', navName: string): void;
}>();
</script>

<template>
  <Sidebar
    collapsible="icon"
    class="border-r z-50 border-[#1a422e]/60 bg-[#133323] text-[#dfd7b8] transition-[width] duration-200"
  >
    <!-- Header: Brand with Router Link -->
    <SidebarHeader class="p-4 border-b border-[#1b4330]/60 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:pt-5 group-data-[collapsible=icon]:pb-2 group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
      <!-- Expanded View -->
      <router-link to="/" class="flex items-center gap-3 overflow-hidden group-data-[collapsible=icon]:hidden cursor-pointer group">
        <div class="w-11 h-11 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
          <img :src="logoFda" alt="FDA Logo" class="w-full h-full object-contain" />
        </div>
        <div class="flex flex-col min-w-0 flex-1">
          <p class="text-xs font-bold text-[#f3ebd9] tracking-tight truncate leading-tight group-hover:text-white transition-colors">FDA Regulatory Portal</p>
          <p class="text-[10px] text-[#9db8a7] font-medium truncate leading-tight mt-0.5">CDRHR Registry</p>
        </div>
      </router-link>

      <!-- Collapsed Brand Logo -->
      <router-link to="/" class="hidden group-data-[collapsible=icon]:flex items-center justify-center cursor-pointer">
        <div class="w-10 h-10 flex items-center justify-center shrink-0 hover:scale-105 transition-transform">
          <img :src="logoFda" alt="FDA Logo" class="w-full h-full object-contain" />
        </div>
      </router-link>
    </SidebarHeader>

    <!-- Navigation -->
    <SidebarContent class="py-4 px-3 group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:px-0">
      <SidebarGroup class="p-0 group-data-[collapsible=icon]:p-0">
        <SidebarGroupLabel class="text-[11px] font-semibold text-[#8fa797] tracking-wider uppercase px-3.5 mb-2 group-data-[collapsible=icon]:hidden">
          Platform
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu class="gap-2 group-data-[collapsible=icon]:gap-4.5 group-data-[collapsible=icon]:items-center">
            <!-- Home (Disabled / Grayed Out) -->
            <SidebarMenuItem class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center cursor-not-allowed" title="Unavailable">
              <SidebarMenuButton
                :disabled="true"
                tooltip="Home (Unavailable)"
                class="h-11 rounded-2xl px-3.5 gap-3 text-[#7f9486]/45 opacity-40 cursor-not-allowed select-none hover:bg-transparent hover:text-[#7f9486]/45 shadow-none pointer-events-none group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
              >
                <Home class="w-5 h-5 shrink-0 stroke-[1.6]" />
                <span class="group-data-[collapsible=icon]:hidden truncate text-xs sm:text-sm font-medium">Home</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Establishment Management (Active & Clickable) -->
            <SidebarMenuItem class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
              <SidebarMenuButton
                :is-active="activeNav === 'Establishment Management'"
                tooltip="Establishment Management"
                @click="emit('navigate', 'Establishment Management')"
                class="h-11 rounded-2xl px-3.5 gap-3 cursor-pointer text-[#dfd7b8] hover:bg-[#1a3d2a] hover:text-[#f3ebd9] data-[active=true]:bg-[#254231] data-[active=true]:text-[#f3ebd9] data-[active=true]:font-semibold shadow-xs transition-colors group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
              >
                <Landmark class="w-5 h-5 shrink-0 stroke-[1.6]" />
                <span class="group-data-[collapsible=icon]:hidden truncate text-xs sm:text-sm font-medium">Establishment Management</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Trash Navigation with Dynamic Badge (Active & Clickable) -->
            <SidebarMenuItem class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
              <SidebarMenuButton
                :is-active="activeNav === 'Trash'"
                tooltip="Trash"
                @click="emit('navigate', 'Trash')"
                class="h-11 rounded-2xl px-3.5 gap-3 cursor-pointer text-[#dfd7b8] hover:bg-[#1a3d2a] hover:text-[#f3ebd9] data-[active=true]:bg-[#254231] data-[active=true]:text-[#f3ebd9] data-[active=true]:font-semibold shadow-xs transition-colors group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center relative"
              >
                <Trash2 class="w-5 h-5 shrink-0 stroke-[1.6]" />
                <span class="group-data-[collapsible=icon]:hidden truncate text-xs sm:text-sm font-medium flex-1 text-left">
                  Trash
                </span>
                <span
                  v-if="trashCount > 0"
                  class="group-data-[collapsible=icon]:hidden px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-900/60 text-rose-200 border border-rose-700/50"
                >
                  {{ trashCount }}
                </span>
              </SidebarMenuButton>
              <SidebarMenuBadge
                v-if="trashCount > 0"
                class="bg-rose-900 text-rose-100 text-[10px] font-bold px-1.5 rounded-full"
              >
                {{ trashCount }}
              </SidebarMenuBadge>
            </SidebarMenuItem>

            <!-- Licenses & Inspections (Disabled / Grayed Out) -->
            <SidebarMenuItem class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center cursor-not-allowed" title="Unavailable">
              <SidebarMenuButton
                :disabled="true"
                tooltip="Licenses & Inspections (Unavailable)"
                class="h-11 rounded-2xl px-3.5 gap-3 text-[#7f9486]/45 opacity-40 cursor-not-allowed select-none hover:bg-transparent hover:text-[#7f9486]/45 shadow-none pointer-events-none group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
              >
                <FileText class="w-5 h-5 shrink-0 stroke-[1.6]" />
                <span class="group-data-[collapsible=icon]:hidden truncate text-xs sm:text-sm font-medium">Licenses & Inspections</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Regulatory Information (Disabled / Grayed Out) -->
            <SidebarMenuItem class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center cursor-not-allowed" title="Unavailable">
              <SidebarMenuButton
                :disabled="true"
                tooltip="Regulatory Information (Unavailable)"
                class="h-11 rounded-2xl px-3.5 gap-3 text-[#7f9486]/45 opacity-40 cursor-not-allowed select-none hover:bg-transparent hover:text-[#7f9486]/45 shadow-none pointer-events-none group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
              >
                <ShieldCheck class="w-5 h-5 shrink-0 stroke-[1.6]" />
                <span class="group-data-[collapsible=icon]:hidden truncate text-xs sm:text-sm font-medium">Regulatory Information</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Reports (Disabled / Grayed Out) -->
            <SidebarMenuItem class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center cursor-not-allowed" title="Unavailable">
              <SidebarMenuButton
                :disabled="true"
                tooltip="Reports (Unavailable)"
                class="h-11 rounded-2xl px-3.5 gap-3 text-[#7f9486]/45 opacity-40 cursor-not-allowed select-none hover:bg-transparent hover:text-[#7f9486]/45 shadow-none pointer-events-none group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
              >
                <BarChart2 class="w-5 h-5 shrink-0 stroke-[1.6]" />
                <span class="group-data-[collapsible=icon]:hidden truncate text-xs sm:text-sm font-medium">Reports</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Settings (Disabled / Grayed Out) -->
            <SidebarMenuItem class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center cursor-not-allowed" title="Unavailable">
              <SidebarMenuButton
                :disabled="true"
                tooltip="Settings (Unavailable)"
                class="h-11 rounded-2xl px-3.5 gap-3 text-[#7f9486]/45 opacity-40 cursor-not-allowed select-none hover:bg-transparent hover:text-[#7f9486]/45 shadow-none pointer-events-none group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
              >
                <Sun class="w-5 h-5 shrink-0 stroke-[1.6]" />
                <span class="group-data-[collapsible=icon]:hidden truncate text-xs sm:text-sm font-medium">Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <!-- Footer: Motto -->
    <SidebarFooter class="p-4 border-t border-[#1b4330]/60 bg-[#133323] group-data-[collapsible=icon]:hidden">
      <div>
        <div class="w-6 h-0.5 bg-[#7e855a] mb-2 rounded-full"></div>
        <p class="text-[11px] font-bold text-[#f3ebd9] leading-tight">Safer Devices.</p>
        <p class="text-[10px] text-[#9db8a7] leading-tight mt-0.5">Healthier Tomorrow.</p>
      </div>
    </SidebarFooter>

    <!-- Rail for drag / quick-toggle -->
    <SidebarRail />
  </Sidebar>
</template>
