<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { AuthService } from '../../services/authService';
import { EstablishmentService } from '../../services/establishmentService';
import { exportToExcel, exportToCSV } from '../../services/exportService';
import type { EstablishmentFormData } from '../../types/establishment';

// Composables
import { useToast } from '../../composables/useToast';
import { useEstablishments } from '../../composables/useEstablishments';
import { useTrash } from '../../composables/useTrash';
import { useEstablishmentModals } from '../../composables/useEstablishmentModals';

// Layout Components
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '../layout/AppSidebar.vue';
import AppHeader from '../layout/AppHeader.vue';
import AppFooter from '../layout/AppFooter.vue';

// Views
import EstablishmentListView from './views/EstablishmentListView.vue';
import TrashView from './views/TrashView.vue';
import SettingsView from './views/SettingsView.vue';

// Modals & Notifications
import EstablishmentFormModal from './EstablishmentFormModal.vue';
import EstablishmentViewModal from './EstablishmentViewModal.vue';
import DeleteConfirmationModal from './DeleteConfirmationModal.vue';
import ToastNotification from '../common/ToastNotification.vue';

const emit = defineEmits<{
  (e: 'logout'): void;
}>();

const router = useRouter();
const route = useRoute();

// Composables initialization
const { toasts, addToast, removeToast } = useToast();

const {
  establishments,
  isLoading,
  globalSearch,
  filters,
  activeStatFilter,
  currentPage,
  pageSize,
  highlightedEstablishmentId,
  setHighlightedEstablishment,
  filteredEstablishments,
  paginatedEstablishments,
  stats,
  loadData,
  resetFilters
} = useEstablishments();

const {
  trashList,
  trashCount,
  isTrashLoading,
  hasLoadedTrash,
  loadTrashData,
  loadTrashCount
} = useTrash();

const {
  isFormModalOpen,
  formModalTarget,
  openAddModal,
  openEditModal,
  isViewModalOpen,
  viewModalTarget,
  openViewModal,
  handleViewEdit,
  isConfirmationModalOpen,
  confirmationTarget,
  confirmationMode,
  isProcessingConfirmation,
  openDeleteModal,
  openRestoreModal,
  openPermanentDeleteModal,
  closeConfirmationModal
} = useEstablishmentModals();

// Navigation & Export states
const activeNav = ref<string>('Establishment Management');
const isExporting = ref<boolean>(false);

async function handleSignOut() {
  await AuthService.logout();
  emit('logout');
  router.push('/login');
}

function syncNavFromRoute() {
  if (route.path === '/trash') {
    activeNav.value = 'Trash';
    if (!hasLoadedTrash.value) {
      loadTrashData();
    }
  } else if (route.path === '/settings' || route.path === '/settings/password' || route.path === '/change-password') {
    activeNav.value = 'Settings';
  } else if (route.path === '/' || route.path === '/establishments') {
    activeNav.value = 'Establishment Management';
  }
}

function navigateToNav(navName: string) {
  if (navName === 'Trash') {
    activeNav.value = 'Trash';
    if (route.path !== '/trash') {
      router.push('/trash');
    }
    if (!hasLoadedTrash.value) {
      loadTrashData();
    }
  } else if (navName === 'Settings' || navName === 'Reset Password') {
    activeNav.value = 'Settings';
    if (route.path !== '/settings') {
      router.push('/settings');
    }
  } else if (navName === 'Establishment Management' || navName === 'Home') {
    activeNav.value = navName;
    if (route.path !== '/') {
      router.push('/');
    }
  } else {
    activeNav.value = navName;
  }
}

watch(
  () => route.path,
  () => {
    syncNavFromRoute();
  }
);

// Save handler (Create / Update)
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
      setHighlightedEstablishment(created.id);
      addToast('success', 'Establishment created successfully.', `"${created.establishment_name}" has been registered.`);
    }

    isFormModalOpen.value = false;
    formModalTarget.value = null;
  } catch (error: any) {
    console.error(error);
    addToast('error', 'Unable to save establishment.', error.message || 'Please check the required fields.');
  }
}

// Confirmation Action handler (Soft Delete / Restore / Permanent Delete)
async function handleConfirmAction() {
  if (!confirmationTarget.value || isProcessingConfirmation.value) return;

  const target = confirmationTarget.value;
  const mode = confirmationMode.value;
  isProcessingConfirmation.value = true;

  try {
    if (mode === 'trash') {
      const updated = await EstablishmentService.moveToTrash(target.id);
      establishments.value = establishments.value.filter((e) => e.id !== target.id);
      trashCount.value++;

      if (hasLoadedTrash.value) {
        trashList.value = [updated, ...trashList.value.filter((t) => t.id !== target.id)];
      }

      const maxPage = Math.ceil(filteredEstablishments.value.length / pageSize.value) || 1;
      if (currentPage.value > maxPage) {
        currentPage.value = maxPage;
      }

      addToast('success', 'Moved to Trash', 'Establishment moved to Trash.');
    } else if (mode === 'restore') {
      const restored = await EstablishmentService.restore(target.id);
      trashList.value = trashList.value.filter((e) => e.id !== target.id);
      trashCount.value = Math.max(0, trashCount.value - 1);
      establishments.value = [restored, ...establishments.value.filter((e) => e.id !== target.id)];

      addToast('success', 'Restored Successfully', 'Establishment restored successfully.');
    } else if (mode === 'permanent') {
      await EstablishmentService.permanentDelete(target.id);
      trashList.value = trashList.value.filter((e) => e.id !== target.id);
      trashCount.value = Math.max(0, trashCount.value - 1);

      addToast('success', 'Permanently Deleted', 'Establishment permanently deleted.');
    }

    closeConfirmationModal();
  } catch (error: any) {
    console.error(`Error during ${mode} operation:`, error);
    if (mode === 'trash') {
      addToast('error', 'Error', 'Failed to move establishment to Trash. Please try again.');
    } else if (mode === 'restore') {
      addToast('error', 'Error', 'Failed to restore establishment. Please try again.');
    } else if (mode === 'permanent') {
      addToast('error', 'Error', 'Failed to permanently delete establishment. Please try again.');
    }
  } finally {
    isProcessingConfirmation.value = false;
  }
}

