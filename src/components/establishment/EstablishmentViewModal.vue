<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue';
import type { Establishment } from '../../types/establishment';
import StatusBadge from '../common/StatusBadge.vue';
import { 
  X, 
  Edit3, 
  Building2, 
  FileBadge2, 
  MapPin, 
  UserCheck, 
  ClipboardCheck, 
  Mail, 
  Phone 
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  establishment: Establishment | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'edit', item: Establishment): void;
}>();

const isLtoExpired = computed(() => {
  if (!props.establishment?.expiry) return false;
  const d = new Date(props.establishment.expiry);
  return !isNaN(d.getTime()) && d < new Date();
});

function val(v?: string | null): string {
  if (v === null || v === undefined) return '—';
  const str = String(v).trim();
  return str.length > 0 ? str : '—';
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr || !dateStr.trim()) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

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
      class="fixed inset-0 z-50 overflow-y-auto bg-[#172a1f]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 lg:p-6"
      @click.self="emit('close')"
      role="dialog"
      aria-modal="true"
    >
      <Transition name="modal-panel">
        <div
          v-if="isOpen && establishment"
          class="relative w-full max-w-4xl bg-[#F8F6EE] rounded-2xl shadow-2xl border border-[#DCE4DE] overflow-hidden flex flex-col max-h-[90vh]"
        >
          <!-- Fixed Header -->
          <div class="px-7 py-5.5 bg-[#FFFEFB] border-b border-[#EDE8DD] flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-[#E6F0EA] text-[#1D4A36] flex items-center justify-center font-bold border border-[#D5E4DA] shrink-0">
                <Building2 class="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <div class="flex items-center gap-2.5">
                  <h2 class="text-xl sm:text-2xl font-bold text-[#112419] leading-tight font-serif tracking-tight">
                    Establishment details
                  </h2>
                  <StatusBadge :status="establishment.status || '—'" type="establishment" size="sm" />
                </div>
                <p class="text-xs text-[#55695D] font-mono mt-0.5">
                  {{ establishment.lto_number || 'No LTO Number' }}
                </p>
              </div>
            </div>
            <button
              type="button"
              @click="emit('close')"
              class="w-9 h-9 rounded-full border border-[#D0DAD3] text-[#4A5D52] hover:bg-[#EAEFEA] hover:text-[#112419] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Close modal (Esc)"
            >
              <X class="w-4 h-4 stroke-[2]" />
            </button>
          </div>

          <!-- Scrollable Body with Two-Column Cards Layout -->
          <div class="px-6 sm:px-7 py-6 overflow-y-auto flex-1 space-y-5 bg-[#F8F6EE]">
            <!-- 1. Establishment Information Card -->
            <div class="bg-[#FFFEFB] rounded-xl border border-[#e3ece5] p-4 sm:p-5 shadow-xs space-y-3">
              <div class="flex items-center gap-2 text-[#244331] font-bold text-xs uppercase tracking-wider border-b border-[#edf3ee] pb-2">
                <Building2 class="w-4 h-4 text-[#366649]" />
                <span>Establishment Information</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <span class="block text-[#7b9385] font-medium text-[11px]">Establishment Name</span>
                  <span class="font-bold text-[#172a1f] text-sm mt-0.5 block">{{ val(establishment.establishment_name) }}</span>
                </div>
                <div>
                  <span class="block text-[#7b9385] font-medium text-[11px]">Product Type</span>
                  <span 
                    v-if="establishment.product_type"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#edf5ef] text-[#245437] mt-1 border border-[#d6e8da]"
                  >
                    {{ establishment.product_type }}
                  </span>
                  <span v-else class="text-[#889d90] mt-1 block">—</span>
                </div>
                <div>
                  <span class="block text-[#7b9385] font-medium text-[11px]">Primary Activity</span>
                  <span class="font-semibold text-[#1f382a] mt-0.5 block">{{ val(establishment.primary_activity) }}</span>
                </div>
                <div>
                  <span class="block text-[#7b9385] font-medium text-[11px]">Specific Activities</span>
                  <span class="text-[#354f40] mt-0.5 block">{{ val(establishment.specific_activities) }}</span>
                </div>
                <div>
                  <span class="block text-[#7b9385] font-medium text-[11px]">Product Line</span>
                  <span class="text-[#354f40] mt-0.5 block">{{ val(establishment.product_line) }}</span>
                </div>
                <div class="sm:col-span-2 lg:col-span-1">
                  <span class="block text-[#7b9385] font-medium text-[11px]">Products</span>
                  <span class="text-[#354f40] font-mono text-[11px] mt-0.5 block">{{ val(establishment.products) }}</span>
                </div>
              </div>
            </div>

            <!-- Two-Column Row for License & Location -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- 2. License Information Card -->
              <div class="bg-[#FFFEFB] rounded-xl border border-[#e3ece5] p-4 sm:p-5 shadow-xs space-y-3">
                <div class="flex items-center justify-between border-b border-[#edf3ee] pb-2">
                  <div class="flex items-center gap-2 text-[#244331] font-bold text-xs uppercase tracking-wider">
                    <FileBadge2 class="w-4 h-4 text-[#366649]" />
                    <span>License Information</span>
                  </div>
                  <span
                    v-if="establishment.expiry"
                    :class="[
                      'px-2 py-0.5 text-[11px] font-bold rounded-full',
                      isLtoExpired ? 'bg-[#fde8e8] text-[#b91c1c]' : 'bg-[#e7f4ea] text-[#215d39]'
                    ]"
                  >
                    {{ isLtoExpired ? 'LTO Expired' : 'LTO Valid' }}
                  </span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div class="sm:col-span-2">
                    <span class="block text-[#7b9385] font-medium text-[11px]">LTO Number</span>
                    <span class="font-mono font-bold text-[#215736] text-sm mt-0.5 block">{{ val(establishment.lto_number) }}</span>
                  </div>
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Issuance Date</span>
                    <span class="text-[#203629] font-medium mt-0.5 block">{{ formatDate(establishment.lto_issuance_date) }}</span>
                  </div>
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Expiry Date</span>
                    <span :class="['font-medium mt-0.5 block', isLtoExpired ? 'text-[#b91c1c] font-bold' : 'text-[#203629]']">
                      {{ formatDate(establishment.expiry) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 3. Location Card -->
              <div class="bg-[#FFFEFB] rounded-xl border border-[#e3ece5] p-4 sm:p-5 shadow-xs space-y-3">
                <div class="flex items-center gap-2 text-[#244331] font-bold text-xs uppercase tracking-wider border-b border-[#edf3ee] pb-2">
                  <MapPin class="w-4 h-4 text-[#366649]" />
                  <span>Location</span>
                </div>
                <div class="space-y-3 text-xs">
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Address</span>
                    <span class="font-medium text-[#203629] mt-0.5 block">{{ val(establishment.address) }}</span>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <span class="block text-[#7b9385] font-medium text-[11px]">Province</span>
                      <span class="font-bold text-[#172a1f] mt-0.5 block">{{ val(establishment.province) }}</span>
                    </div>
                    <div>
                      <span class="block text-[#7b9385] font-medium text-[11px]">City / Municipality</span>
                      <span class="font-bold text-[#172a1f] mt-0.5 block">{{ val(establishment.city_municipality) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Two-Column Row for Contact & Inspection -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- 4. Contact Information Card -->
              <div class="bg-[#FFFEFB] rounded-xl border border-[#e3ece5] p-4 sm:p-5 shadow-xs space-y-3">
                <div class="flex items-center gap-2 text-[#244331] font-bold text-xs uppercase tracking-wider border-b border-[#edf3ee] pb-2">
                  <UserCheck class="w-4 h-4 text-[#366649]" />
                  <span>Owner & Contact</span>
                </div>
                <div class="space-y-3 text-xs">
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Owner</span>
                    <span class="font-bold text-[#172a1f] mt-0.5 block">{{ val(establishment.owner) }}</span>
                  </div>
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Contact Number</span>
                    <a 
                      v-if="establishment.contact_number" 
                      :href="`tel:${establishment.contact_number}`" 
                      class="inline-flex items-center gap-1.5 font-mono text-[#28573a] hover:underline mt-0.5 font-semibold"
                    >
                      <Phone class="w-3.5 h-3.5 text-[#8ea496]" />
                      {{ establishment.contact_number }}
                    </a>
                    <span v-else class="text-[#889d90] mt-0.5 block">—</span>
                  </div>
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Email Address</span>
                    <a 
                      v-if="establishment.email_address" 
                      :href="`mailto:${establishment.email_address}`" 
                      class="inline-flex items-center gap-1.5 font-mono text-[#28573a] hover:underline mt-0.5 font-semibold"
                    >
                      <Mail class="w-3.5 h-3.5 text-[#8ea496]" />
                      {{ establishment.email_address }}
                    </a>
                    <span v-else class="text-[#889d90] mt-0.5 block">—</span>
                  </div>
                </div>
              </div>

              <!-- 5. Inspection Information Card -->
              <div class="bg-[#FFFEFB] rounded-xl border border-[#e3ece5] p-4 sm:p-5 shadow-xs space-y-3">
                <div class="flex items-center justify-between border-b border-[#edf3ee] pb-2">
                  <div class="flex items-center gap-2 text-[#244331] font-bold text-xs uppercase tracking-wider">
                    <ClipboardCheck class="w-4 h-4 text-[#366649]" />
                    <span>Inspection Record</span>
                  </div>
                  <StatusBadge :status="establishment.status_last_inspection || '—'" type="inspection" size="sm" />
                </div>
                <div class="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Last Inspection</span>
                    <span class="font-medium text-[#203629] mt-0.5 block">{{ formatDate(establishment.last_inspection) }}</span>
                  </div>
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Next Inspection</span>
                    <span class="font-bold text-[#204a32] mt-0.5 block">{{ formatDate(establishment.next_inspection) }}</span>
                  </div>
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Frequency</span>
                    <span class="text-[#203629] mt-0.5 block">{{ val(establishment.frequency) }}</span>
                  </div>
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Type of Inspection</span>
                    <span class="text-[#203629] mt-0.5 block">{{ val(establishment.type_inspection) }}</span>
                  </div>
                  <div class="col-span-2">
                    <span class="block text-[#7b9385] font-medium text-[11px]">Inspector</span>
                    <span class="font-medium text-[#203629] mt-0.5 block">{{ val(establishment.inspector) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Fixed Footer -->
          <div class="px-6 py-4.5 sm:px-8 sm:py-5 border-t border-[#E8E3D8] bg-[#FFFEFB] flex items-center justify-between shrink-0">
            <button
              type="button"
              @click="emit('close')"
              class="px-5 sm:px-6 py-2.5 rounded-xl border border-[#DCD6C8] bg-[#F5F4EC] hover:bg-[#EAE6D9] text-[#1C2E23] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              @click="emit('edit', establishment)"
              class="inline-flex items-center gap-1.5 px-6 sm:px-7 py-2.5 rounded-xl bg-[#204F38] hover:bg-[#173F2C] text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all duration-150 cursor-pointer active:scale-98"
            >
              <Edit3 class="w-4 h-4" />
              <span>Edit establishment</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
