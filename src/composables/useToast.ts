import { ref } from 'vue';
import type { ToastMessage } from '../types/establishment';

const toasts = ref<ToastMessage[]>([]);

export function useToast() {
  function addToast(type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    toasts.value.push({ id, type, title, message });

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return {
    toasts,
    addToast,
    removeToast
  };
}
