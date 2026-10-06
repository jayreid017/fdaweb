<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue';
import type { Establishment, ConfirmationMode } from '../../types/establishment';
import { AlertTriangle, X, Trash2, RotateCcw, Loader2 } from 'lucide-vue-next';

export type { ConfirmationMode };

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    establishment: Establishment | null;
    mode?: ConfirmationMode;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    isProcessing?: boolean;
  }>(),
  {
    mode: 'trash',
    isProcessing: false,
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();

const resolvedTitle = computed(() => {
  if (props.title) return props.title;
  if (props.mode === 'trash') return 'Move to Trash?';
  if (props.mode === 'restore') return 'Restore Establishment?';
  return 'Permanently Delete Establishment?';
});

const resolvedMessage = computed(() => {
  if (props.message) return props.message;
  if (props.mode === 'trash') {
    return 'This establishment will be moved to Trash. You can restore it later.';
  }
  if (props.mode === 'restore') {
    return 'This establishment will be restored and returned to the active establishments list.';
  }
  return 'This action cannot be undone. The establishment will be permanently removed from the database.';
});

const resolvedConfirmText = computed(() => {
  if (props.isProcessing) {
    if (props.mode === 'trash') return 'Moving to Trash...';
    if (props.mode === 'restore') return 'Restoring...';
    return 'Deleting Permanently...';
  }
  if (props.confirmText) return props.confirmText;
  if (props.mode === 'trash') return 'Move to Trash';
  if (props.mode === 'restore') return 'Restore';
  return 'Delete Permanently';
});

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.isOpen && !props.isProcessing) {
    emit('close');
  }
}

function handleBackdropClick() {
  if (!props.isProcessing) {
    emit('close');
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
);

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Transition name="modal-backdrop">
    <div
      v-if="isOpen && establishment"
      class="fixed inset-0 z-50 overflow-y-auto bg-[#172a1f]/60 backdrop-blur-xs flex items-center justify-center p-4"
      @click.self="handleBackdropClick"
      role="dialog"
      aria-modal="true"
    >
      <Transition name="modal-panel">
        <div
          v-if="isOpen && establishment"
          class="relative w-full max-w-md bg-[#FFFEFB] rounded-2xl shadow-2xl border border-[#DCE4DE] overflow-hidden p-6 sm:p-7"
        >
          <!-- Close button -->
          <button
            type="button"
            :disabled="isProcessing"
            @click="handleBackdropClick"
            class="absolute top-5 right-5 w-8 h-8 rounded-full border border-[#D0DAD3] text-[#4A5D52] hover:bg-[#EAEFEA] hover:text-[#112419] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X class="w-3.5 h-3.5 stroke-[2]" />
          </button>

          <div class="flex items-start gap-4">
            <!-- Icon by mode -->
            <div
              v-if="mode === 'restore'"
              class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200"
            >
              <RotateCcw class="w-5 h-5 stroke-[2]" />
            </div>
            <div
              v-else-if="mode === 'trash'"
              class="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200"
            >
              <Trash2 class="w-5 h-5 stroke-[2]" />
            </div>
            <div
              v-else
              class="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200"
            >
              <AlertTriangle class="w-5 h-5 stroke-[2]" />
            </div>

            <!-- Content -->
            <div class="flex-1 pr-4">
              <h3 class="text-lg font-bold text-[#14281E] font-serif tracking-tight">
                {{ resolvedTitle }}
              </h3>
              <p class="text-xs sm:text-[13px] text-[#55695D] mt-2 leading-relaxed">
                {{ resolvedMessage }}
              </p>
              <p v-if="establishment.establishment_name" class="mt-2 text-xs font-semibold text-[#112419] bg-[#f4f2ea] px-2.5 py-1.5 rounded-lg border border-[#e5e1d3] truncate">
                {{ establishment.establishment_name }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#EDE8DD]">
            <button
              type="button"
              :disabled="isProcessing"
              @click="handleBackdropClick"
              class="px-5 py-2.5 rounded-xl border border-[#DCD6C8] bg-[#F5F4EC] hover:bg-[#EAE6D9] text-[#1C2E23] font-semibold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {{ cancelText || 'Cancel' }}
            </button>

            <!-- Confirm Button -->
            <button
              type="button"
              :disabled="isProcessing"
              @click="emit('confirm')"
              class="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-xs disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer active:scale-98"
              :class="[
                mode === 'restore'
                  ? 'bg-[#1d4b35] hover:bg-[#153a29]'
                  : mode === 'trash'
                  ? 'bg-amber-700 hover:bg-amber-800'
                  : 'bg-rose-700 hover:bg-rose-800'
              ]"
            >
              <Loader2 v-if="isProcessing" class="w-4 h-4 animate-spin" />
              <RotateCcw v-else-if="mode === 'restore'" class="w-4 h-4" />
              <Trash2 v-else class="w-4 h-4" />
              <span>{{ resolvedConfirmText }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
