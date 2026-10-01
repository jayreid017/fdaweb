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
  if (!props.establishment?.expiryDate) return false;
  return new Date(props.establishment.expiryDate) < new Date();
});

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
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
          class="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-[#dbe6de] overflow-hidden flex flex-col max-h-[90vh]"
        >
          <!-- Fixed Header -->
          <div class="px-6 py-4 border-b border-[#e5eee7] bg-[#f8faf8] flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#edf5ef] text-[#346246] flex items-center justify-center font-bold border border-[#d6e8da]">
                <Building2 class="w-5 h-5" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-base sm:text-lg font-bold text-[#172a1f] leading-tight">
                    Establishment Details
                  </h2>
                  <StatusBadge :status="establishment.status" type="establishment" size="sm" />
                </div>
                <p class="text-xs text-[#5e7768] font-mono mt-0.5">
                  {{ establishment.ltoNumber }}
                </p>
              </div>
            </div>
            <button
              type="button"
              @click="emit('close')"
              class="text-[#7c9586] hover:text-[#172a1f] p-1.5 rounded-lg hover:bg-[#eaf2ec] transition-colors cursor-pointer"
              title="Close modal (Esc)"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Scrollable Body with Two-Column Cards Layout -->
          <div class="px-6 py-5 overflow-y-auto flex-1 space-y-5">
            <!-- 1. Establishment Information Card -->
            <div class="bg-white rounded-xl border border-[#e3ece5] p-4 sm:p-5 shadow-xs space-y-3">
              <div class="flex items-center gap-2 text-[#244331] font-bold text-xs uppercase tracking-wider border-b border-[#edf3ee] pb-2">
                <Building2 class="w-4 h-4 text-[#366649]" />
                <span>Establishment Information</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <span class="block text-[#7b9385] font-medium text-[11px]">Establishment Name</span>
                  <span class="font-bold text-[#172a1f] text-sm mt-0.5 block">{{ establishment.establishmentName }}</span>
                </div>
                <div>
                  <span class="block text-[#7b9385] font-medium text-[11px]">Product Type</span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#edf5ef] text-[#245437] mt-1 border border-[#d6e8da]">
                    {{ establishment.productType }}
                  </span>
                </div>
                <div>
                  <span class="block text-[#7b9385] font-medium text-[11px]">Primary Activity</span>
                  <span class="font-semibold text-[#1f382a] mt-0.5 block">{{ establishment.primaryActivity }}</span>
                </div>
                <div>
                  <span class="block text-[#7b9385] font-medium text-[11px]">Specific Activity/s</span>
                  <span class="text-[#354f40] mt-0.5 block">{{ establishment.specificActivities || '—' }}</span>
                </div>
                <div>
                  <span class="block text-[#7b9385] font-medium text-[11px]">Product Line</span>
                  <span class="text-[#354f40] mt-0.5 block">{{ establishment.productLine || '—' }}</span>
                </div>
                <div class="sm:col-span-2 lg:col-span-1">
                  <span class="block text-[#7b9385] font-medium text-[11px]">Products</span>
                  <span class="text-[#354f40] font-mono text-[11px] mt-0.5 block">{{ establishment.products || '—' }}</span>
                </div>
              </div>
            </div>

            <!-- Two-Column Row for License & Location -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- 2. License Information Card -->
              <div class="bg-white rounded-xl border border-[#e3ece5] p-4 sm:p-5 shadow-xs space-y-3">
                <div class="flex items-center justify-between border-b border-[#edf3ee] pb-2">
                  <div class="flex items-center gap-2 text-[#244331] font-bold text-xs uppercase tracking-wider">
                    <FileBadge2 class="w-4 h-4 text-[#366649]" />
                    <span>License Information</span>
                  </div>
                  <span
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
                    <span class="font-mono font-bold text-[#215736] text-sm mt-0.5 block">{{ establishment.ltoNumber }}</span>
                  </div>
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Issuance Date</span>
                    <span class="text-[#203629] font-medium mt-0.5 block">{{ formatDate(establishment.ltoIssuanceDate) }}</span>
                  </div>
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Expiry Date</span>
                    <span :class="['font-medium mt-0.5 block', isLtoExpired ? 'text-[#b91c1c] font-bold' : 'text-[#203629]']">
                      {{ formatDate(establishment.expiryDate) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 3. Location Card -->
              <div class="bg-white rounded-xl border border-[#e3ece5] p-4 sm:p-5 shadow-xs space-y-3">
                <div class="flex items-center gap-2 text-[#244331] font-bold text-xs uppercase tracking-wider border-b border-[#edf3ee] pb-2">
                  <MapPin class="w-4 h-4 text-[#366649]" />
                  <span>Location</span>
                </div>
                <div class="space-y-3 text-xs">
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Street Address</span>
                    <span class="font-medium text-[#203629] mt-0.5 block">{{ establishment.address }}</span>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <span class="block text-[#7b9385] font-medium text-[11px]">Province</span>
                      <span class="font-bold text-[#172a1f] mt-0.5 block">{{ establishment.province }}</span>
                    </div>
                    <div>
                      <span class="block text-[#7b9385] font-medium text-[11px]">City / Municipality</span>
                      <span class="font-bold text-[#172a1f] mt-0.5 block">{{ establishment.cityMunicipality }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Two-Column Row for Contact & Inspection -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- 4. Contact Information Card -->
              <div class="bg-white rounded-xl border border-[#e3ece5] p-4 sm:p-5 shadow-xs space-y-3">
                <div class="flex items-center gap-2 text-[#244331] font-bold text-xs uppercase tracking-wider border-b border-[#edf3ee] pb-2">
                  <UserCheck class="w-4 h-4 text-[#366649]" />
                  <span>Owner & Contact</span>
                </div>
                <div class="space-y-3 text-xs">
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Owner / Authorized Representative</span>
                    <span class="font-bold text-[#172a1f] mt-0.5 block">{{ establishment.owner }}</span>
                  </div>
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Contact Number</span>
                    <a :href="`tel:${establishment.contactNumber}`" class="inline-flex items-center gap-1.5 font-mono text-[#28573a] hover:underline mt-0.5 font-semibold">
                      <Phone class="w-3.5 h-3.5 text-[#8ea496]" />
                      {{ establishment.contactNumber }}
                    </a>
                  </div>
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Email Address</span>
                    <a :href="`mailto:${establishment.emailAddress}`" class="inline-flex items-center gap-1.5 font-mono text-[#28573a] hover:underline mt-0.5 font-semibold">
                      <Mail class="w-3.5 h-3.5 text-[#8ea496]" />
                      {{ establishment.emailAddress }}
                    </a>
                  </div>
                </div>
              </div>

              <!-- 5. Inspection Information Card -->
              <div class="bg-white rounded-xl border border-[#e3ece5] p-4 sm:p-5 shadow-xs space-y-3">
                <div class="flex items-center justify-between border-b border-[#edf3ee] pb-2">
                  <div class="flex items-center gap-2 text-[#244331] font-bold text-xs uppercase tracking-wider">
                    <ClipboardCheck class="w-4 h-4 text-[#366649]" />
                    <span>Inspection Record</span>
                  </div>
                  <StatusBadge :status="establishment.statusOfLastInspection" type="inspection" size="sm" />
                </div>
                <div class="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Last Inspection</span>
                    <span class="font-medium text-[#203629] mt-0.5 block">{{ formatDate(establishment.lastInspection) }}</span>
                  </div>
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Next Inspection</span>
                    <span class="font-bold text-[#204a32] mt-0.5 block">{{ formatDate(establishment.nextInspection) }}</span>
                  </div>
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Frequency</span>
                    <span class="text-[#203629] mt-0.5 block">{{ establishment.frequency }}</span>
                  </div>
                  <div>
                    <span class="block text-[#7b9385] font-medium text-[11px]">Inspection Type</span>
                    <span class="text-[#203629] mt-0.5 block">{{ establishment.typeInspection }}</span>
                  </div>
                  <div class="col-span-2">
                    <span class="block text-[#7b9385] font-medium text-[11px]">Assigned Inspector</span>
                    <span class="font-medium text-[#203629] mt-0.5 block">{{ establishment.inspector || 'Unassigned' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Fixed Footer -->
          <div class="px-6 py-4 border-t border-[#e5eee7] bg-[#f8faf8] flex items-center justify-between shrink-0">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2 text-xs sm:text-sm font-semibold text-[#486353] bg-white border border-[#d7e3db] rounded-xl hover:bg-[#edf5ef] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              @click="emit('edit', establishment)"
              class="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#366649] rounded-xl hover:bg-[#2b533a] shadow-sm transition-all duration-150 cursor-pointer active:scale-98"
            >
              <Edit3 class="w-4 h-4" />
              <span>Edit Establishment</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
