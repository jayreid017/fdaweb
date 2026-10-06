<script setup lang="ts">
import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { 
  Download, 
  ChevronDown, 
  FileSpreadsheet, 
  FileText,
  Loader2 
} from 'lucide-vue-next';

const props = defineProps<{
  disabled?: boolean;
  isExporting?: boolean;
  filteredCount?: number;
}>();

const emit = defineEmits<{
  (e: 'export', format: 'xlsx' | 'csv'): void;
}>();

const isOpen = ref<boolean>(false);
const dropdownRef = ref<HTMLElement | null>(null);

onClickOutside(dropdownRef, () => {
  isOpen.value = false;
});

function toggleDropdown() {
  if (props.disabled || props.isExporting) return;
  isOpen.value = !isOpen.value;
}

function handleSelect(format: 'xlsx' | 'csv') {
  isOpen.value = false;
  emit('export', format);
}
</script>

<template>
  <div ref="dropdownRef" class="relative inline-block text-left">
    <!-- Main Dropdown Trigger Button -->
    <button
      id="export-dropdown-trigger"
      type="button"
      @click="toggleDropdown"
      :disabled="disabled || isExporting"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      :class="[
        'inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-150 select-none cursor-pointer shadow-2xs',
        isOpen
          ? 'bg-[#eae7de] text-[#133323] border-[#c5a869] ring-2 ring-[#c5a869]/20'
          : 'bg-[#f9f8f5] hover:bg-[#edeae1] text-[#1c2d22] border-[#e5e3d8]',
        (disabled || isExporting) ? 'opacity-60 cursor-not-allowed' : ''
      ]"
      title="Export displayed establishment records"
    >
      <Loader2 v-if="isExporting" class="w-4 h-4 animate-spin text-[#255239]" />
      <Download v-else class="w-4 h-4 stroke-[1.8] text-[#255239]" />
      
      <span>{{ isExporting ? 'Exporting...' : 'Export' }}</span>
      
      <ChevronDown 
        class="w-3.5 h-3.5 text-[#6c8074] transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }" 
      />
    </button>

    <!-- Floating Dropdown Menu -->
    <div
      v-if="isOpen"
      id="export-dropdown-menu"
      role="menu"
      aria-orientation="vertical"
      class="absolute right-0 mt-2 w-60 sm:w-64 bg-[#FFFEFB] border border-[#c5a869]/35 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn"
    >
      <!-- Menu Header -->
      <div class="px-3.5 py-2 border-b border-[#ecebe4] flex items-center justify-between">
        <span class="text-[10px] font-bold text-[#8fa797] uppercase tracking-wider">
          Export Format
        </span>
        <span v-if="filteredCount !== undefined" class="text-[10px] font-medium text-[#2d5c41] bg-[#eaf3ed] px-2 py-0.5 rounded-full">
          {{ filteredCount.toLocaleString() }} records
        </span>
      </div>

      <!-- Options -->
      <div class="p-1 space-y-1">
        <!-- 1. Excel (.xlsx) Option -->
        <button
          type="button"
          id="export-option-excel"
          role="menuitem"
          @click="handleSelect('xlsx')"
          class="w-full px-3 py-2.5 text-left rounded-xl hover:bg-[#f4f7f4] flex items-center gap-3 cursor-pointer transition-colors group"
        >
          <div class="w-8 h-8 rounded-lg bg-[#eaf4ed] text-[#1b4330] flex items-center justify-center shrink-0 border border-[#cce3d2] group-hover:bg-[#133323] group-hover:text-[#f8f5eb] transition-colors">
            <FileSpreadsheet class="w-4 h-4 stroke-[2]" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-[#0f291e] group-hover:text-[#133323] transition-colors">
              Excel (.xlsx)
            </p>
            <p class="text-[10px] text-[#63776b] truncate mt-0.5">
              Standard Microsoft Excel workbook
            </p>
          </div>
        </button>

        <!-- 2. CSV (.csv) Option -->
        <button
          type="button"
          id="export-option-csv"
          role="menuitem"
          @click="handleSelect('csv')"
          class="w-full px-3 py-2.5 text-left rounded-xl hover:bg-[#f4f7f4] flex items-center gap-3 cursor-pointer transition-colors group"
        >
          <div class="w-8 h-8 rounded-lg bg-[#f0f4f1] text-[#2d5c41] flex items-center justify-center shrink-0 border border-[#d6e3da] group-hover:bg-[#133323] group-hover:text-[#f8f5eb] transition-colors">
            <FileText class="w-4 h-4 stroke-[2]" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-[#0f291e] group-hover:text-[#133323] transition-colors">
              CSV (.csv)
            </p>
            <p class="text-[10px] text-[#63776b] truncate mt-0.5">
              UTF-8 comma-separated values
            </p>
          </div>
        </button>
      </div>

      <!-- Menu Footer Hint -->
      <div class="px-3.5 pt-2 pb-1 border-t border-[#ecebe4] text-[10px] text-[#718579]">
        Exports currently filtered records.
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.15s ease-out forwards;
}
</style>
