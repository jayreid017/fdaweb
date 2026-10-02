<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue';
import type { Establishment } from '../../types/establishment';
import StatusBadge from '../common/StatusBadge.vue';
import { 
  X, 
  Building2, 
  FileText, 
  MapPin, 
  User, 
  ClipboardCheck, 
  Mail, 
  Phone,
  ArrowLeft,
  Pencil,
  CheckCircle2,
  AlertCircle
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

const isNonCompliant = computed(() => {
  if (!props.establishment?.status_last_inspection) return false;
  const s = props.establishment.status_last_inspection.toLowerCase();
  return s.includes('non') || s.includes('fail');
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
          class="relative w-full max-w-4xl bg-[#F8F6EE] rounded-3xl shadow-2xl border border-[#DCE4DE] overflow-hidden flex flex-col max-h-[92vh]"
        >
          <!-- Fixed Header -->
          <div class="px-7 py-5 bg-[#FFFEFB] border-b border-[#EDE8DD] flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-2xl bg-[#E6F0EA] text-[#1D4A36] flex items-center justify-center font-bold border border-[#D5E4DA] shrink-0">
                <Building2 class="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <div class="flex items-center gap-2.5">
                  <h2 class="text-xl sm:text-2xl font-bold text-[#112419] leading-tight font-serif tracking-tight">
                    {{ val(establishment.establishment_name) }}
                  </h2>
                  <StatusBadge :status="establishment.status || '—'" type="establishment" size="sm" />
                </div>
                <div class="flex items-center gap-3 text-xs text-[#55695D] mt-0.5">
                  <span class="font-medium text-[#245037]">{{ establishment.product_type || 'Food' }}</span>
                  <span>•</span>
                  <span>{{ establishment.primary_activity || 'Manufacturer' }}</span>
                  <template v-if="establishment.specific_activities">
                    <span>•</span>
                    <span class="truncate max-w-xs">{{ establishment.specific_activities }}</span>
                  </template>
                </div>
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

          <!-- Scrollable Body with 2x2 Cards Grid -->
          <div class="px-6 sm:px-8 py-6 overflow-y-auto flex-1 space-y-5 bg-[#F8F6EE]">
            <!-- Products Info Banner (if products or product_line exist) -->
            <div 
              v-if="establishment.products || establishment.product_line"
              class="bg-[#FFFEFB] rounded-2xl border border-[#E8E3D8] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div v-if="establishment.product_line" class="flex-1">
                <span class="block text-[11px] font-medium text-[#7A8E81] uppercase tracking-wider mb-0.5">Product Line</span>
                <span class="font-semibold text-[#14281E] text-xs sm:text-[13px]">{{ establishment.product_line }}</span>
              </div>
              <div v-if="establishment.products" class="flex-1">
                <span class="block text-[11px] font-medium text-[#7A8E81] uppercase tracking-wider mb-0.5">Products Registered</span>
                <span class="font-semibold text-[#14281E] text-xs sm:text-[13px]">{{ establishment.products }}</span>
              </div>
            </div>

            <!-- 2x2 Grid Layout -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <!-- 1. LICENSE INFORMATION Card -->
              <div class="bg-[#FFFEFB] rounded-2xl border border-[#E8E3D8] p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
                <!-- Header -->
                <div class="flex items-start justify-between gap-3 mb-5">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-[#204F38] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <FileText class="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h3 class="text-xs font-bold text-[#163826] uppercase tracking-wider font-sans">
                        License Information
                      </h3>
                      <div class="w-7 h-0.5 bg-[#B89C65] rounded-full mt-1"></div>
                    </div>
                  </div>

                  <!-- Status Badge -->
                  <span 
                    v-if="establishment.expiry"
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                    :class="[
                      isLtoExpired 
                        ? 'bg-[#faeae8] text-[#c94242] border border-[#f5d0cc]' 
                        : 'bg-[#EAF5ED] text-[#1E5238] border border-[#D0E5D7]'
                    ]"
                  >
                    <AlertCircle v-if="isLtoExpired" class="w-3 h-3 text-[#c94242]" />
                    <CheckCircle2 v-else class="w-3 h-3 text-[#1E5238]" />
                    <span>{{ isLtoExpired ? 'LTO Expired' : 'LTO Valid' }}</span>
                  </span>
                </div>

                <!-- Card Content -->
                <div class="space-y-4 text-xs">
                  <div>
                    <span class="block text-xs text-[#7A8E81] font-medium mb-1">LTO Number</span>
                    <span class="text-sm sm:text-base font-bold text-[#14281E] font-mono tracking-tight block">
                      {{ val(establishment.lto_number) }}
                    </span>
                  </div>

                  <div class="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <span class="block text-xs text-[#7A8E81] font-medium mb-1">Issuance Date</span>
                      <span class="text-xs sm:text-[13px] font-bold text-[#14281E] block">
                        {{ formatDate(establishment.lto_issuance_date) }}
                      </span>
                    </div>
                    <div>
                      <span class="block text-xs text-[#7A8E81] font-medium mb-1">Expiry Date</span>
                      <span 
                        class="text-xs sm:text-[13px] font-bold block"
                        :class="isLtoExpired ? 'text-[#c94242]' : 'text-[#14281E]'"
                      >
                        {{ formatDate(establishment.expiry) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Decorative Leaf Watermark -->
                <svg class="absolute -bottom-3 -right-3 w-28 h-28 text-[#204F38]/5 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M50 0 C70 30, 90 50, 100 80 C80 90, 50 80, 40 60 C30 80, 10 90, 0 80 C10 50, 30 30, 50 0 Z"/>
                </svg>
              </div>

              <!-- 2. LOCATION Card -->
              <div class="bg-[#FFFEFB] rounded-2xl border border-[#E8E3D8] p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
                <!-- Header -->
                <div class="flex items-start justify-between gap-3 mb-5">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-[#204F38] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <MapPin class="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h3 class="text-xs font-bold text-[#163826] uppercase tracking-wider font-sans">
                        Location
                      </h3>
                      <div class="w-7 h-0.5 bg-[#B89C65] rounded-full mt-1"></div>
                    </div>
                  </div>

                  <!-- Location Graphic Top-Right -->
                  <div class="opacity-70 pointer-events-none">
                    <svg class="w-14 h-12 text-[#204F38]/15" viewBox="0 0 60 50" fill="currentColor">
                      <path d="M5 15 L20 8 L40 15 L55 8 L55 38 L40 45 L20 38 L5 45 Z" fill-opacity="0.3" stroke="currentColor" stroke-width="1.2"/>
                      <circle cx="40" cy="18" r="4" fill="#204F38" />
                    </svg>
                  </div>
                </div>

                <!-- Card Content -->
                <div class="space-y-4 text-xs">
                  <div>
                    <span class="block text-xs text-[#7A8E81] font-medium mb-1">Address</span>
                    <span class="text-xs sm:text-[13px] font-bold text-[#14281E] leading-snug block">
                      {{ val(establishment.address) }}
                    </span>
                  </div>

                  <div class="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <span class="block text-xs text-[#7A8E81] font-medium mb-1">Province</span>
                      <span class="text-xs sm:text-[13px] font-bold text-[#14281E] block">
                        {{ val(establishment.province) }}
                      </span>
                    </div>
                    <div>
                      <span class="block text-xs text-[#7A8E81] font-medium mb-1">City / Municipality</span>
                      <span class="text-xs sm:text-[13px] font-bold text-[#14281E] block">
                        {{ val(establishment.city_municipality) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 3. OWNER & CONTACT Card -->
              <div class="bg-[#FFFEFB] rounded-2xl border border-[#E8E3D8] p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
                <!-- Header -->
                <div class="flex items-start justify-between gap-3 mb-5">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-[#204F38] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <User class="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h3 class="text-xs font-bold text-[#163826] uppercase tracking-wider font-sans">
                        Owner & Contact
                      </h3>
                      <div class="w-7 h-0.5 bg-[#B89C65] rounded-full mt-1"></div>
                    </div>
                  </div>
                </div>

                <!-- Card Content -->
                <div class="space-y-3.5 text-xs">
                  <div>
                    <span class="block text-xs text-[#7A8E81] font-medium mb-1">Owner</span>
                    <span class="text-xs sm:text-[13px] font-bold text-[#14281E] block">
                      {{ val(establishment.owner) }}
                    </span>
                  </div>

                  <div>
                    <span class="block text-xs text-[#7A8E81] font-medium mb-1">Contact Number</span>
                    <a 
                      v-if="establishment.contact_number" 
                      :href="'tel:' + establishment.contact_number"
                      class="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-[#14281E] font-mono hover:text-[#1D4A36] hover:underline"
                    >
                      <Phone class="w-3.5 h-3.5 text-[#7A8E81]" />
                      {{ establishment.contact_number }}
                    </a>
                    <span v-else class="text-xs sm:text-[13px] font-bold text-[#14281E] block">—</span>
                  </div>

                  <div>
                    <span class="block text-xs text-[#7A8E81] font-medium mb-1">Email Address</span>
                    <a 
                      v-if="establishment.email_address" 
                      :href="'mailto:' + establishment.email_address"
                      class="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-[#14281E] hover:text-[#1D4A36] hover:underline truncate max-w-full"
                    >
                      <Mail class="w-3.5 h-3.5 text-[#7A8E81] shrink-0" />
                      <span class="truncate">{{ establishment.email_address }}</span>
                    </a>
                    <span v-else class="text-xs sm:text-[13px] font-bold text-[#14281E] block">—</span>
                  </div>
                </div>

                <!-- Decorative Leaf Watermark -->
                <svg class="absolute -bottom-4 -right-4 w-32 h-32 text-[#204F38]/6 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M30 100 C20 70, 40 40, 70 10 C80 30, 85 60, 60 80 C80 70, 95 85, 100 100 Z"/>
                </svg>
              </div>

              <!-- 4. INSPECTION RECORD Card -->
              <div class="bg-[#FFFEFB] rounded-2xl border border-[#E8E3D8] p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
                <!-- Header -->
                <div class="flex items-start justify-between gap-3 mb-5">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-[#204F38] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <ClipboardCheck class="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h3 class="text-xs font-bold text-[#163826] uppercase tracking-wider font-sans">
                        Inspection Record
                      </h3>
                      <div class="w-7 h-0.5 bg-[#B89C65] rounded-full mt-1"></div>
                    </div>
                  </div>

                  <!-- Inspection Status Badge -->
                  <span 
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                    :class="[
                      isNonCompliant 
                        ? 'bg-[#faeae8] text-[#c94242] border border-[#f5d0cc]' 
                        : 'bg-[#EAF5ED] text-[#1E5238] border border-[#D0E5D7]'
                    ]"
                  >
                    <AlertCircle v-if="isNonCompliant" class="w-3 h-3 text-[#c94242]" />
                    <CheckCircle2 v-else class="w-3 h-3 text-[#1E5238]" />
                    <span>{{ establishment.status_last_inspection || 'Compliant' }}</span>
                  </span>
                </div>

                <!-- Card Content (2 columns) -->
                <div class="grid grid-cols-2 gap-4 text-xs">
                  <!-- Col 1 -->
                  <div class="space-y-3.5">
                    <div>
                      <span class="block text-xs text-[#7A8E81] font-medium mb-1">Last Inspection</span>
                      <span class="text-xs sm:text-[13px] font-bold text-[#14281E] block">
                        {{ formatDate(establishment.last_inspection) }}
                      </span>
                    </div>

                    <div>
                      <span class="block text-xs text-[#7A8E81] font-medium mb-1">Frequency</span>
                      <span class="text-xs sm:text-[13px] font-bold text-[#14281E] block">
                        {{ val(establishment.frequency) }}
                      </span>
                    </div>

                    <div>
                      <span class="block text-xs text-[#7A8E81] font-medium mb-1">Inspector</span>
                      <span class="text-xs sm:text-[13px] font-bold text-[#14281E] block truncate">
                        {{ val(establishment.inspector) }}
                      </span>
                    </div>
                  </div>

                  <!-- Col 2 -->
                  <div class="space-y-3.5">
                    <div>
                      <span class="block text-xs text-[#7A8E81] font-medium mb-1">Next Inspection</span>
                      <span class="text-xs sm:text-[13px] font-bold text-[#14281E] block">
                        {{ formatDate(establishment.next_inspection) }}
                      </span>
                    </div>

                    <div>
                      <span class="block text-xs text-[#7A8E81] font-medium mb-1">Type of Inspection</span>
                      <span class="text-xs sm:text-[13px] font-bold text-[#14281E] block">
                        {{ val(establishment.type_inspection) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Fixed Footer with Pill Buttons -->
          <div class="px-7 py-4.5 sm:px-8 sm:py-5 border-t border-[#E8E3D8] bg-[#FFFEFB] flex items-center justify-between shrink-0">
            <button
              type="button"
              @click="emit('close')"
              class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#B8A882] bg-transparent hover:bg-[#EAE5D8] text-[#1E3326] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft class="w-4 h-4 stroke-[2]" />
              <span>Close</span>
            </button>
            <button
              type="button"
              @click="emit('edit', establishment)"
              class="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#204F38] hover:bg-[#173F2C] text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all duration-150 cursor-pointer active:scale-98"
            >
              <Pencil class="w-4 h-4 stroke-[2]" />
              <span>Edit establishment</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
