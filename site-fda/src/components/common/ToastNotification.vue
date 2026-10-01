<script setup lang="ts">
import type { ToastMessage } from '../../types/establishment';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-vue-next';

defineProps<{
  toasts: ToastMessage[];
}>();

const emit = defineEmits<{
  (e: 'dismiss', id: string): void;
}>();
</script>

<template>
  <div 
    class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    role="region" 
    aria-live="polite"
    aria-label="Notifications"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all',
          toast.type === 'success' ? 'bg-white/95 border-emerald-200 text-slate-800 ring-1 ring-emerald-500/10' : '',
          toast.type === 'error' ? 'bg-white/95 border-rose-200 text-slate-800 ring-1 ring-rose-500/10' : '',
          toast.type === 'warning' ? 'bg-white/95 border-amber-200 text-slate-800 ring-1 ring-amber-500/10' : '',
          toast.type === 'info' ? 'bg-white/95 border-blue-200 text-slate-800 ring-1 ring-blue-500/10' : '',
        ]"
      >
        <!-- Icon -->
        <div class="shrink-0 mt-0.5">
          <CheckCircle2 v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-600" />
          <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-rose-600" />
          <AlertTriangle v-else-if="toast.type === 'warning'" class="w-5 h-5 text-amber-600" />
          <Info v-else class="w-5 h-5 text-blue-600" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-slate-900 leading-tight">
            {{ toast.title }}
          </h4>
          <p class="text-xs text-slate-600 mt-0.5 leading-relaxed">
            {{ toast.message }}
          </p>
        </div>

        <!-- Dismiss button -->
        <button
          type="button"
          @click="emit('dismiss', toast.id)"
          class="shrink-0 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          title="Close notification"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
