<script setup lang="ts">
import type { Establishment } from '../../types/establishment';
import { Eye, Pencil, Trash2, MapPin } from 'lucide-vue-next';

const props = defineProps<{
  establishment: Establishment;
  index: number;
  isHighlighted?: boolean;
}>();

const emit = defineEmits<{
  (e: 'view', item: Establishment): void;
  (e: 'edit', item: Establishment): void;
  (e: 'delete', item: Establishment): void;
}>();

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
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const statusNormalized = (status?: string | null) => {
  const s = status?.trim().toLowerCase();
  if (s === 'active') return 'Active';
  if (s === 'expired') return 'Expired';
  if (s === 'suspended') return 'Suspended';
  if (s === 'cancelled') return 'Cancelled';
  return status || 'Active';
};

const isNonCompliant = (status?: string | null) => {
  if (!status) return false;
  const s = status.toLowerCase();
  return s.includes('non') || s.includes('fail');
};

const isLtoExpired = (expiryStr?: string | null) => {
  if (!expiryStr || !expiryStr.trim()) return false;
  try {
    const d = new Date(expiryStr);
    if (isNaN(d.getTime())) return false;
    return d < new Date();
  } catch {
    return false;
  }
};

const getUpcomingInspectionInfo = (dateStr?: string | null) => {
  if (!dateStr || !dateStr.trim()) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diffDays = Math.round((targetDate - startOfToday) / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= 60) {
      let label = `In ${diffDays}d`;
      if (diffDays === 0) label = 'Today';
      else if (diffDays === 1) label = 'Tomorrow';

      return {
        isUpcoming: true,
        days: diffDays,
        label,
        isUrgent: diffDays <= 14,
      };
    } else if (diffDays < 0) {
      return {
        isOverdue: true,
        days: Math.abs(diffDays),
        label: 'Overdue',
      };
    }
    return null;
  } catch {
    return null;
  }
};
</script>

