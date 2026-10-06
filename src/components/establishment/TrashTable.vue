<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Establishment } from '../../types/establishment';
import SkeletonTable from '../common/SkeletonTable.vue';
import Pagination from './Pagination.vue';
import {
  Trash2,
  RotateCcw,
  RotateCw,
  Search,
  MapPin,
  Calendar,
  Clock,
  Eye,
  X
} from 'lucide-vue-next';

const props = defineProps<{
  establishments: Establishment[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'restore', item: Establishment): void;
  (e: 'permanent-delete', item: Establishment): void;
  (e: 'view', item: Establishment): void;
  (e: 'refresh'): void;
}>();

// Search filter inside Trash
const searchQuery = ref<string>('');

// Pagination state
const currentPage = ref<number>(1);
const pageSize = ref<number>(10);

const filteredList = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return props.establishments;

  return props.establishments.filter((item) => {
    return (
      item.establishment_name?.toLowerCase().includes(q) ||
      item.lto_number?.toLowerCase().includes(q) ||
      item.product_type?.toLowerCase().includes(q) ||
      item.address?.toLowerCase().includes(q) ||
      item.province?.toLowerCase().includes(q) ||
      item.city_municipality?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q)
    );
  });
});

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr || !dateStr.trim()) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function formatDateOnly(dateStr?: string | null): string {
  if (!dateStr || !dateStr.trim()) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function clearSearch() {
  searchQuery.value = '';
  currentPage.value = 1;
}
</script>

<template>
  <div class="bg-[#FFFEFB] rounded-3xl border border-[#ecebe4] shadow-xs overflow-hidden flex flex-col">
    <!-- Trash Table Header / Toolbar -->
    <div class="px-5 sm:px-6 py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFEFB] border-b border-[#f0eee6]">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-[#faeae8] text-[#b83d3b] flex items-center justify-center shrink-0">
          <Trash2 class="w-4.5 h-4.5 stroke-[1.8]" />
        </div>
        <div>
          <h2 class="font-serif font-bold text-xl sm:text-2xl text-[#0f241a] tracking-tight">
            {{ filteredList.length.toLocaleString() }} Deleted Establishment{{ filteredList.length === 1 ? '' : 's' }}
          </h2>
          <p class="text-xs text-[#788c80] font-normal">
            Establishments in Trash can be restored or permanently removed.
          </p>
        </div>
      </div>

      <!-- Quick Search & Refresh -->
      <div class="flex items-center gap-2.5 self-stretch sm:self-auto flex-wrap sm:flex-nowrap">
        <div class="relative flex-1 sm:w-64">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8a9b91]">
            <Search class="w-3.5 h-3.5 stroke-[1.8]" />
          </div>
          <input
            type="text"
            v-model="searchQuery"
            @input="currentPage = 1"
            placeholder="Search deleted records..."
            class="w-full pl-9 pr-8 py-1.5 bg-[#fbfaf6] text-xs text-[#1e2e25] placeholder:text-[#8a9b91] rounded-xl border border-[#dfe5df] shadow-2xs focus:outline-hidden focus:border-[#7e855a] focus:ring-1 focus:ring-[#7e855a]/30 transition-all"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="clearSearch"
            class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#8a9b91] hover:text-[#1e2e25] cursor-pointer"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          @click="emit('refresh')"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f9f8f5] hover:bg-[#edeae1] text-[#1c2d22] text-xs font-semibold rounded-xl border border-[#e5e3d8] transition-colors cursor-pointer shadow-2xs shrink-0"
          title="Refresh Trash records"
        >
          <RotateCw class="w-3.5 h-3.5 stroke-[1.8]" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div class="overflow-x-auto relative w-full scroll-smooth">
      <!-- Loading state -->
      <SkeletonTable v-if="isLoading" />

      <!-- Empty state: When Trash has 0 items -->
      <div
        v-else-if="establishments.length === 0"
        class="py-16 px-4 flex flex-col items-center justify-center text-center space-y-3"
      >
        <div class="w-14 h-14 rounded-2xl bg-[#f4f2ea] flex items-center justify-center text-[#7a8c80]">
          <Trash2 class="w-7 h-7 stroke-[1.6]" />
        </div>
        <div class="space-y-1">
          <h3 class="text-base font-semibold text-[#182c20]">Trash is empty</h3>
          <p class="text-xs sm:text-sm text-[#73887c] max-w-sm">
            Deleted establishments will appear here.
          </p>
        </div>
      </div>

      <!-- No match for search filter -->
      <div
        v-else-if="filteredList.length === 0"
        class="py-12 px-4 flex flex-col items-center justify-center text-center space-y-2"
      >
        <p class="text-sm font-semibold text-[#182c20]">No matching records found in Trash</p>
        <p class="text-xs text-[#73887c]">
          No deleted establishments matched "<span class="font-medium text-[#112419]">{{ searchQuery }}</span>".
        </p>
        <button
          type="button"
          @click="clearSearch"
          class="mt-2 px-3 py-1 bg-[#edeae1] text-[#1c2d22] text-xs font-semibold rounded-lg hover:bg-[#e0ddd2] transition-colors cursor-pointer"
        >
          Clear Search
        </button>
      </div>

      <!-- Table Content -->
      <table v-else class="w-full text-left border-collapse table-auto">
        <thead>
          <tr class="border-b border-[#e5ebe6] bg-[#F7F5EE] text-[11px] font-semibold text-[#4e6355] tracking-wider uppercase select-none">
            <th class="w-12 px-3 py-3.5 text-center">#</th>
            <th class="px-3.5 py-3.5">Establishment Name & Location</th>
            <th class="px-3 py-3.5">Product Type</th>
            <th class="px-3 py-3.5">LTO Number</th>
            <th class="px-3 py-3.5">Status</th>
            <th class="px-3 py-3.5">Deleted At</th>
            <th class="px-3 py-3.5">Restored At</th>
            <th class="px-3.5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#edf3ee]">
          <tr
            v-for="(item, idx) in paginatedList"
            :key="item.id"
            @click="emit('view', item)"
            class="hover:bg-[#faeae8]/35 transition-colors duration-150 border-b border-[#edf3ee] text-xs text-[#203629] group cursor-pointer"
          >
            <!-- No. -->
            <td class="w-12 px-3 py-4 text-center font-mono text-xs text-[#718579] font-medium select-none">
              {{ (currentPage - 1) * pageSize + idx + 1 }}
            </td>

            <!-- Establishment Name & Address -->
            <td class="px-3.5 py-4 max-w-65 lg:max-w-xs">
              <div class="flex flex-col min-w-0">
                <span
                  class="truncate font-semibold text-xs sm:text-[13px] text-[#111827] group-hover:text-rose-950 transition-colors"
                  :title="item.establishment_name || '—'"
                >
                  {{ item.establishment_name || '—' }}
                </span>
                <div
                  v-if="item.city_municipality || item.province || item.address"
                  class="flex items-center gap-1.5 text-[11.5px] text-[#6b7280] font-normal mt-1 truncate"
                >
                  <MapPin class="w-3.5 h-3.5 shrink-0 text-[#8fa093] stroke-[1.6]" />
                  <span class="truncate">
                    <template v-if="item.city_municipality && item.province">
                      {{ item.city_municipality }}, {{ item.province }}
                    </template>
                    <template v-else>
                      {{ item.address || item.city_municipality || item.province }}
                    </template>
                  </span>
                </div>
              </div>
            </td>

            <!-- Product Type -->
            <td class="px-3 py-4 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eae7de] text-[#3d4d42]">
                {{ item.product_type || '—' }}
              </span>
            </td>

            <!-- LTO Number -->
            <td class="px-3 py-4 whitespace-nowrap">
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium text-[#4b5d52] bg-[#f2efe6]">
                {{ item.lto_number || '—' }}
              </span>
            </td>

            <!-- Status -->
            <td class="px-3 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                :class="item.status?.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-stone-100 text-stone-700 border border-stone-200'"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="item.status?.toLowerCase() === 'active' ? 'bg-emerald-600' : 'bg-stone-500'"
                ></span>
                <span>{{ item.status || 'Inactive' }}</span>
              </span>
            </td>

            <!-- Deleted At -->
            <td class="px-3 py-4 whitespace-nowrap">
              <div class="flex items-center gap-1.5 text-rose-800 text-xs font-medium">
                <Clock class="w-3.5 h-3.5 shrink-0 text-rose-600" />
                <span :title="item.deleted_at || ''">{{ formatDateTime(item.deleted_at) }}</span>
              </div>
            </td>

            <!-- Restored At -->
            <td class="px-3 py-4 whitespace-nowrap">
              <span v-if="item.restored_at" class="inline-flex items-center gap-1.5 text-emerald-800 text-xs font-medium" :title="item.restored_at">
                <RotateCcw class="w-3 h-3 shrink-0 text-emerald-600" />
                <span>{{ formatDateOnly(item.restored_at) }}</span>
              </span>
              <span v-else class="text-[#889d90]">—</span>
            </td>

            <!-- Actions -->
            <td class="px-3.5 py-4 whitespace-nowrap text-right">
              <div class="inline-flex items-center justify-end gap-2" @click.stop>
                <!-- View Details -->
                <button
                  type="button"
                  @click="emit('view', item)"
                  class="p-1.5 rounded-lg text-[#6b7f73] hover:text-[#182c20] hover:bg-[#edeae1] transition-colors cursor-pointer"
                  title="View Details"
                >
                  <Eye class="w-4 h-4 stroke-[1.8]" />
                </button>

                <!-- Restore Button -->
                <button
                  type="button"
                  @click="emit('restore', item)"
                  class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#cbe0d3] bg-[#edf6f0] text-[#1c4e36] hover:bg-[#e0efe5] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  title="Restore to Active Establishments"
                >
                  <RotateCcw class="w-3.5 h-3.5 stroke-[2]" />
                  <span>Restore</span>
                </button>

                <!-- Delete Permanently Button -->
                <button
                  type="button"
                  @click="emit('permanent-delete', item)"
                  class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#f5d0cc] bg-[#faeae8] text-[#b83d3b] hover:bg-[#f7dcda] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  title="Permanently Delete from Database"
                >
                  <Trash2 class="w-3.5 h-3.5 stroke-[2]" />
                  <span>Delete Permanently</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination for Trash -->
    <Pagination
      v-if="!isLoading && filteredList.length > 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :total-items="filteredList.length"
      @update:current-page="(p) => currentPage = p"
      @update:page-size="(s) => { pageSize = s; currentPage = 1; }"
    />
  </div>
</template>
