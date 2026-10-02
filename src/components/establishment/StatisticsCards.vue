<script setup lang="ts">
import type { SummaryStats } from '../../types/establishment';
import { 
  Landmark, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar 
} from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  stats: SummaryStats;
  activeFilter?: 'all' | 'active' | 'expired' | 'upcoming';
}>(), {
  activeFilter: 'all',
});

const emit = defineEmits<{
  (e: 'filter-change', filter: 'all' | 'active' | 'expired' | 'upcoming'): void;
}>();

function selectFilter(filter: 'all' | 'active' | 'expired' | 'upcoming') {
  if (props.activeFilter === filter && filter !== 'all') {
    emit('filter-change', 'all');
  } else {
    emit('filter-change', filter);
  }
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    <!-- 1. Total Establishments -->
    <div
      @click="selectFilter('all')"
      class="bg-[#FFFEFB] rounded-3xl p-6 cursor-pointer transition-all duration-200 select-none relative group"
      :class="[
        activeFilter === 'all'
          ? 'border-2 border-[#b59958] shadow-[0_6px_24px_-4px_rgba(181,153,88,0.18)]'
          : 'border border-[#ecebe4] hover:border-[#d6d4c8] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-md'
      ]"
    >
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-[#e8f1ec] text-[#2c5b41] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
          <Landmark class="w-4.5 h-4.5 stroke-[1.8]" />
        </div>
        <span class="text-sm font-medium text-[#506357]">Total establishments</span>
      </div>

      <div class="my-4">
        <p class="font-serif font-bold text-4xl sm:text-[44px] text-[#0f241a] leading-none tracking-tight">
          {{ stats.totalEstablishments.toLocaleString() }}
        </p>
      </div>

      <div class="h-px bg-[#f0eee6] my-4 w-full"></div>

      <div class="flex items-center gap-2.5">
        <span class="inline-flex items-center text-[#215d39] font-bold bg-[#e6f0ea] px-3 py-1 rounded-full text-xs">
          Registered
        </span>
        <span class="text-xs text-[#718579] font-normal leading-tight">Nationwide licensed facilities</span>
      </div>
    </div>

    <!-- 2. Active -->
    <div
      @click="selectFilter('active')"
      class="bg-[#FFFEFB] rounded-3xl p-6 cursor-pointer transition-all duration-200 select-none relative group"
      :class="[
        activeFilter === 'active'
          ? 'border-2 border-[#b59958] shadow-[0_6px_24px_-4px_rgba(181,153,88,0.18)]'
          : 'border border-[#ecebe4] hover:border-[#d6d4c8] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-md'
      ]"
    >
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-[#e8f1ec] text-[#2c5b41] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
          <ShieldCheck class="w-4.5 h-4.5 stroke-[1.8]" />
        </div>
        <span class="text-sm font-medium text-[#506357]">Active</span>
      </div>

      <div class="my-4">
        <p class="font-serif font-bold text-4xl sm:text-[44px] text-[#0f241a] leading-none tracking-tight">
          {{ stats.activeCount.toLocaleString() }}
        </p>
      </div>

      <div class="h-px bg-[#f0eee6] my-4 w-full"></div>

      <div class="flex items-center gap-2.5">
        <span class="inline-flex items-center text-[#215d39] font-bold bg-[#e6f0ea] px-3 py-1 rounded-full text-xs">
          {{ stats.totalEstablishments > 0 ? Math.round((stats.activeCount / stats.totalEstablishments) * 100) : 100 }}%
        </span>
        <span class="text-xs text-[#718579] font-normal leading-tight">In full regulatory compliance</span>
      </div>
    </div>

    <!-- 3. Expired LTO -->
    <div
      @click="selectFilter('expired')"
      class="bg-[#FFFEFB] rounded-3xl p-6 cursor-pointer transition-all duration-200 select-none relative group"
      :class="[
        activeFilter === 'expired'
          ? 'border-2 border-[#b59958] shadow-[0_6px_24px_-4px_rgba(181,153,88,0.18)]'
          : 'border border-[#ecebe4] hover:border-[#d6d4c8] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-md'
      ]"
    >
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-[#faeae8] text-[#c94242] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
          <AlertTriangle class="w-4.5 h-4.5 stroke-[1.8]" />
        </div>
        <span class="text-sm font-medium text-[#506357]">Expired LTO</span>
      </div>

      <div class="my-4">
        <p class="font-serif font-bold text-4xl sm:text-[44px] text-[#0f241a] leading-none tracking-tight">
          {{ stats.expiredLtoCount.toLocaleString() }}
        </p>
      </div>

      <div class="h-px bg-[#f0eee6] my-4 w-full"></div>

      <div class="flex items-center gap-2.5">
        <span class="inline-flex items-center text-[#b83d3b] font-bold bg-[#fae8e6] px-3 py-1 rounded-full text-xs">
          Act now
        </span>
        <span class="text-xs text-[#718579] font-normal leading-tight">License renewal needed</span>
      </div>
    </div>

    <!-- 4. Upcoming Inspections -->
    <div
      @click="selectFilter('upcoming')"
      class="bg-[#FFFEFB] rounded-3xl p-6 cursor-pointer transition-all duration-200 select-none relative group"
      :class="[
        activeFilter === 'upcoming'
          ? 'border-2 border-[#b59958] shadow-[0_6px_24px_-4px_rgba(181,153,88,0.18)]'
          : 'border border-[#ecebe4] hover:border-[#d6d4c8] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-md'
      ]"
    >
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-[#e8f1ec] text-[#2c5b41] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
          <Calendar class="w-4.5 h-4.5 stroke-[1.8]" />
        </div>
        <span class="text-sm font-medium text-[#506357]">Upcoming inspections</span>
      </div>

      <div class="my-4">
        <p class="font-serif font-bold text-4xl sm:text-[44px] text-[#0f241a] leading-none tracking-tight">
          {{ stats.upcomingInspectionsCount.toLocaleString() }}
        </p>
      </div>

      <div class="h-px bg-[#f0eee6] my-4 w-full"></div>

      <div class="flex items-center gap-2.5">
        <span class="inline-flex items-center text-[#8e682d] font-bold bg-[#f5ecdd] px-3 py-1 rounded-full text-xs">
          Next 60 days
        </span>
        <span class="text-xs text-[#718579] font-normal leading-tight">Scheduled surveillance audits</span>
      </div>
    </div>
  </div>
</template>