<template>
  <tr 
    @click="emit('view', establishment)"
    class="transition-all duration-700 ease-in-out border-b text-xs text-[#203629] group cursor-pointer"
    :class="[
      isHighlighted 
        ? 'bg-[#ebf5ee] ring-1 ring-inset ring-[#2e744d]/40 border-[#b8dfc7] shadow-xs' 
        : 'hover:bg-[#E8F0EA]/80 border-[#edf3ee]'
    ]"
  >
    <!-- 0. Row Number (No) -->
    <td class="w-12 px-3 py-4 text-center font-mono text-xs text-[#718579] font-medium select-none">
      {{ index }}
    </td>

    <!-- 1. Establishment name & Location -->
    <td class="px-3.5 py-4 max-w-65 lg:max-w-xs xl:max-w-50">
      <div class="flex flex-col min-w-0">
        <div class="flex items-center gap-2 min-w-0">
          <span 
            class="truncate font-semibold text-xs sm:text-[13px] text-[#111827] group-hover:text-[#1d4b35] transition-colors"
            :title="establishment.establishment_name || '—'"
          >
            {{ val(establishment.establishment_name) }}
          </span>
          <span
            v-if="isHighlighted"
            class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#1d4b35] text-[#f4ecd9] shadow-2xs shrink-0 select-none animate-fadeIn"
          >
            NEW
          </span>
        </div>
        <div 
          v-if="establishment.city_municipality || establishment.province" 
          class="flex items-center gap-1.5 text-[11.5px] text-[#6b7280] font-normal mt-1 truncate"
        >
          <MapPin class="w-3.5 h-3.5 shrink-0 text-[#8fa093] stroke-[1.6]" />
          <span class="truncate">
            <template v-if="establishment.city_municipality && establishment.province">
              {{ establishment.city_municipality }}, {{ establishment.province }}
            </template>
            <template v-else>
              {{ establishment.city_municipality || establishment.province }}
            </template>
          </span>
        </div>
      </div>
    </td>

    <!-- 2. Product type -->
    <td class="px-3 py-4 whitespace-nowrap">
      <span 
        class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#e3ede7] text-[#163828]"
      >
        {{ establishment.product_type || 'Food' }}
      </span>
    </td>

    <!-- 3. LTO number -->
    <td class="px-3 py-4 whitespace-nowrap">
      <div v-if="establishment.lto_number" class="inline-flex items-center gap-1.5">
        <span 
          class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium transition-colors"
          :class="[
            isLtoExpired(establishment.expiry)
              ? 'text-[#b83d3b] bg-[#faeae8] border border-[#f5d0cc]'
              : 'text-[#254b38] bg-[#e2ece6]'
          ]"
        >
          {{ establishment.lto_number }}
        </span>
        <span 
          v-if="isLtoExpired(establishment.expiry)"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight bg-[#faeae8] text-[#c94242] border border-[#f5d0cc]"
          :title="'LTO expired on ' + formatDate(establishment.expiry)"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-[#c94242] animate-pulse"></span>
          Expired
        </span>
      </div>
      <span v-else class="text-[#889d90]">—</span>
    </td>

    <!-- 4. Status of last inspection -->
    <td class="px-3 py-4 whitespace-nowrap">
      <span 
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border"
        :class="[
          isNonCompliant(establishment.status_last_inspection)
            ? 'bg-[#faeae8] text-[#b83d3b] border-[#f5d0cc]'
            : 'bg-[#f4f3ed] text-[#4a554d] border-[#e5e2d8]'
        ]"
      >
        <span 
          class="w-1.5 h-1.5 rounded-full"
          :class="isNonCompliant(establishment.status_last_inspection) ? 'bg-[#c94242]' : 'bg-[#59685d]'"
        ></span>
        <span>{{ establishment.status_last_inspection || 'Compliant' }}</span>
      </span>
    </td>

    <!-- 5. Next inspection -->
    <td class="px-3 py-4 whitespace-nowrap">
      <div class="inline-flex items-center gap-2">
        <span class="text-xs sm:text-sm font-medium text-[#111827]">
          {{ formatDate(establishment.next_inspection) }}
        </span>
        <span 
          v-if="getUpcomingInspectionInfo(establishment.next_inspection)?.isUpcoming"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight"
          :class="[
            getUpcomingInspectionInfo(establishment.next_inspection)?.isUrgent
              ? 'bg-[#fff5eb] text-[#b85414] border border-[#fedec0]'
              : 'bg-[#e7f3eb] text-[#1e5238] border border-[#cfe2d6]'
          ]"
          :title="'Upcoming inspection ' + getUpcomingInspectionInfo(establishment.next_inspection)?.label"
        >
          <span 
            class="w-1.5 h-1.5 rounded-full"
            :class="getUpcomingInspectionInfo(establishment.next_inspection)?.isUrgent ? 'bg-[#b85414] animate-pulse' : 'bg-[#1e5238]'"
          ></span>
          <span>{{ getUpcomingInspectionInfo(establishment.next_inspection)?.label }}</span>
        </span>
        <span 
          v-else-if="getUpcomingInspectionInfo(establishment.next_inspection)?.isOverdue"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight bg-[#faeae8] text-[#c94242] border border-[#f5d0cc]"
          :title="'Inspection overdue by ' + getUpcomingInspectionInfo(establishment.next_inspection)?.days + ' days'"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-[#c94242]"></span>
          <span>Overdue</span>
        </span>
      </div>
    </td>

    <!-- 6. Status -->
    <td class="px-3 py-4 whitespace-nowrap">
      <span 
        class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold"
        :class="statusNormalized(establishment.status) === 'Active' ? 'text-[#205c3b]' : 'text-[#c94242]'"
      >
        <span 
          class="w-1.5 h-1.5 rounded-full"
          :class="statusNormalized(establishment.status) === 'Active' ? 'bg-[#205c3b]' : 'bg-[#c94242]'"
        ></span>
        <span>{{ statusNormalized(establishment.status) }}</span>
      </span>
    </td>

    <!-- 7. Created at -->
    <td class="px-3 py-4 whitespace-nowrap">
      <span class="text-xs sm:text-sm font-medium text-[#111827]" :title="establishment.created_at || '—'">
        {{ formatDate(establishment.created_at) }}
      </span>
    </td>

    <!-- 8. Actions -->
    <td class="px-3.5 py-4 whitespace-nowrap text-right">
      <div class="inline-flex items-center justify-end gap-3">
        <!-- View Button -->
        <button
          type="button"
          @click.stop="emit('view', establishment)"
          class="text-[#889d91] hover:text-[#182c20] transition-colors cursor-pointer p-0.5"
          title="View Details"
        >
          <Eye class="w-4 h-4 stroke-[1.8]" />
        </button>

        <!-- Edit Button -->
        <button
          type="button"
          @click.stop="emit('edit', establishment)"
          class="text-[#889d91] hover:text-[#182c20] transition-colors cursor-pointer p-0.5"
          title="Edit Record"
        >
          <Pencil class="w-4 h-4 stroke-[1.8]" />
        </button>

        <!-- Delete Button (Moves to Trash) -->
        <button
          type="button"
          @click.stop="emit('delete', establishment)"
          class="text-[#889d91] hover:text-[#c94242] transition-colors cursor-pointer p-0.5"
          title="Delete (Move to Trash)"
        >
          <Trash2 class="w-4 h-4 stroke-[1.8]" />
        </button>
      </div>
    </td>
  </tr>
</template>
