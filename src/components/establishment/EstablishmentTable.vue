<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Establishment } from '../../types/establishment';
import EstablishmentRow from './EstablishmentRow.vue';
import SkeletonTable from '../common/SkeletonTable.vue';
import { 
  Landmark, 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown, 
  Plus, 
  Inbox, 
  Download, 
  RotateCw 
} from 'lucide-vue-next';

const props = defineProps<{
  establishments: Establishment[];
  totalFilteredCount: number;
  totalCount?: number;
  isLoading: boolean;
  startIndex: number;
}>();

const emit = defineEmits<{
  (e: 'view', item: Establishment): void;
  (e: 'edit', item: Establishment): void;
  (e: 'delete', item: Establishment): void;
  (e: 'add'): void;
  (e: 'export'): void;
  (e: 'refresh'): void;
}>();

type SortKey = 'establishment_name' | 'next_inspection' | 'status' | '';
const sortKey = ref<SortKey>('');
const sortOrder = ref<'asc' | 'desc'>('asc');

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
}

const sortedList = computed(() => {
  if (!sortKey.value) return props.establishments;

  return [...props.establishments].sort((a, b) => {
    const aVal = a[sortKey.value as keyof Establishment] || '';
    const bVal = b[sortKey.value as keyof Establishment] || '';

    if (sortKey.value === 'next_inspection') {
      const aTime = new Date((aVal as string) || '').getTime() || 0;
      const bTime = new Date((bVal as string) || '').getTime() || 0;
      return sortOrder.value === 'asc' ? aTime - bTime : bTime - aTime;
    }

    const cmp = String(aVal).localeCompare(String(bVal));
    return sortOrder.value === 'asc' ? cmp : -cmp;
  });
});
</script>

