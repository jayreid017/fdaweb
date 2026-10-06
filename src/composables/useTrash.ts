import { ref } from 'vue';
import type { Establishment } from '../types/establishment';
import { EstablishmentService } from '../services/establishmentService';
import { useToast } from './useToast';

export function useTrash() {
  const { addToast } = useToast();

  const trashList = ref<Establishment[]>([]);
  const trashCount = ref<number>(0);
  const isTrashLoading = ref<boolean>(false);
  const hasLoadedTrash = ref<boolean>(false);

  async function loadTrashData() {
    isTrashLoading.value = true;
    hasLoadedTrash.value = true;
    try {
      const data = await EstablishmentService.getTrash();
      trashList.value = data;
      trashCount.value = data.length;
    } catch (e: any) {
      console.error('Error fetching trash records from Supabase:', e);
      addToast('error', 'Error loading Trash', e.message || 'Failed to retrieve deleted establishments from Supabase.');
    } finally {
      isTrashLoading.value = false;
    }
  }

  async function loadTrashCount() {
    try {
      trashCount.value = await EstablishmentService.getTrashCount();
    } catch (e: any) {
      console.error('Error fetching trash count:', e);
    }
  }

  return {
    trashList,
    trashCount,
    isTrashLoading,
    hasLoadedTrash,
    loadTrashData,
    loadTrashCount
  };
}
