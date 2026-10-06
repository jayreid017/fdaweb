<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import StatisticsCards from '../StatisticsCards.vue';
import SearchToolbar from '../SearchToolbar.vue';
import EstablishmentTable from '../EstablishmentTable.vue';
import Pagination from '../Pagination.vue';
import SkeletonStats from '../../common/SkeletonStats.vue';
import type { Establishment, FilterState, SummaryStats } from '../../../types/establishment';

defineProps<{
  establishments: Establishment[];
  paginatedEstablishments: Establishment[];
  filteredCount: number;
  totalCount: number;
  stats: SummaryStats;
  isLoading: boolean;
  isExporting: boolean;
  highlightedId: string | null;
  filters: FilterState;
  activeStatFilter: 'all' | 'active' | 'expired' | 'upcoming';
  currentPage: number;
  pageSize: number;
}>();

const emit = defineEmits<{
  (e: 'add'): void;
  (e: 'view', item: Establishment): void;
  (e: 'edit', item: Establishment): void;
  (e: 'delete', item: Establishment): void;
  (e: 'export', format: 'xlsx' | 'csv'): void;
  (e: 'refresh'): void;
  (e: 'resetFilters'): void;
  (e: 'update:filters', filters: FilterState): void;
  (e: 'update:activeStatFilter', filter: 'all' | 'active' | 'expired' | 'upcoming'): void;
  (e: 'update:currentPage', page: number): void;
  (e: 'update:pageSize', size: number): void;
}>();
</script>

<template>
  <div class="space-y-7">
    <!-- Page Title & Header Actions -->
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
      <div class="flex items-center gap-2.5 self-start sm:self-auto">
        <button
          type="button"
          id="add-establishment-btn"
          @click="emit('add')"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-[#1d4b35] hover:bg-[#153a29] active:bg-[#102e20] text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-[0_8px_20px_-4px_rgba(29,75,53,0.38)] hover:shadow-lg transition-all duration-150 cursor-pointer"
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
        @filter-change="(f) => emit('update:activeStatFilter', f)"
      />
    </section>

    <!-- Search Toolbar -->
    <section aria-label="Establishment Filters">
      <SearchToolbar
        :filters="filters"
        @update:filters="(f) => emit('update:filters', f)"
        @reset="emit('resetFilters')"
      />
    </section>

    <!-- Table & Pagination -->
    <section aria-label="Establishment Table">
      <EstablishmentTable
        :establishments="paginatedEstablishments"
        :total-filtered-count="filteredCount"
        :total-count="totalCount"
        :is-loading="isLoading"
        :is-exporting="isExporting"
        :start-index="(currentPage - 1) * pageSize"
        :highlighted-id="highlightedId"
        @view="(item) => emit('view', item)"
        @edit="(item) => emit('edit', item)"
        @delete="(item) => emit('delete', item)"
        @add="emit('add')"
        @export="(fmt) => emit('export', fmt)"
        @refresh="emit('refresh')"
      />

      <Pagination
        v-if="!isLoading && filteredCount > 0"
        :current-page="currentPage"
        :page-size="pageSize"
        :total-items="filteredCount"
        @update:current-page="(p) => emit('update:currentPage', p)"
        @update:page-size="(s) => emit('update:pageSize', s)"
      />
    </section>
  </div>
</template>
