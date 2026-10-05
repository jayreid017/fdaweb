<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import logoFda from '../../assets/logoFDA.png';
import type { 
  Establishment, 
  EstablishmentFormData, 
  FilterState, 
  ToastMessage, 
  SummaryStats 
} from '../../types/establishment';
import { EstablishmentService } from '../../services/establishmentService';

import StatisticsCards from './StatisticsCards.vue';
import SearchToolbar from './SearchToolbar.vue';
import EstablishmentTable from './EstablishmentTable.vue';
import Pagination from './Pagination.vue';
import EstablishmentFormModal from './EstablishmentFormModal.vue';
import EstablishmentViewModal from './EstablishmentViewModal.vue';
import DeleteConfirmationModal from './DeleteConfirmationModal.vue';
import ToastNotification from '../common/ToastNotification.vue';
import SkeletonStats from '../common/SkeletonStats.vue';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';

import { 
  Plus, 
  Home, 
  FileText, 
  ShieldCheck, 
  BarChart2, 
  Bell, 
  ChevronDown, 
  Search, 
  Landmark, 
  Sun,
  LogOut
} from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { AuthService } from '../../services/authService';

const emit = defineEmits<{
  (e: 'logout'): void;
}>();

const router = useRouter();

// State
const establishments = ref<Establishment[]>([]);
const isLoading = ref<boolean>(true);
const toasts = ref<ToastMessage[]>([]);
const activeNav = ref<string>('Establishment Management');
const isUserMenuOpen = ref<boolean>(false);

async function handleSignOut() {
  isUserMenuOpen.value = false;
  await AuthService.logout();
  emit('logout');
  router.push('/login');
}

// Top global search input
const globalSearch = ref<string>('');

// Filter state
const filters = reactive<FilterState>({
  search: '',
  product_type: '',
  province: '',
  city_municipality: '',
  status: '',
  status_last_inspection: '',
});

// Interactive Stat Cards Filter ('all' | 'active' | 'expired' | 'upcoming')
const activeStatFilter = ref<'all' | 'active' | 'expired' | 'upcoming'>('all');

// Pagination state
const currentPage = ref<number>(1);
const pageSize = ref<number>(10);

// Modal states
const isFormModalOpen = ref<boolean>(false);
const formModalTarget = ref<Establishment | null>(null);

const isViewModalOpen = ref<boolean>(false);
const viewModalTarget = ref<Establishment | null>(null);

const isDeleteModalOpen = ref<boolean>(false);
const deleteModalTarget = ref<Establishment | null>(null);

// Toast helper
function addToast(type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  toasts.value.push({ id, type, title, message });

  setTimeout(() => {
    removeToast(id);
  }, 4500);
}

function removeToast(id: string) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

// Load data from Supabase
async function loadData() {
  isLoading.value = true;
  try {
    const data = await EstablishmentService.getAll();
    establishments.value = data;
  } catch (e: any) {
    console.error(e);
    addToast('error', 'Error loading data', e.message || 'Failed to retrieve establishment records from Supabase.');
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 200);
  }
}

