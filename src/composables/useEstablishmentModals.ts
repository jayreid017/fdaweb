import { ref } from 'vue';
import type { Establishment, ConfirmationMode } from '../types/establishment';

export function useEstablishmentModals() {
  // Form Modal state
  const isFormModalOpen = ref<boolean>(false);
  const formModalTarget = ref<Establishment | null>(null);

  // View Modal state
  const isViewModalOpen = ref<boolean>(false);
  const viewModalTarget = ref<Establishment | null>(null);

  // Confirmation Modal state (Soft Delete / Restore / Permanent Delete)
  const isConfirmationModalOpen = ref<boolean>(false);
  const confirmationTarget = ref<Establishment | null>(null);
  const confirmationMode = ref<ConfirmationMode>('trash');
  const isProcessingConfirmation = ref<boolean>(false);

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
    confirmationTarget.value = item;
    confirmationMode.value = 'trash';
    isConfirmationModalOpen.value = true;
  }

  function openRestoreModal(item: Establishment) {
    confirmationTarget.value = item;
    confirmationMode.value = 'restore';
    isConfirmationModalOpen.value = true;
  }

  function openPermanentDeleteModal(item: Establishment) {
    confirmationTarget.value = item;
    confirmationMode.value = 'permanent';
    isConfirmationModalOpen.value = true;
  }

  function closeConfirmationModal() {
    isConfirmationModalOpen.value = false;
    confirmationTarget.value = null;
  }

  return {
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
  };
}
