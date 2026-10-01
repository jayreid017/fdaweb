<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
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
  Plus, 
  Building2, 
  Home,
  FileText,
  ShieldCheck,
  BarChart2,
  Settings,
  Bell,
  ChevronDown,
  Menu,
  X,
  Search
} from 'lucide-vue-next';

// State
const establishments = ref<Establishment[]>([]);
const isLoading = ref<boolean>(true);
const toasts = ref<ToastMessage[]>([]);
const isMobileSidebarOpen = ref<boolean>(false);
const activeNav = ref<string>('Establishment Management');

// Top global search input
const globalSearch = ref<string>('');

// Filter state
const filters = reactive<FilterState>({
  search: '',
  productType: '',
  province: '',
  cityMunicipality: '',
  status: '',
  inspectionStatus: '',
});

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

// Load data
async function loadData() {
  isLoading.value = true;
  try {
    const data = await EstablishmentService.getAll();
    establishments.value = data;
  } catch (e) {
    console.error(e);
    addToast('error', 'Error loading data', 'Failed to retrieve establishment records.');
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 200);
  }
}

// Filtered Establishments
const filteredEstablishments = computed(() => {
  return establishments.value.filter((item) => {
    // Top global search OR toolbar search
    const query = (filters.search || globalSearch.value).toLowerCase().trim();
    if (query) {
      const match =
        item.establishmentName?.toLowerCase().includes(query) ||
        item.ltoNumber?.toLowerCase().includes(query) ||
        item.owner?.toLowerCase().includes(query) ||
        item.contactNumber?.toLowerCase().includes(query) ||
        item.emailAddress?.toLowerCase().includes(query) ||
        item.province?.toLowerCase().includes(query) ||
        item.cityMunicipality?.toLowerCase().includes(query) ||
        item.inspector?.toLowerCase().includes(query) ||
        item.products?.toLowerCase().includes(query);

      if (!match) return false;
    }

    // Product type
    if (filters.productType && item.productType !== filters.productType) {
      return false;
    }

    // Province (Strictly one of the 7 from Image 2)
    if (filters.province && item.province !== filters.province) {
      return false;
    }

    // City/Municipality
    if (filters.cityMunicipality && item.cityMunicipality !== filters.cityMunicipality) {
      return false;
    }

    // Status
    if (filters.status && item.status !== filters.status) {
      return false;
    }

    // Inspection status
    if (filters.inspectionStatus && item.statusOfLastInspection !== filters.inspectionStatus) {
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
  filters.productType = '';
  filters.province = '';
  filters.cityMunicipality = '';
  filters.status = '';
  filters.inspectionStatus = '';
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
      addToast('success', 'Establishment updated successfully.', `Details for "${updated.establishmentName}" have been updated.`);
    } else {
      const created = await EstablishmentService.create(formData);
      establishments.value.unshift(created);
      currentPage.value = 1;
      addToast('success', 'Establishment created successfully.', `"${created.establishmentName}" has been registered.`);
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
      addToast('success', 'Establishment deleted successfully.', `"${target.establishmentName}" was deleted from the registry.`);
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

async function handleResetDemoData() {
  if (confirm('Reset sample records to default initial database?')) {
    isLoading.value = true;
    const res = await EstablishmentService.resetToDefaults();
    establishments.value = res;
    currentPage.value = 1;
    resetFilters();
    setTimeout(() => {
      isLoading.value = false;
      addToast('success', 'Sample Data Restored', 'The registry has been re-seeded with official sample records.');
    }, 200);
  }
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
    'Specific Activity/s',
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
    'Type Inspection',
    'Inspector',
    'Status'
  ];

  const rows = filteredEstablishments.value.map((item, idx) => [
    idx + 1,
    `"${(item.establishmentName || '').replace(/"/g, '""')}"`,
    `"${item.productType || ''}"`,
    `"${item.primaryActivity || ''}"`,
    `"${(item.specificActivities || '').replace(/"/g, '""')}"`,
    `"${(item.productLine || '').replace(/"/g, '""')}"`,
    `"${(item.products || '').replace(/"/g, '""')}"`,
    `"${item.ltoNumber || ''}"`,
    item.ltoIssuanceDate || '',
    item.expiryDate || '',
    `"${(item.address || '').replace(/"/g, '""')}"`,
    `"${item.province || ''}"`,
    `"${item.cityMunicipality || ''}"`,
    `"${(item.owner || '').replace(/"/g, '""')}"`,
    `"${item.contactNumber || ''}"`,
    `"${item.emailAddress || ''}"`,
    item.lastInspection || '',
    `"${item.statusOfLastInspection || ''}"`,
    `"${item.frequency || ''}"`,
    item.nextInspection || '',
    `"${item.typeInspection || ''}"`,
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
  <div class="min-h-screen bg-[#f7f9f6] flex text-[#172a1f] relative overflow-x-hidden">
    <!-- Background Botanical Leaf Watermark Accents (mirroring image 1) -->
    <div class="absolute top-0 right-0 w-96 h-96 pointer-events-none opacity-40 select-none z-0">
      <svg viewBox="0 0 400 400" fill="none" class="w-full h-full text-[#dbe8de]">
        <path d="M400,0 C320,60 260,160 270,250 C220,180 200,90 230,0 Z" fill="currentColor" opacity="0.4"/>
        <path d="M400,100 C340,150 280,260 300,380 C260,290 250,190 310,90 Z" fill="currentColor" opacity="0.25"/>
      </svg>
    </div>

    <!-- LEFT SIDEBAR (as shown in Image 1) -->
    <aside
      :class="[
        'w-64 bg-white border-r border-[#e4ede6] flex flex-col shrink-0 z-50 transition-all duration-200 fixed inset-y-0 left-0 lg:static',
        isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Top Brand Logo -->
      <div class="p-6 border-b border-[#edf4ee] flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#366649] text-white flex items-center justify-center shrink-0 shadow-xs">
            <!-- Classical Temple / Government Pillar Icon -->
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L2 7h20L12 2zm-8 7v9h2V9H4zm5 0v9h2V9H9zm5 0v9h2V9h-2zm5 0v9h2V9h-2zM2 20v2h20v-2H2z" />
            </svg>
          </div>
          <div>
            <h1 class="text-sm font-extrabold text-[#172a1f] tracking-tight leading-tight">
              FDA Regulatory Portal
            </h1>
            <p class="text-[10px] text-[#637d6e] leading-snug mt-0.5">
              Center for Device Regulation, Radiation Health & Research
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="isMobileSidebarOpen = false"
          class="lg:hidden text-[#637d6e] hover:text-[#172a1f] p-1 rounded-lg"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation Menu -->
      <nav class="p-4 space-y-1.5 flex-1">
        <!-- Home -->
        <a
          href="#"
          @click.prevent="activeNav = 'Home'"
          :class="[
            'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
            activeNav === 'Home'
              ? 'bg-[#366649] text-white shadow-xs'
              : 'text-[#4e6858] hover:bg-[#edf5ef] hover:text-[#172a1f]'
          ]"
        >
          <Home class="w-4 h-4" />
          <span>Home</span>
        </a>

        <!-- Establishment Management (Active pill as in image 1) -->
        <a
          href="#"
          @click.prevent="activeNav = 'Establishment Management'"
          :class="[
            'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all',
            activeNav === 'Establishment Management'
              ? 'bg-[#366649] text-white shadow-xs'
              : 'text-[#4e6858] hover:bg-[#edf5ef] hover:text-[#172a1f]'
          ]"
        >
          <Building2 class="w-4 h-4" />
          <span>Establishment Management</span>
        </a>

        <!-- Licenses & Inspections -->
        <a
          href="#"
          @click.prevent="activeNav = 'Licenses & Inspections'"
          :class="[
            'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
            activeNav === 'Licenses & Inspections'
              ? 'bg-[#366649] text-white shadow-xs'
              : 'text-[#4e6858] hover:bg-[#edf5ef] hover:text-[#172a1f]'
          ]"
        >
          <FileText class="w-4 h-4" />
          <span>Licenses & Inspections</span>
        </a>

        <!-- Regulatory Information -->
        <a
          href="#"
          @click.prevent="activeNav = 'Regulatory Information'"
          :class="[
            'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
            activeNav === 'Regulatory Information'
              ? 'bg-[#366649] text-white shadow-xs'
              : 'text-[#4e6858] hover:bg-[#edf5ef] hover:text-[#172a1f]'
          ]"
        >
          <ShieldCheck class="w-4 h-4" />
          <span>Regulatory Information</span>
        </a>

        <!-- Reports -->
        <a
          href="#"
          @click.prevent="activeNav = 'Reports'"
          :class="[
            'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
            activeNav === 'Reports'
              ? 'bg-[#366649] text-white shadow-xs'
              : 'text-[#4e6858] hover:bg-[#edf5ef] hover:text-[#172a1f]'
          ]"
        >
          <BarChart2 class="w-4 h-4" />
          <span>Reports</span>
        </a>

        <!-- Settings -->
        <a
          href="#"
          @click.prevent="activeNav = 'Settings'"
          :class="[
            'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
            activeNav === 'Settings'
              ? 'bg-[#366649] text-white shadow-xs'
              : 'text-[#4e6858] hover:bg-[#edf5ef] hover:text-[#172a1f]'
          ]"
        >
          <Settings class="w-4 h-4" />
          <span>Settings</span>
        </a>
      </nav>

      <!-- Bottom Watermark & Motto (from Image 1) -->
      <div class="p-6 relative overflow-hidden mt-auto border-t border-[#edf4ee] bg-[#fafcf9]">
        <!-- Delicate organic leaf illustration -->
        <div class="absolute bottom-0 left-0 w-28 h-28 pointer-events-none opacity-30 text-[#366649]">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M0,100 C20,70 50,50 80,40 C60,60 40,80 0,100 Z" opacity="0.6"/>
            <path d="M0,60 C30,40 60,30 90,10 C70,35 45,55 0,60 Z" opacity="0.4"/>
          </svg>
        </div>

        <div class="relative z-10 pl-2">
          <div class="w-6 h-0.5 bg-[#366649] mb-3 rounded-full"></div>
          <p class="text-xs font-bold text-[#1f3d2a] leading-tight">
            Safer Devices.
          </p>
          <p class="text-xs font-bold text-[#1f3d2a] leading-tight">
            Healthier Tomorrow.
          </p>
        </div>
      </div>
    </aside>

    <!-- Overlay for mobile sidebar -->
    <div
      v-if="isMobileSidebarOpen"
      @click="isMobileSidebarOpen = false"
      class="fixed inset-0 bg-[#172a1f]/40 backdrop-blur-2xs z-40 lg:hidden"
    ></div>

    <!-- MAIN APP CONTAINER -->
    <div class="flex-1 flex flex-col min-w-0 z-10">
      <!-- TOP NAVIGATION BAR (as shown in Image 1) -->
      <header class="bg-white border-b border-[#e4ede6] h-16 flex items-center justify-between px-4 sm:px-8 shrink-0">
        <!-- Left: Mobile toggle + Global Search input in light pill -->
        <div class="flex items-center gap-3 flex-1 max-w-xl">
          <button
            type="button"
            @click="isMobileSidebarOpen = true"
            class="lg:hidden text-[#4e6858] hover:text-[#172a1f] p-2 rounded-lg hover:bg-[#edf5ef]"
          >
            <Menu class="w-5 h-5" />
          </button>

          <!-- Top Search Input (pill shape) -->
          <div class="relative w-full max-w-md hidden sm:block">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71887a]">
              <Search class="w-4 h-4" />
            </div>
            <input
              type="text"
              v-model="globalSearch"
              placeholder="Search establishment, license, province..."
              class="w-full pl-10 pr-4 py-2 bg-[#f0f4f1] hover:bg-[#e9efe9] focus:bg-white text-xs sm:text-sm text-[#172a1f] placeholder:text-[#7f9587] rounded-full border border-transparent focus:border-[#366649] focus:outline-hidden transition-all duration-150"
            />
          </div>
        </div>

        <!-- Right: Notifications & User Profile (as shown in Image 1) -->
        <div class="flex items-center gap-4">
          <!-- Notification Bell with unread dot -->
          <button
            type="button"
            class="relative p-2 text-[#4e6858] hover:text-[#172a1f] hover:bg-[#edf5ef] rounded-full transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell class="w-4 h-4" />
            <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#366649] ring-2 ring-white"></span>
          </button>

          <div class="h-6 w-px bg-[#e2ebe4] hidden sm:block"></div>

          <!-- User Profile Dropdown -->
          <div class="flex items-center gap-3 cursor-pointer group">
            <div class="w-9 h-9 rounded-full bg-[#28573a] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              JD
            </div>
            <div class="hidden sm:block text-left">
              <p class="text-xs font-bold text-[#172a1f] leading-tight group-hover:text-[#28573a] transition-colors">
                John Doe
              </p>
              <p class="text-[10px] text-[#698072] leading-tight">
                Regulatory Officer
              </p>
            </div>
            <ChevronDown class="w-3.5 h-3.5 text-[#728a7c] group-hover:text-[#172a1f] transition-colors hidden sm:block" />
          </div>
        </div>
      </header>

      <!-- MAIN PAGE CONTENT -->
      <main class="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        <!-- Page Title & Primary Header Row (as shown in Image 1) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p class="text-[11px] font-bold tracking-wider text-[#366649] uppercase">
              FDA Regulatory Portal
            </p>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#172a1f] tracking-tight mt-0.5">
              Establishment Management
            </h1>
            <p class="text-xs sm:text-sm text-[#5a7465] mt-1">
              Manage establishments, licenses, inspections, and regulatory information.
            </p>
          </div>

          <!-- + Add Establishment Button (forest green rounded button) -->
          <div>
            <button
              type="button"
              id="add-establishment-btn"
              @click="openAddModal"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#366649] hover:bg-[#2b533a] active:bg-[#22442e] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer active:scale-98"
            >
              <Plus class="w-4 h-4" />
              <span>+ Add Establishment</span>
            </button>
          </div>
        </div>

        <!-- 4 Summary Statistics Cards -->
        <section aria-label="Establishment Statistics">
          <SkeletonStats v-if="isLoading" />
          <StatisticsCards v-else :stats="stats" />
        </section>

        <!-- Search Toolbar with CAR Provinces -->
        <section aria-label="Establishment Filters">
          <SearchToolbar
            :filters="filters"
            @update:filters="(f) => { Object.assign(filters, f); currentPage = 1; }"
            @reset="resetFilters"
          />
        </section>

        <!-- Table Card with 24 Columns, Export CSV, and Reset Demo -->
        <section aria-label="Establishment Table">
          <EstablishmentTable
            :establishments="paginatedEstablishments"
            :total-filtered-count="filteredEstablishments.length"
            :is-loading="isLoading"
            :start-index="(currentPage - 1) * pageSize"
            @view="openViewModal"
            @edit="openEditModal"
            @delete="openDeleteModal"
            @add="openAddModal"
            @export="exportToCSV"
            @reset-demo="handleResetDemoData"
          />

          <!-- Pagination Controls -->
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
      <footer class="border-t border-[#e2ebe4] bg-white py-4 px-6 text-xs text-[#637d6e] mt-auto">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Republic of the Philippines • Food and Drug Administration. All rights reserved.</p>
          <p class="text-[11px] text-[#869c90]">Cordillera Administrative Region (CAR) Regulatory Oversight</p>
        </div>
      </footer>
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

    <!-- Toasts -->
    <ToastNotification
      :toasts="toasts"
      @dismiss="removeToast"
    />
  </div>
</template>