// Filtered Establishments
const filteredEstablishments = computed(() => {
  const now = new Date();
  const upcomingLimit = new Date();
  upcomingLimit.setDate(now.getDate() + 60);

  return establishments.value.filter((item) => {
    // Quick filter from Statistics Cards
    if (activeStatFilter.value === 'active') {
      if (item.status?.trim().toLowerCase() !== 'active') return false;
    } else if (activeStatFilter.value === 'expired') {
      const statusLower = item.status?.trim().toLowerCase();
      const expiry = item.expiry ? new Date(item.expiry) : null;
      const isExpired = statusLower === 'expired' || (expiry && !isNaN(expiry.getTime()) && expiry < now);
      if (!isExpired) return false;
    } else if (activeStatFilter.value === 'upcoming') {
      if (!item.next_inspection) return false;
      const nextInsp = new Date(item.next_inspection);
      if (isNaN(nextInsp.getTime()) || nextInsp < now || nextInsp > upcomingLimit) {
        return false;
      }
    }
    // Top global search OR toolbar search
    const query = (filters.search || globalSearch.value).toLowerCase().trim();
    if (query) {
      const match =
        item.establishment_name?.toLowerCase().includes(query) ||
        item.lto_number?.toLowerCase().includes(query) ||
        item.owner?.toLowerCase().includes(query) ||
        item.contact_number?.toLowerCase().includes(query) ||
        item.email_address?.toLowerCase().includes(query) ||
        item.province?.toLowerCase().includes(query) ||
        item.city_municipality?.toLowerCase().includes(query) ||
        item.inspector?.toLowerCase().includes(query) ||
        item.products?.toLowerCase().includes(query) ||
        item.product_type?.toLowerCase().includes(query) ||
        item.primary_activity?.toLowerCase().includes(query);

      if (!match) return false;
    }

    // Product type
    if (filters.product_type && item.product_type !== filters.product_type) {
      return false;
    }

    // Province (Strictly one of the 7 from Image 2)
    if (filters.province && item.province !== filters.province) {
      return false;
    }

    // City/Municipality
    if (filters.city_municipality && item.city_municipality !== filters.city_municipality) {
      return false;
    }

    // Status
    if (filters.status && item.status !== filters.status) {
      return false;
    }

    // Inspection status
    if (filters.status_last_inspection && item.status_last_inspection !== filters.status_last_inspection) {
      return false;
    }

    return true;
  });
});

// Paginated slice
const paginatedEstablishments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredEstablishments.value.slice(start, start + pageSize.value);
});

// Statistics
const stats = computed<SummaryStats>(() => {
  return EstablishmentService.calculateStats(establishments.value);
});

// Handlers
function resetFilters() {
  filters.search = '';
  globalSearch.value = '';
  filters.product_type = '';
  filters.province = '';
  filters.city_municipality = '';
  filters.status = '';
  filters.status_last_inspection = '';
  activeStatFilter.value = 'all';
  currentPage.value = 1;
  addToast('info', 'Filters Reset', 'All search and filter criteria have been cleared.');
}

function openAddModal() {
  formModalTarget.value = null;
  isFormModalOpen.value = true;
}

function openEditModal(item: Establishment) {
  formModalTarget.value = item;
  isFormModalOpen.value = true;
}

function openViewModal(item: Establishment) {
  viewModalTarget.value = item;
  isViewModalOpen.value = true;
}

function handleViewEdit(item: Establishment) {
  isViewModalOpen.value = false;
  openEditModal(item);
}

function openDeleteModal(item: Establishment) {
  deleteModalTarget.value = item;
  isDeleteModalOpen.value = true;
}

async function handleSaveEstablishment(formData: EstablishmentFormData) {
  try {
    if (formModalTarget.value) {
      const updated = await EstablishmentService.update(formModalTarget.value.id, formData);
      const idx = establishments.value.findIndex((e) => e.id === updated.id);
      if (idx !== -1) {
        establishments.value[idx] = updated;
      }
      addToast('success', 'Establishment updated successfully.', `Details for "${updated.establishment_name}" have been updated.`);
    } else {
      const created = await EstablishmentService.create(formData);
      establishments.value.unshift(created);
      currentPage.value = 1;
      addToast('success', 'Establishment created successfully.', `"${created.establishment_name}" has been registered.`);
    }

    isFormModalOpen.value = false;
    formModalTarget.value = null;
  } catch (error: any) {
    console.error(error);
    addToast('error', 'Unable to save establishment.', error.message || 'Please check the required fields.');
  }
}