async function handleRefreshData() {
  await Promise.all([loadData(), loadTrashCount()]);
  addToast('info', 'Data Refreshed', 'Latest records fetched from Supabase.');
}

async function handleExport(format: 'xlsx' | 'csv') {
  if (filteredEstablishments.value.length === 0) {
    addToast('warning', 'No Records to Export', 'There are no establishments matching the current filters to export.');
    return;
  }

  isExporting.value = true;
  try {
    if (format === 'xlsx') {
      const filename = await exportToExcel(filteredEstablishments.value);
      addToast(
        'success',
        'Excel Export Complete',
        `Exported ${filteredEstablishments.value.length.toLocaleString()} record${filteredEstablishments.value.length === 1 ? '' : 's'} as ${filename}.`
      );
    } else {
      const filename = await exportToCSV(filteredEstablishments.value);
      addToast(
        'success',
        'CSV Export Complete',
        `Exported ${filteredEstablishments.value.length.toLocaleString()} record${filteredEstablishments.value.length === 1 ? '' : 's'} as ${filename}.`
      );
    }
  } catch (err: any) {
    console.error('Export error:', err);
    addToast('error', 'Export Failed', err.message || 'An error occurred while generating the export file.');
  } finally {
    isExporting.value = false;
  }
}

onMounted(async () => {
  syncNavFromRoute();
  await Promise.all([loadData(), loadTrashCount()]);
  if (route.path === '/trash') {
    await loadTrashData();
  }
});
</script>

<template>
  <SidebarProvider>
    <div class="flex min-h-screen w-full text-[#172a1f] relative bg-transparent">
      <!-- Modular Sidebar -->
      <AppSidebar
        :active-nav="activeNav"
        :trash-count="trashCount"
        @navigate="navigateToNav"
      />

      <!-- Main Inset Area -->
      <SidebarInset class="flex flex-col min-h-screen bg-transparent">
        <!-- Modular Header -->
        <AppHeader
          :active-nav="activeNav"
          v-model:global-search="globalSearch"
          @logout="handleSignOut"
        />

        <!-- Main Content Area -->
        <main class="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-7">
          <!-- View 1: Trash -->
          <TrashView
            v-if="activeNav === 'Trash'"
            :trash-list="trashList"
            :trash-count="trashCount"
            :is-trash-loading="isTrashLoading"
            @back="navigateToNav('Establishment Management')"
            @restore="openRestoreModal"
            @permanent-delete="openPermanentDeleteModal"
            @view="openViewModal"
            @refresh="loadTrashData"
          />

          <!-- View 2: Settings & Reset Password -->
          <SettingsView
            v-else-if="activeNav === 'Settings'"
            @back="navigateToNav('Establishment Management')"
            @toast="(type, title, msg) => addToast(type, title, msg || '')"
          />

          <!-- View 3: Active Establishments -->
          <EstablishmentListView
            v-else
            :establishments="establishments"
            :paginated-establishments="paginatedEstablishments"
            :filtered-count="filteredEstablishments.length"
            :total-count="establishments.length"
            :stats="stats"
            :is-loading="isLoading"
            :is-exporting="isExporting"
            :highlighted-id="highlightedEstablishmentId"
            :filters="filters"
            :active-stat-filter="activeStatFilter"
            :current-page="currentPage"
            :page-size="pageSize"
            @add="openAddModal"
            @view="openViewModal"
            @edit="openEditModal"
            @delete="openDeleteModal"
            @export="handleExport"
            @refresh="handleRefreshData"
            @reset-filters="resetFilters"
            @update:filters="(f) => { Object.assign(filters, f); currentPage = 1; }"
            @update:active-stat-filter="(f) => { activeStatFilter = f; currentPage = 1; }"
            @update:current-page="(p) => currentPage = p"
            @update:page-size="(s) => { pageSize = s; currentPage = 1; }"
          />
        </main>

        <!-- Modular Footer -->
        <AppFooter />
      </SidebarInset>
    </div>

    <!-- Modals & Overlays -->
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
      :is-open="isConfirmationModalOpen"
      :establishment="confirmationTarget"
      :mode="confirmationMode"
      :is-processing="isProcessingConfirmation"
      @close="closeConfirmationModal"
      @confirm="handleConfirmAction"
    />

    <ToastNotification
      :toasts="toasts"
      @dismiss="removeToast"
    />
  </SidebarProvider>
</template>
