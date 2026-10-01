<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import type { Establishment } from '../../types/establishment';
import { AlertTriangle, X, Trash2 } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  establishment: Establishment | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.isOpen) {
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
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      @click.self="emit('close')"
      role="dialog"
      aria-modal="true"
    >
      <Transition name="modal-panel">
        <div
          v-if="isOpen && establishment"
          class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6"
        >
          <!-- Close button -->
          <button
            type="button"
            @click="emit('close')"
            class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X class="w-4 h-4" />
          </button>

          <div class="flex items-start gap-4">
            <!-- Warning icon -->
            <div class="w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <AlertTriangle class="w-6 h-6" />
            </div>

            <!-- Content -->
            <div class="flex-1 pr-4">
              <h3 class="text-base font-bold text-slate-900">
                Delete Establishment?
              </h3>
              <p class="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Are you sure you want to delete
                <span class="font-semibold text-slate-900 underline">{{ establishment.establishmentName }}</span>?
                This action cannot be undone and will permanently remove this establishment and its license records.
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="emit('confirm')"
              class="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 shadow-sm transition-all duration-150 cursor-pointer active:scale-98"
            >
              <Trash2 class="w-4 h-4" />
              <span>Delete Establishment</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