async function handleConfirmDelete() {
  if (!deleteModalTarget.value) return;

  const target = deleteModalTarget.value;
  try {
    const success = await EstablishmentService.delete(target.id);
    if (success) {
      establishments.value = establishments.value.filter((e) => e.id !== target.id);
      const maxPage = Math.ceil(establishments.value.length / pageSize.value) || 1;
      if (currentPage.value > maxPage) {
        currentPage.value = maxPage;
      }
      addToast('success', 'Establishment deleted successfully.', `"${target.establishment_name}" was deleted from the registry.`);
    } else {
      addToast('error', 'Unable to delete establishment.', 'Record could not be found or was already deleted.');
    }
  } catch (error: any) {
    console.error(error);
    addToast('error', 'Unable to delete establishment.', error.message || 'An error occurred while deleting.');
  } finally {
    isDeleteModalOpen.value = false;
    deleteModalTarget.value = null;
  }
}

async function handleRefreshData() {
  await loadData();
  addToast('info', 'Data Refreshed', 'Latest records fetched from Supabase.');
}

function exportToCSV() {
  if (filteredEstablishments.value.length === 0) {
    addToast('warning', 'No Records to Export', 'There are no establishments matching current filters.');
    return;
  }

  const headers = [
    'No',
    'Establishment Name',
    'Product Type',
    'Primary Activity',
    'Specific Activities',
    'Product Line',
    'Products',
    'LTO Number',
    'LTO Issuance Date',
    'Expiry',
    'Address',
    'Province',
    'City/Municipality',
    'Owner',
    'Contact Number',
    'Email Address',
    'Last Inspection',
    'Status of Last Inspection',
    'Frequency',
    'Next Inspection',
    'Type of Inspection',
    'Inspector',
    'Status'
  ];

  const rows = filteredEstablishments.value.map((item, idx) => [
    idx + 1,
    `"${(item.establishment_name || '').replace(/"/g, '""')}"`,
    `"${item.product_type || ''}"`,
    `"${item.primary_activity || ''}"`,
    `"${(item.specific_activities || '').replace(/"/g, '""')}"`,
    `"${(item.product_line || '').replace(/"/g, '""')}"`,
    `"${(item.products || '').replace(/"/g, '""')}"`,
    `"${item.lto_number || ''}"`,
    item.lto_issuance_date || '',
    item.expiry || '',
    `"${(item.address || '').replace(/"/g, '""')}"`,
    `"${item.province || ''}"`,
    `"${item.city_municipality || ''}"`,
    `"${(item.owner || '').replace(/"/g, '""')}"`,
    `"${item.contact_number || ''}"`,
    `"${item.email_address || ''}"`,
    item.last_inspection || '',
    `"${item.status_last_inspection || ''}"`,
    `"${item.frequency || ''}"`,
    item.next_inspection || '',
    `"${item.type_inspection || ''}"`,
    `"${item.inspector || ''}"`,
    `"${item.status || ''}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `FDA_CAR_Establishments_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  addToast('success', 'Registry Exported', 'CSV spreadsheet file downloaded successfully.');
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <SidebarProvider>
    <div
      class="flex min-h-screen w-full text-[#172a1f] relative bg-transparent"
    >
      <!-- SHADCN SIDEBAR -->
      <Sidebar
        collapsible="icon"
        class="border-r border-[#1a422e]/60 bg-[#133323] text-[#dfd7b8] transition-[width] duration-200"
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
                <SidebarMenuItem class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                  <SidebarMenuButton
                    :is-active="activeNav === 'Home'"
                    tooltip="Home"
                    @click="activeNav = 'Home'"
                    class="h-11 rounded-2xl px-3.5 gap-3 cursor-pointer text-[#dfd7b8] hover:bg-[#1a3d2a] hover:text-[#f3ebd9] data-[active=true]:bg-[#254231] data-[active=true]:text-[#f3ebd9] data-[active=true]:font-semibold shadow-xs transition-colors group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
                  >
                    <Home class="w-5 h-5 shrink-0 stroke-[1.6]" />
                    <span class="group-data-[collapsible=icon]:hidden truncate text-xs sm:text-sm font-medium">Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                  <SidebarMenuButton
                    :is-active="activeNav === 'Establishment Management'"
                    tooltip="Establishment Management"
                    @click="activeNav = 'Establishment Management'"
                    class="h-11 rounded-2xl px-3.5 gap-3 cursor-pointer text-[#dfd7b8] hover:bg-[#1a3d2a] hover:text-[#f3ebd9] data-[active=true]:bg-[#254231] data-[active=true]:text-[#f3ebd9] data-[active=true]:font-semibold shadow-xs transition-colors group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
                  >
                    <Landmark class="w-5 h-5 shrink-0 stroke-[1.6]" />
                    <span class="group-data-[collapsible=icon]:hidden truncate text-xs sm:text-sm font-medium">Establishment Management</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                  <SidebarMenuButton
                    :is-active="activeNav === 'Licenses & Inspections'"
                    tooltip="Licenses & Inspections"
                    @click="activeNav = 'Licenses & Inspections'"
                    class="h-11 rounded-2xl px-3.5 gap-3 cursor-pointer text-[#dfd7b8] hover:bg-[#1a3d2a] hover:text-[#f3ebd9] data-[active=true]:bg-[#254231] data-[active=true]:text-[#f3ebd9] data-[active=true]:font-semibold shadow-xs transition-colors group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
                  >
                    <FileText class="w-5 h-5 shrink-0 stroke-[1.6]" />
                    <span class="group-data-[collapsible=icon]:hidden truncate text-xs sm:text-sm font-medium">Licenses & Inspections</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                  <SidebarMenuButton
                    :is-active="activeNav === 'Regulatory Information'"
                    tooltip="Regulatory Information"
                    @click="activeNav = 'Regulatory Information'"
                    class="h-11 rounded-2xl px-3.5 gap-3 cursor-pointer text-[#dfd7b8] hover:bg-[#1a3d2a] hover:text-[#f3ebd9] data-[active=true]:bg-[#254231] data-[active=true]:text-[#f3ebd9] data-[active=true]:font-semibold shadow-xs transition-colors group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
                  >
                    <ShieldCheck class="w-5 h-5 shrink-0 stroke-[1.6]" />
                    <span class="group-data-[collapsible=icon]:hidden truncate text-xs sm:text-sm font-medium">Regulatory Information</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                  <SidebarMenuButton
                    :is-active="activeNav === 'Reports'"
                    tooltip="Reports"
                    @click="activeNav = 'Reports'"
                    class="h-11 rounded-2xl px-3.5 gap-3 cursor-pointer text-[#dfd7b8] hover:bg-[#1a3d2a] hover:text-[#f3ebd9] data-[active=true]:bg-[#254231] data-[active=true]:text-[#f3ebd9] data-[active=true]:font-semibold shadow-xs transition-colors group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
                  >
                    <BarChart2 class="w-5 h-5 shrink-0 stroke-[1.6]" />
                    <span class="group-data-[collapsible=icon]:hidden truncate text-xs sm:text-sm font-medium">Reports</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                  <SidebarMenuButton
                    :is-active="activeNav === 'Settings'"
                    tooltip="Settings"
                    @click="activeNav = 'Settings'"
                    class="h-11 rounded-2xl px-3.5 gap-3 cursor-pointer text-[#dfd7b8] hover:bg-[#1a3d2a] hover:text-[#f3ebd9] data-[active=true]:bg-[#254231] data-[active=true]:text-[#f3ebd9] data-[active=true]:font-semibold shadow-xs transition-colors group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
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

      <!-- MAIN CONTENT AREA -->
      <SidebarInset class="flex flex-col min-h-screen bg-transparent">
        <!-- TOP HEADER -->
        <header class="bg-[#F9F6ED]/90 z-40 backdrop-blur-sm border-b border-[#ecebe4] h-16 py-9 flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-20">
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
              v-model="globalSearch"
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
                  <button 
                    type="button"
                    @click="handleSignOut"
                    class="w-full px-4 py-2 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut class="w-3.5 h-3.5 text-rose-600" />
                    <span>Sign Out to Login Page</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- MAIN PAGE CONTENT -->
        <main class="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-7">
          <!-- Page Title -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <p class="text-xs font-semibold tracking-[0.16em] text-[#a47c3b] uppercase mb-1.5">
                FDA REGULATORY PORTAL
              </p>
              <h1 class="text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold text-[#0f241a] tracking-tight leading-[1.15] mb-2">
                Establishment Management
              </h1>
              <p class="text-xs sm:text-sm text-[#667a6e] font-normal">
                Manage establishments, licenses, inspections, and regulatory information.
              </p>
            </div>
            <div>
              <button
                type="button"
                id="add-establishment-btn"
                @click="openAddModal"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1d4b35] hover:bg-[#153a29] active:bg-[#102e20] text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-[0_8px_20px_-4px_rgba(29,75,53,0.38)] hover:shadow-lg transition-all duration-150 cursor-pointer"
              >
                <Plus class="w-4 h-4 stroke-[2.2]" />
                <span>Add establishment</span>
              </button>
            </div>
          </div>

          <!-- Statistics -->
          <section aria-label="Establishment Statistics">
            <SkeletonStats v-if="isLoading" />
            <StatisticsCards
              v-else
              :stats="stats"
              :active-filter="activeStatFilter"
              @filter-change="(f) => { activeStatFilter = f; currentPage = 1; }"
            />
          </section>

          <!-- Search Toolbar -->
          <section aria-label="Establishment Filters">
            <SearchToolbar
              :filters="filters"
              @update:filters="(f) => { Object.assign(filters, f); currentPage = 1; }"
              @reset="resetFilters"
            />
          </section>

          <!-- Table -->
          <section aria-label="Establishment Table">
            <EstablishmentTable
              :establishments="paginatedEstablishments"
              :total-filtered-count="filteredEstablishments.length"
              :total-count="establishments.length"
              :is-loading="isLoading"
              :start-index="(currentPage - 1) * pageSize"
              @view="openViewModal"
              @edit="openEditModal"
              @delete="openDeleteModal"
              @add="openAddModal"
              @export="exportToCSV"
              @refresh="handleRefreshData"
            />

            <Pagination
              v-if="!isLoading && filteredEstablishments.length > 0"
              :current-page="currentPage"
              :page-size="pageSize"
              :total-items="filteredEstablishments.length"
              @update:current-page="(p) => currentPage = p"
              @update:page-size="(s) => { pageSize = s; currentPage = 1; }"
            />
          </section>
        </main>

        <!-- Footer -->
        <footer class="border-t border-[#e2ebe4] bg-[#FFFEFB]/80 py-4 px-6 text-xs text-[#637d6e] mt-auto">
          <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 Republic of the Philippines • Food and Drug Administration. All rights reserved.</p>
            <p class="text-[11px] text-[#869c90]">Cordillera Administrative Region (CAR) Regulatory Oversight</p>
          </div>
        </footer>
      </SidebarInset>
    </div>

    <!-- Modals -->
    <EstablishmentFormModal
      :is-open="isFormModalOpen"
      :establishment="formModalTarget"
      @close="isFormModalOpen = false"
      @save="handleSaveEstablishment"
    />
    <EstablishmentViewModal
      :is-open="isViewModalOpen"
      :establishment="viewModalTarget"
      @close="isViewModalOpen = false"
      @edit="handleViewEdit"
    />
    <DeleteConfirmationModal
      :is-open="isDeleteModalOpen"
      :establishment="deleteModalTarget"
      @close="isDeleteModalOpen = false"
      @confirm="handleConfirmDelete"
    />
    <ToastNotification
      :toasts="toasts"
      @dismiss="removeToast"
    />
  </SidebarProvider>
</template>
