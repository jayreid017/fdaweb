<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Establishment } from '../../types/establishment';
import EstablishmentRow from './EstablishmentRow.vue';
import SkeletonTable from '../common/SkeletonTable.vue';
import { 
  Building2, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Inbox,
  Download,
  RotateCcw
} from 'lucide-vue-next';

const props = defineProps<{
  establishments: Establishment[];
  totalFilteredCount: number;
  isLoading: boolean;
  startIndex: number;
}>();

const emit = defineEmits<{
  (e: 'view', item: Establishment): void;
  (e: 'edit', item: Establishment): void;
  (e: 'delete', item: Establishment): void;
  (e: 'add'): void;
  (e: 'export'): void;
  (e: 'reset-demo'): void;
}>();

type SortKey = 'establishmentName' | 'expiryDate' | 'nextInspection' | 'status' | 'province' | '';
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
    let aVal = a[sortKey.value as keyof Establishment] || '';
    let bVal = b[sortKey.value as keyof Establishment] || '';

    if (sortKey.value === 'expiryDate' || sortKey.value === 'nextInspection') {
      const aTime = new Date(aVal as string).getTime() || 0;
      const bTime = new Date(bVal as string).getTime() || 0;
      return sortOrder.value === 'asc' ? aTime - bTime : bTime - aTime;
    }

    const cmp = String(aVal).localeCompare(String(bVal));
    return sortOrder.value === 'asc' ? cmp : -cmp;
  });
});
</script>

