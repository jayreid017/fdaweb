<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import TrashTable from '../TrashTable.vue';
import type { Establishment } from '../../../types/establishment';

defineProps<{
  trashList: Establishment[];
  trashCount: number;
  isTrashLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'restore', item: Establishment): void;
  (e: 'permanent-delete', item: Establishment): void;
  (e: 'view', item: Establishment): void;
  (e: 'refresh'): void;
}>();
</script>

<template>
  <div class="space-y-7">
    <!-- Header banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
      <div>
        <p class="text-xs font-semibold tracking-[0.16em] text-[#a47c3b] uppercase mb-1.5">
          FDA REGULATORY PORTAL
        </p>
        <h1 class="text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold text-[#0f241a] tracking-tight leading-[1.15] mb-2 flex items-center gap-3">
          <span>Trash</span>
          <span v-if="trashCount > 0" class="text-xs sm:text-sm font-sans font-semibold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            {{ trashCount }} deleted record{{ trashCount === 1 ? '' : 's' }}
          </span>
        </h1>
        <p class="text-xs sm:text-sm text-[#667a6e] font-normal">
          Review deleted establishments. Restore them back to active registry or permanently delete them.
        </p>
      </div>
      <div class="flex items-center gap-2.5 self-start sm:self-auto">
        <button
          type="button"
          @click="emit('back')"
          class="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-[#f5f3ec] hover:bg-[#eae6d9] active:bg-[#ded9cb] text-[#1c2e23] text-xs sm:text-sm font-semibold rounded-2xl border border-[#dcd6c8] transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Back to Establishments</span>
        </button>
      </div>
    </div>

    <!-- Dedicated Trash Table Component -->
    <section aria-label="Deleted Establishments Table">
      <TrashTable
        :establishments="trashList"
        :is-loading="isTrashLoading"
        @restore="(item) => emit('restore', item)"
        @permanent-delete="(item) => emit('permanent-delete', item)"
        @view="(item) => emit('view', item)"
        @refresh="emit('refresh')"
      />
    </section>
  </div>
</template>