<template>
  <div class="bg-[#FFFEFB] rounded-3xl border border-[#ecebe4] shadow-xs overflow-hidden flex flex-col">
    <!-- Table Header Toolbar -->
    <div class="px-5 sm:px-6 py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFEFB]">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-[#e8f1ec] text-[#2c5b41] flex items-center justify-center shrink-0">
          <Landmark class="w-4.5 h-4.5 stroke-[1.8]" />
        </div>
        <div class="flex items-baseline flex-wrap gap-2">
          <h2 class="font-serif font-bold text-xl sm:text-2xl text-[#0f241a] tracking-tight">
            {{ totalFilteredCount.toLocaleString() }} Establishments
          </h2>
          <span class="text-xs sm:text-sm text-[#788c80] font-normal">
            <template v-if="totalCount && totalFilteredCount < totalCount">
              Filtered from {{ totalCount.toLocaleString() }} total records
            </template>
            <template v-else>
              All {{ totalFilteredCount.toLocaleString() }} records loaded from Supabase
            </template>
          </span>
        </div>
      </div>

      <!-- Right Top Actions: Export CSV and Refresh -->
      <div class="flex items-center gap-2.5 self-end sm:self-auto">
        <button
          type="button"
          @click="emit('export')"
          class="inline-flex items-center gap-2 px-4 py-2 bg-[#f9f8f5] hover:bg-[#edeae1] text-[#1c2d22] text-xs font-semibold rounded-xl border border-[#e5e3d8] transition-colors cursor-pointer shadow-2xs"
          title="Export records to CSV"
        >
          <Download class="w-4 h-4 stroke-[1.8]" />
          <span>Export CSV</span>
        </button>
        <button
          type="button"
          @click="emit('refresh')"
          class="inline-flex items-center gap-2 px-4 py-2 bg-[#f9f8f5] hover:bg-[#edeae1] text-[#1c2d22] text-xs font-semibold rounded-xl border border-[#e5e3d8] transition-colors cursor-pointer shadow-2xs"
          title="Refresh data from Supabase"
        >
          <RotateCw class="w-4 h-4 stroke-[1.8]" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Table Container with Horizontal Scroll -->
    <div class="overflow-x-auto relative w-full scroll-smooth">
      <!-- Loading state -->
      <SkeletonTable v-if="isLoading" />

      <!-- Empty state -->
      <div
        v-else-if="establishments.length === 0"
        class="py-16 px-4 flex flex-col items-center justify-center text-center space-y-3"
      >
        <div class="w-14 h-14 rounded-2xl bg-[#edf4ee] flex items-center justify-center text-[#5c7a67]">
          <Inbox class="w-7 h-7" />
        </div>
        <div class="max-w-sm space-y-1">
          <h3 class="text-base font-bold text-[#172a1f]">No establishments found</h3>
          <p class="text-xs text-[#667e70]">
            There are currently no records matching your criteria.
          </p>
        </div>
        <button
          type="button"
          @click="emit('add')"
          class="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#1d4b35] hover:bg-[#153a29] text-white shadow-xs transition-colors cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>Add establishment</span>
        </button>
      </div>

      <!-- Main Data Table -->
      <table v-else class="w-full text-left border-collapse table-auto">
        <thead class="bg-[#E8F0EA]/80">
          <tr class="text-xs font-semibold text-[#4f6456] border-b border-[#dfe8e1]">
            <!-- No. column -->
            <th scope="col" class="w-12 px-3 py-3.5 text-center text-xs font-semibold text-[#4f6456] select-none">
              No
            </th>

            <!-- 1. Establishment name -->
            <th 
              scope="col" 
              class="px-3.5 py-3.5 cursor-pointer hover:text-[#172a1f] transition-colors"
              @click="toggleSort('establishment_name')"
            >
              <div class="flex items-center gap-1.5">
                <span>Establishment name</span>
                <span class="text-[#728a7c]">
                  <ChevronUp v-if="sortKey === 'establishment_name' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#1d4b35]" />
                  <ChevronDown v-else-if="sortKey === 'establishment_name' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#1d4b35]" />
                  <ChevronsUpDown v-else class="w-3.5 h-3.5 opacity-60" />
                </span>
              </div>
            </th>

            <!-- 2. Product type -->
            <th scope="col" class="px-3 py-3.5 whitespace-nowrap">Product type</th>

            <!-- 3. LTO number -->
            <th scope="col" class="px-3 py-3.5 whitespace-nowrap">LTO number</th>

            <!-- 4. Status of last inspection -->
            <th scope="col" class="px-3 py-3.5 whitespace-nowrap">Status of last inspection</th>

            <!-- 5. Next inspection -->
            <th 
              scope="col" 
              class="px-3 py-3.5 whitespace-nowrap cursor-pointer hover:text-[#172a1f] transition-colors"
              @click="toggleSort('next_inspection')"
            >
              <div class="flex items-center gap-1.5">
                <span>Next inspection</span>
                <span class="text-[#728a7c]">
                  <ChevronUp v-if="sortKey === 'next_inspection' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#1d4b35]" />
                  <ChevronDown v-else-if="sortKey === 'next_inspection' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#1d4b35]" />
                  <ChevronsUpDown v-else class="w-3.5 h-3.5 opacity-60" />
                </span>
              </div>
            </th>

            <!-- 6. Status -->
            <th 
              scope="col" 
              class="px-3 py-3.5 whitespace-nowrap cursor-pointer hover:text-[#172a1f] transition-colors"
              @click="toggleSort('status')"
            >
              <div class="flex items-center gap-1.5">
                <span>Status</span>
                <span class="text-[#728a7c]">
                  <ChevronUp v-if="sortKey === 'status' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#1d4b35]" />
                  <ChevronDown v-else-if="sortKey === 'status' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#1d4b35]" />
                  <ChevronsUpDown v-else class="w-3.5 h-3.5 opacity-60" />
                </span>
              </div>
            </th>

            <!-- 7. Actions -->
            <th 
              scope="col" 
              class="px-3.5 py-3.5 text-right whitespace-nowrap"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#edf3ee] bg-[#FFFEFB]">
          <EstablishmentRow
            v-for="(item, idx) in sortedList"
            :key="item.id"
            :establishment="item"
            :index="startIndex + idx + 1"
            @view="(item) => emit('view', item)"
            @edit="(item) => emit('edit', item)"
            @delete="(item) => emit('delete', item)"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>