<template>
  <div class="bg-white rounded-2xl border border-[#e3ece5] shadow-xs overflow-hidden flex flex-col">
    <!-- Table Header Toolbar (as shown in Image 1) -->
    <div class="px-5 py-4 border-b border-[#e7eee9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-[#edf5ef] text-[#346246] flex items-center justify-center border border-[#d6e8da]">
          <Building2 class="w-4 h-4" />
        </div>
        <div class="flex items-baseline gap-2">
          <h2 class="text-sm font-bold text-[#172a1f] tracking-tight">
            {{ totalFilteredCount }} Establishments
          </h2>
          <span class="text-xs text-[#6e8576]">Registry Records</span>
        </div>
      </div>

      <!-- Right Top Actions: Export CSV and Reset Demo -->
      <div class="flex items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          @click="emit('export')"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#245738] bg-[#f2f7f3] hover:bg-[#e7f1e9] border border-[#d1e3d6] rounded-lg transition-colors cursor-pointer shadow-2xs"
          title="Export records to CSV"
        >
          <Download class="w-3.5 h-3.5 text-[#366649]" />
          <span>Export CSV</span>
        </button>
        <button
          type="button"
          @click="emit('reset-demo')"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#245738] bg-[#f2f7f3] hover:bg-[#e7f1e9] border border-[#d1e3d6] rounded-lg transition-colors cursor-pointer shadow-2xs"
          title="Reset database to sample records"
        >
          <RotateCcw class="w-3.5 h-3.5 text-[#366649]" />
          <span>Reset Demo</span>
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
            Try adjusting your filters or search keywords, or add a new establishment to the registry.
          </p>
        </div>
        <button
          type="button"
          @click="emit('add')"
          class="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#366649] hover:bg-[#2b533a] text-white shadow-xs transition-colors cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>Add Establishment</span>
        </button>
      </div>

      <!-- Main Data Table -->
      <table v-else class="w-full text-left border-collapse min-w-[2100px]">
        <thead>
          <tr class="bg-[#edf3ee] text-[11px] font-bold text-[#476152] uppercase tracking-wider border-b border-[#dfe8e1] sticky top-0 z-20">
            <!-- 1. No -->
            <th scope="col" class="px-3.5 py-3.5 text-center w-12 shrink-0 bg-[#edf3ee]">
              No
            </th>

            <!-- 2. Establishment Name -->
            <th 
              scope="col" 
              class="px-4 py-3.5 cursor-pointer hover:text-[#172a1f] transition-colors bg-[#edf3ee]"
              @click="toggleSort('establishmentName')"
            >
              <div class="flex items-center gap-1.5">
                <span>Establishment Name</span>
                <span class="text-[#728a7c]">
                  <ArrowUp v-if="sortKey === 'establishmentName' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#366649]" />
                  <ArrowDown v-else-if="sortKey === 'establishmentName' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#366649]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 opacity-60" />
                </span>
              </div>
            </th>

            <!-- 3. Product Type -->
            <th scope="col" class="px-4 py-3.5 whitespace-nowrap bg-[#edf3ee]">Product Type</th>

            <!-- 4. Primary Activity -->
            <th scope="col" class="px-4 py-3.5 whitespace-nowrap bg-[#edf3ee]">Primary Activity</th>

            <!-- 5. Specific Activity/s -->
            <th scope="col" class="px-4 py-3.5 whitespace-nowrap bg-[#edf3ee]">Specific Activity/s</th>

            <!-- 6. Product Line -->
            <th scope="col" class="px-4 py-3.5 whitespace-nowrap bg-[#edf3ee]">Product Line</th>

            <!-- 7. Products -->
            <th scope="col" class="px-4 py-3.5 whitespace-nowrap bg-[#edf3ee]">Products</th>

            <!-- 8. LTO Number -->
            <th scope="col" class="px-4 py-3.5 whitespace-nowrap bg-[#edf3ee]">LTO Number</th>

            <!-- 9. LTO Issuance Date -->
            <th scope="col" class="px-4 py-3.5 whitespace-nowrap bg-[#edf3ee]">LTO Issuance Date</th>

            <!-- 10. Expiry -->
            <th 
              scope="col" 
              class="px-4 py-3.5 whitespace-nowrap cursor-pointer hover:text-[#172a1f] transition-colors bg-[#edf3ee]"
              @click="toggleSort('expiryDate')"
            >
              <div class="flex items-center gap-1.5">
                <span>Expiry</span>
                <span class="text-[#728a7c]">
                  <ArrowUp v-if="sortKey === 'expiryDate' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#366649]" />
                  <ArrowDown v-else-if="sortKey === 'expiryDate' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#366649]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 opacity-60" />
                </span>
              </div>
            </th>

            <!-- 11. Address -->
            <th scope="col" class="px-4 py-3.5 whitespace-nowrap bg-[#edf3ee]">Address</th>

            <!-- 12. Province -->
            <th 
              scope="col" 
              class="px-4 py-3.5 whitespace-nowrap cursor-pointer hover:text-[#172a1f] transition-colors bg-[#edf3ee]"
              @click="toggleSort('province')"
            >
              <div class="flex items-center gap-1.5">
                <span>Province</span>
                <span class="text-[#728a7c]">
                  <ArrowUp v-if="sortKey === 'province' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#366649]" />
                  <ArrowDown v-else-if="sortKey === 'province' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#366649]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 opacity-60" />
                </span>
              </div>
            </th>

            <!-- 13. City or Municipality -->
            <th scope="col" class="px-4 py-3.5 whitespace-nowrap bg-[#edf3ee]">City or Municipality</th>

            <!-- 14. Owner -->
            <th scope="col" class="px-4 py-3.5 whitespace-nowrap bg-[#edf3ee]">Owner</th>

            <!-- 15. Contact Number -->
            <th scope="col" class="px-4 py-3.5 whitespace-nowrap bg-[#edf3ee]">Contact Number</th>

            <!-- 16. Email Address -->
            <th scope="col" class="px-4 py-3.5 whitespace-nowrap bg-[#edf3ee]">Email Address</th>

            <!-- 17. Last Inspection -->
            <th scope="col" class="px-4 py-3.5 whitespace-nowrap bg-[#edf3ee]">Last Inspection</th>

            <!-- 18. Status of Last Inspection -->
            <th scope="col" class="px-4 py-3.5 whitespace-nowrap bg-[#edf3ee]">Status of Last Inspection</th>

            <!-- 19. Frequency -->
            <th scope="col" class="px-4 py-3.5 whitespace-nowrap bg-[#edf3ee]">Frequency</th>

            <!-- 20. Next Inspection -->
            <th 
              scope="col" 
              class="px-4 py-3.5 whitespace-nowrap cursor-pointer hover:text-[#172a1f] transition-colors bg-[#edf3ee]"
              @click="toggleSort('nextInspection')"
            >
              <div class="flex items-center gap-1.5">
                <span>Next Inspection</span>
                <span class="text-[#728a7c]">
                  <ArrowUp v-if="sortKey === 'nextInspection' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#366649]" />
                  <ArrowDown v-else-if="sortKey === 'nextInspection' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#366649]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 opacity-60" />
                </span>
              </div>
            </th>

            <!-- 21. Type Inspection -->
            <th scope="col" class="px-4 py-3.5 whitespace-nowrap bg-[#edf3ee]">Type Inspection</th>

            <!-- 22. Inspector -->
            <th scope="col" class="px-4 py-3.5 whitespace-nowrap bg-[#edf3ee]">Inspector</th>

            <!-- 23. Status -->
            <th 
              scope="col" 
              class="px-4 py-3.5 whitespace-nowrap cursor-pointer hover:text-[#172a1f] transition-colors bg-[#edf3ee]"
              @click="toggleSort('status')"
            >
              <div class="flex items-center gap-1.5">
                <span>Status</span>
                <span class="text-[#728a7c]">
                  <ArrowUp v-if="sortKey === 'status' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#366649]" />
                  <ArrowDown v-else-if="sortKey === 'status' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#366649]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 opacity-60" />
                </span>
              </div>
            </th>

            <!-- 24. Actions (Sticky Right) -->
            <th 
              scope="col" 
              class="sticky right-0 px-4 py-3.5 text-right whitespace-nowrap bg-[#edf3ee] z-30 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)] border-l border-[#dfe8e1]"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#edf2ee] bg-white">
          <EstablishmentRow
            v-for="(item, idx) in sortedList"
            :key="item.id"
            :establishment="item"
            :index="startIndex + idx"
            @view="(item) => emit('view', item)"
            @edit="(item) => emit('edit', item)"
            @delete="(item) => emit('delete', item)"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>
