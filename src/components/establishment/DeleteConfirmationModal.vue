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
      class="fixed inset-0 z-50 overflow-y-auto bg-[#172a1f]/60 backdrop-blur-xs flex items-center justify-center p-4"
      @click.self="emit('close')"
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
            @click="emit('close')"
            class="absolute top-5 right-5 w-8 h-8 rounded-full border border-[#D0DAD3] text-[#4A5D52] hover:bg-[#EAEFEA] hover:text-[#112419] flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X class="w-3.5 h-3.5 stroke-[2]" />
          </button>

          <div class="flex items-start gap-4">
            <!-- Warning icon -->
            <div class="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <AlertTriangle class="w-5 h-5 stroke-[2]" />
            </div>

            <!-- Content -->
            <div class="flex-1 pr-4">
              <h3 class="text-lg font-bold text-[#14281E] font-serif tracking-tight">
                Delete establishment?
              </h3>
              <p class="text-xs sm:text-[13px] text-[#55695D] mt-2 leading-relaxed">
                Are you sure you want to delete
                <span class="font-semibold text-[#112419]">{{ establishment.establishment_name || 'this establishment' }}</span>?
                This action cannot be undone and will permanently remove this establishment and its license records.
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#EDE8DD]">
            <button
              type="button"
              @click="emit('close')"
              class="px-5 py-2.5 rounded-xl border border-[#DCD6C8] bg-[#F5F4EC] hover:bg-[#EAE6D9] text-[#1C2E23] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="emit('confirm')"
              class="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all duration-150 cursor-pointer active:scale-98"
            >
              <Trash2 class="w-4 h-4" />
              <span>Delete establishment</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
