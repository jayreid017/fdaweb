<script setup lang="ts">
import type { Establishment } from '../../types/establishment';
import StatusBadge from '../common/StatusBadge.vue';
import { Eye, Edit3, Trash2, Mail, Phone, MapPin } from 'lucide-vue-next';

const props = defineProps<{
  establishment: Establishment;
  index: number;
}>();

const emit = defineEmits<{
  (e: 'view', item: Establishment): void;
  (e: 'edit', item: Establishment): void;
  (e: 'delete', item: Establishment): void;
}>();

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
</script>

<template>
  <tr class="group hover:bg-[#f3f8f5] transition-colors duration-150 border-b border-[#edf3ee] text-xs text-[#203629]">
    <!-- 1. No -->
    <td class="px-3.5 py-3.5 text-center font-mono font-medium text-[#7a9182] w-12 shrink-0">
      {{ index + 1 }}
    </td>

    <!-- 2. Establishment Name -->
    <td class="px-4 py-3.5 font-medium max-w-[240px]">
      <div class="flex flex-col">
        <span 
          class="truncate font-bold text-[#172a1f] hover:text-[#28573a] cursor-pointer"
          :title="establishment.establishmentName"
          @click="emit('view', establishment)"
        >
          {{ establishment.establishmentName }}
        </span>
        <span class="flex items-center gap-1 text-[11px] text-[#698072] mt-0.5 truncate">
          <MapPin class="w-3 h-3 shrink-0 text-[#8ea496]" />
          {{ establishment.cityMunicipality }}, {{ establishment.province }}
        </span>
      </div>
    </td>

    <!-- 3. Product Type -->
    <td class="px-4 py-3.5 whitespace-nowrap">
      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#edf5ef] text-[#245437] border border-[#d6e8da]">
        {{ establishment.productType }}
      </span>
    </td>

    <!-- 4. Primary Activity -->
    <td class="px-4 py-3.5 whitespace-nowrap font-medium text-[#1f382a]">
      {{ establishment.primaryActivity }}
    </td>

    <!-- 5. Specific Activity/s -->
    <td class="px-4 py-3.5 max-w-[200px]">
      <span class="truncate block text-[#50695b]" :title="establishment.specificActivities || '—'">
        {{ establishment.specificActivities || '—' }}
      </span>
    </td>

    <!-- 6. Product Line -->
    <td class="px-4 py-3.5 max-w-[200px]">
      <span class="truncate block text-[#50695b]" :title="establishment.productLine || '—'">
        {{ establishment.productLine || '—' }}
      </span>
    </td>

    <!-- 7. Products -->
    <td class="px-4 py-3.5 max-w-[220px]">
      <span class="truncate block text-[#446250] font-mono text-[11px]" :title="establishment.products || '—'">
        {{ establishment.products || '—' }}
      </span>
    </td>

    <!-- 8. LTO Number -->
    <td class="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] font-semibold text-[#215736]">
      <span class="bg-[#eaf4ed] px-2 py-0.5 rounded-md border border-[#cde5d3]">
        {{ establishment.ltoNumber }}
      </span>
    </td>

    <!-- 9. LTO Issuance Date -->
    <td class="px-4 py-3.5 whitespace-nowrap text-[#536d5e]">
      {{ formatDate(establishment.ltoIssuanceDate) }}
    </td>

    <!-- 10. Expiry -->
    <td class="px-4 py-3.5 whitespace-nowrap">
      <span :class="[
        'font-medium',
        new Date(establishment.expiryDate) < new Date() ? 'text-[#b91c1c] font-bold' : 'text-[#203629]'
      ]">
        {{ formatDate(establishment.expiryDate) }}
      </span>
    </td>

    <!-- 11. Address -->
    <td class="px-4 py-3.5 max-w-[220px]">
      <span class="truncate block text-[#536d5e]" :title="establishment.address">
        {{ establishment.address }}
      </span>
    </td>

    <!-- 12. Province -->
    <td class="px-4 py-3.5 whitespace-nowrap font-semibold text-[#1d3527]">
      {{ establishment.province }}
    </td>

    <!-- 13. City or Municipality -->
    <td class="px-4 py-3.5 whitespace-nowrap text-[#536d5e]">
      {{ establishment.cityMunicipality }}
    </td>

    <!-- 14. Owner -->
    <td class="px-4 py-3.5 whitespace-nowrap font-medium text-[#172a1f]">
      {{ establishment.owner }}
    </td>

    <!-- 15. Contact Number -->
    <td class="px-4 py-3.5 whitespace-nowrap text-[#536d5e] font-mono text-[11px]">
      <a 
        v-if="establishment.contactNumber" 
        :href="`tel:${establishment.contactNumber}`" 
        class="inline-flex items-center gap-1 hover:text-[#2b5e3e] hover:underline"
      >
        <Phone class="w-3 h-3 text-[#8ea496]" />
        {{ establishment.contactNumber }}
      </a>
      <span v-else>—</span>
    </td>

    <!-- 16. Email Address -->
    <td class="px-4 py-3.5 whitespace-nowrap text-[#536d5e] font-mono text-[11px]">
      <a 
        v-if="establishment.emailAddress" 
        :href="`mailto:${establishment.emailAddress}`" 
        class="inline-flex items-center gap-1 hover:text-[#2b5e3e] hover:underline"
        :title="establishment.emailAddress"
      >
        <Mail class="w-3 h-3 text-[#8ea496]" />
        {{ establishment.emailAddress }}
      </a>
      <span v-else>—</span>
    </td>

    <!-- 17. Last Inspection -->
    <td class="px-4 py-3.5 whitespace-nowrap text-[#536d5e]">
      {{ formatDate(establishment.lastInspection) }}
    </td>

    <!-- 18. Status of Last Inspection -->
    <td class="px-4 py-3.5 whitespace-nowrap">
      <StatusBadge :status="establishment.statusOfLastInspection" type="inspection" />
    </td>

    <!-- 19. Frequency -->
    <td class="px-4 py-3.5 whitespace-nowrap text-[#536d5e]">
      {{ establishment.frequency }}
    </td>

    <!-- 20. Next Inspection -->
    <td class="px-4 py-3.5 whitespace-nowrap font-medium text-[#20382a]">
      {{ formatDate(establishment.nextInspection) }}
    </td>

    <!-- 21. Type Inspection -->
    <td class="px-4 py-3.5 whitespace-nowrap text-[#536d5e]">
      {{ establishment.typeInspection }}
    </td>

    <!-- 22. Inspector -->
    <td class="px-4 py-3.5 whitespace-nowrap font-medium text-[#20382a]">
      {{ establishment.inspector || '—' }}
    </td>

    <!-- 23. Status -->
    <td class="px-4 py-3.5 whitespace-nowrap">
      <StatusBadge :status="establishment.status" type="establishment" />
    </td>

    <!-- 24. Sticky Actions column -->
    <td class="sticky right-0 px-3 py-3 whitespace-nowrap bg-white group-hover:bg-[#f3f8f5] transition-colors shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)] border-l border-[#e2ebe4] text-right z-10">
      <div class="inline-flex items-center justify-end gap-1">
        <!-- View Button -->
        <button
          type="button"
          @click="emit('view', establishment)"
          class="relative group/btn p-1.5 rounded-lg text-[#556f60] hover:text-[#215736] hover:bg-[#e7f3ea] transition-colors cursor-pointer"
          aria-label="View Details"
        >
          <Eye class="w-4 h-4" />
          <span class="absolute bottom-full mb-1.5 right-1/2 translate-x-1/2 hidden group-hover/btn:block bg-[#172a1f] text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-md pointer-events-none whitespace-nowrap z-30">
            View Details
          </span>
        </button>

        <!-- Edit Button -->
        <button
          type="button"
          @click="emit('edit', establishment)"
          class="relative group/btn p-1.5 rounded-lg text-[#556f60] hover:text-[#215736] hover:bg-[#e7f3ea] transition-colors cursor-pointer"
          aria-label="Edit Establishment"
        >
          <Edit3 class="w-4 h-4" />
          <span class="absolute bottom-full mb-1.5 right-1/2 translate-x-1/2 hidden group-hover/btn:block bg-[#172a1f] text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-md pointer-events-none whitespace-nowrap z-30">
            Edit
          </span>
        </button>

        <!-- Delete Button -->
        <button
          type="button"
          @click="emit('delete', establishment)"
          class="relative group/btn p-1.5 rounded-lg text-[#859c8e] hover:text-[#b91c1c] hover:bg-[#fee2e2] transition-colors cursor-pointer"
          aria-label="Delete Establishment"
        >
          <Trash2 class="w-4 h-4" />
          <span class="absolute bottom-full mb-1.5 right-1/2 translate-x-1/2 hidden group-hover/btn:block bg-[#172a1f] text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-md pointer-events-none whitespace-nowrap z-30">
            Delete
          </span>
        </button>
      </div>
    </td>
  </tr>
</template>
