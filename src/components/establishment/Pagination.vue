<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps<{
  currentPage: number;
  pageSize: number;
  totalItems: number;
}>();

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void;
  (e: 'update:pageSize', size: number): void;
}>();

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(props.totalItems / props.pageSize));
});

const startItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.pageSize + 1;
});

const endItem = computed(() => {
  return Math.min(props.totalItems, props.currentPage * props.pageSize);
});

// Generate page numbers with ellipses
const displayedPages = computed(() => {
  const current = props.currentPage;
  const total = totalPages.value;
  const pages: (number | string)[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) {
      pages.push('...');
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push('...');
    }
    pages.push(total);
  }

  return pages;
});

function goToPage(page: number | string) {
  if (typeof page === 'number' && page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('update:currentPage', page);
  }
}

function handlePageSizeChange(e: Event) {
  const target = e.target as HTMLSelectElement;
  const newSize = parseInt(target.value, 10);
  emit('update:pageSize', newSize);
  emit('update:currentPage', 1);
}
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
    <!-- Left: Showing summary & Page Size -->
    <div class="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#4d6657]">
      <div>
        Showing
        <span class="font-bold text-[#172a1f]">{{ startItem }}</span>
        to
        <span class="font-bold text-[#172a1f]">{{ endItem }}</span>
        of
        <span class="font-bold text-[#172a1f]">{{ totalItems }}</span>
        establishments
      </div>

      <div class="flex items-center gap-2 border-l border-[#dce6df] pl-3">
        <label for="page-size-select" class="text-xs text-[#6e8576]">Rows per page:</label>
        <select
          id="page-size-select"
          :value="pageSize"
          @change="handlePageSizeChange"
          class="bg-white border border-[#dce6df] text-xs rounded-lg px-2.5 py-1 text-[#172a1f] font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#366649] focus:border-[#366649]"
        >
          <option :value="10">10 rows</option>
          <option :value="20">20 rows</option>
          <option :value="50">50 rows</option>
          <option :value="100">100 rows</option>
        </select>
      </div>
    </div>

    <!-- Right: Page controls -->
    <div class="flex items-center gap-1">
      <!-- Previous -->
      <button
        type="button"
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage <= 1"
        aria-label="Previous Page"
        class="inline-flex items-center justify-center p-2 rounded-lg text-[#556f60] hover:text-[#172a1f] hover:bg-[#edf5ef] disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft class="w-4 h-4 mr-0.5" />
        <span class="hidden sm:inline text-xs font-semibold">Previous</span>
      </button>

      <!-- Page Numbers -->
      <div class="flex items-center gap-1 px-1">
        <template v-for="(p, idx) in displayedPages" :key="idx">
          <span
            v-if="p === '...'"
            class="px-2 py-1 text-xs text-[#9bb0a3] select-none"
          >
            ...
          </span>
          <button
            v-else
            type="button"
            @click="goToPage(p)"
            :class="[
              'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors',
              p === currentPage
                ? 'bg-[#366649] text-white shadow-xs'
                : 'text-[#354f40] hover:bg-[#edf5ef] hover:text-[#172a1f]',
            ]"
          >
            {{ p }}
          </button>
        </template>
      </div>

      <!-- Next -->
      <button
        type="button"
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage >= totalPages"
        aria-label="Next Page"
        class="inline-flex items-center justify-center p-2 rounded-lg text-[#556f60] hover:text-[#172a1f] hover:bg-[#edf5ef] disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
      >
        <span class="hidden sm:inline text-xs font-semibold">Next</span>
        <ChevronRight class="w-4 h-4 ml-0.5" />
      </button>
    </div>
  </div>
</template>
