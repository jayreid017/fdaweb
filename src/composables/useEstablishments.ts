import { ref, reactive, computed, onBeforeUnmount } from 'vue';
import type { Establishment, FilterState, SummaryStats } from '../types/establishment';
import { EstablishmentService } from '../services/establishmentService';
import { useToast } from './useToast';

const NEW_HIGHLIGHT_DURATION = 5000;

export function useEstablishments() {
  const { addToast } = useToast();

  const establishments = ref<Establishment[]>([]);
  const isLoading = ref<boolean>(true);
  const globalSearch = ref<string>('');

  const filters = reactive<FilterState>({
    search: '',
    product_type: '',
    province: '',
    city_municipality: '',
    status: '',
    status_last_inspection: '',
  });

  const activeStatFilter = ref<'all' | 'active' | 'expired' | 'upcoming'>('all');
  const currentPage = ref<number>(1);
  const pageSize = ref<number>(10);

  const highlightedEstablishmentId = ref<string | null>(null);
  let highlightTimer: ReturnType<typeof setTimeout> | null = null;

  function setHighlightedEstablishment(id: string) {
    if (highlightTimer) {
      clearTimeout(highlightTimer);
      highlightTimer = null;
    }
    highlightedEstablishmentId.value = id;
    highlightTimer = setTimeout(() => {
      highlightedEstablishmentId.value = null;
      highlightTimer = null;
    }, NEW_HIGHLIGHT_DURATION);
  }

  onBeforeUnmount(() => {
    if (highlightTimer) {
      clearTimeout(highlightTimer);
      highlightTimer = null;
    }
  });

  async function loadData() {
    isLoading.value = true;
    try {
      const data = await EstablishmentService.getAll();
      establishments.value = data;
    } catch (e: any) {
      console.error('Error fetching active establishments:', e);
      addToast('error', 'Error loading data', e.message || 'Failed to retrieve establishment records from Supabase.');
    } finally {
      setTimeout(() => {
        isLoading.value = false;
      }, 200);
    }
  }

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

      // Province
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

  const paginatedEstablishments = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredEstablishments.value.slice(start, start + pageSize.value);
  });

  const stats = computed<SummaryStats>(() => {
    return EstablishmentService.calculateStats(establishments.value);
  });

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

  return {
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
  };
}
