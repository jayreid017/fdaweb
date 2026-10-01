<script setup lang="ts">
import type { SummaryStats } from '../../types/establishment';
import { 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  CalendarClock, 
  ChevronRight,
  ArrowUp
} from 'lucide-vue-next';

defineProps<{
  stats: SummaryStats;
}>();
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- 1. Total Establishments -->
    <div
      class="group bg-white rounded-2xl border border-[#e3ece5] p-5 shadow-xs hover:shadow-md hover:border-[#cbded0] transition-all duration-200"
    >
      <div class="flex items-start justify-between">
        <div class="w-11 h-11 rounded-xl bg-[#edf5ef] text-[#346246] flex items-center justify-center border border-[#d6e8da] group-hover:scale-105 transition-transform duration-200">
          <Building2 class="w-5 h-5" />
        </div>
        <div class="flex items-center gap-1 text-[#5b7365]">
          <span class="text-[11px] font-bold tracking-wider uppercase">Total Establishments</span>
          <ChevronRight class="w-4 h-4 text-[#8ea496] group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      <div class="mt-4">
        <p class="text-3xl font-extrabold tracking-tight text-[#172a1f]">
          {{ stats.totalEstablishments.toLocaleString() }}
        </p>
      </div>

      <div class="mt-4 flex items-center gap-2 pt-3 border-t border-[#edf3ee] text-xs text-[#607567]">
        <span class="inline-flex items-center text-[#215d39] font-medium bg-[#e7f4ea] px-2.5 py-0.5 rounded-full text-[11px] border border-[#cbe6d2]">
          Registered
        </span>
        <span class="truncate">Nationwide licensed facilities</span>
      </div>
    </div>

    <!-- 2. Active -->
    <div
      class="group bg-white rounded-2xl border border-[#e3ece5] p-5 shadow-xs hover:shadow-md hover:border-[#cbded0] transition-all duration-200"
    >
      <div class="flex items-start justify-between">
        <div class="w-11 h-11 rounded-xl bg-[#edf5ef] text-[#346246] flex items-center justify-center border border-[#d6e8da] group-hover:scale-105 transition-transform duration-200">
          <ShieldCheck class="w-5 h-5" />
        </div>
        <div class="flex items-center gap-1 text-[#5b7365]">
          <span class="text-[11px] font-bold tracking-wider uppercase">Active</span>
          <ChevronRight class="w-4 h-4 text-[#8ea496] group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      <div class="mt-4">
        <p class="text-3xl font-extrabold tracking-tight text-[#172a1f]">
          {{ stats.activeCount.toLocaleString() }}
        </p>
      </div>

      <div class="mt-4 flex items-center gap-2 pt-3 border-t border-[#edf3ee] text-xs text-[#607567]">
        <span class="inline-flex items-center gap-1 text-[#215d39] font-medium bg-[#e7f4ea] px-2.5 py-0.5 rounded-full text-[11px] border border-[#cbe6d2]">
          <ArrowUp class="w-3 h-3 text-[#215d39]" />
          {{ stats.totalEstablishments > 0 ? Math.round((stats.activeCount / stats.totalEstablishments) * 100) : 0 }}%
        </span>
        <span class="truncate">In full regulatory compliance</span>
      </div>
    </div>

    <!-- 3. Expired LTO -->
    <div
      class="group bg-white rounded-2xl border border-[#e3ece5] p-5 shadow-xs hover:shadow-md hover:border-[#f5c7c5] transition-all duration-200"
    >
      <div class="flex items-start justify-between">
        <div class="w-11 h-11 rounded-xl bg-[#fef2f0] text-[#c94242] flex items-center justify-center border border-[#fcdcd9] group-hover:scale-105 transition-transform duration-200">
          <AlertTriangle class="w-5 h-5" />
        </div>
        <div class="flex items-center gap-1 text-[#5b7365]">
          <span class="text-[11px] font-bold tracking-wider uppercase">Expired LTO</span>
          <ChevronRight class="w-4 h-4 text-[#8ea496] group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      <div class="mt-4">
        <p class="text-3xl font-extrabold tracking-tight text-[#172a1f]">
          {{ stats.expiredLtoCount.toLocaleString() }}
        </p>
      </div>

      <div class="mt-4 flex items-center gap-2 pt-3 border-t border-[#edf3ee] text-xs text-[#607567]">
        <span class="inline-flex items-center gap-1 text-[#b91c1c] font-medium bg-[#fde8e8] px-2.5 py-0.5 rounded-full text-[11px] border border-[#f8b4b4]">
          <span class="w-1.5 h-1.5 rounded-full bg-[#dc2626]"></span>
          Immediate Action
        </span>
        <span class="truncate">License renewal needed</span>
      </div>
    </div>

    <!-- 4. Upcoming Inspections -->
    <div
      class="group bg-white rounded-2xl border border-[#e3ece5] p-5 shadow-xs hover:shadow-md hover:border-[#cbded0] transition-all duration-200"
    >
      <div class="flex items-start justify-between">
        <div class="w-11 h-11 rounded-xl bg-[#edf5ef] text-[#346246] flex items-center justify-center border border-[#d6e8da] group-hover:scale-105 transition-transform duration-200">
          <CalendarClock class="w-5 h-5" />
        </div>
        <div class="flex items-center gap-1 text-[#5b7365]">
          <span class="text-[11px] font-bold tracking-wider uppercase">Upcoming Inspections</span>
          <ChevronRight class="w-4 h-4 text-[#8ea496] group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      <div class="mt-4">
        <p class="text-3xl font-extrabold tracking-tight text-[#172a1f]">
          {{ stats.upcomingInspectionsCount.toLocaleString() }}
        </p>
      </div>

      <div class="mt-4 flex items-center gap-2 pt-3 border-t border-[#edf3ee] text-xs text-[#607567]">
        <span class="inline-flex items-center text-[#215d39] font-medium bg-[#e7f4ea] px-2.5 py-0.5 rounded-full text-[11px] border border-[#cbe6d2]">
          Next 60 Days
        </span>
        <span class="truncate">Scheduled surveillance audits</span>
      </div>
    </div>
  </div>
</template>
