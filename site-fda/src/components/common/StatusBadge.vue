<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    status: string;
    type?: 'establishment' | 'inspection';
    size?: 'sm' | 'md';
  }>(),
  {
    type: 'establishment',
    size: 'sm',
  }
);

interface BadgeStyle {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

const badgeStyle = computed<BadgeStyle>(() => {
  const norm = props.status?.trim().toLowerCase();

  switch (norm) {
    case 'active':
    case 'completed':
      return {
        bg: 'bg-[#e7f4ea]',
        text: 'text-[#215d39]',
        border: 'border-[#c6e6cf]',
        dot: 'bg-[#2e7d4d]',
      };
    case 'pending':
      return {
        bg: 'bg-[#fef6e7]',
        text: 'text-[#945511]',
        border: 'border-[#fbe2b5]',
        dot: 'bg-[#d97706]',
      };
    case 'expired':
    case 'failed':
      return {
        bg: 'bg-[#fdefef]',
        text: 'text-[#b82a2a]',
        border: 'border-[#f8c8c8]',
        dot: 'bg-[#dc2626]',
      };
    case 'for inspection':
      return {
        bg: 'bg-[#e6f0fa]',
        text: 'text-[#1e5888]',
        border: 'border-[#c5ddf5]',
        dot: 'bg-[#2563eb]',
      };
    case 'scheduled':
      return {
        bg: 'bg-[#edf4ee]',
        text: 'text-[#326145]',
        border: 'border-[#cfe2d4]',
        dot: 'bg-[#3b7a54]',
      };
    case 'inactive':
    default:
      return {
        bg: 'bg-[#edf2ee]',
        text: 'text-[#566b5e]',
        border: 'border-[#d4dfd7]',
        dot: 'bg-[#82998a]',
      };
  }
});
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors',
      badgeStyle.bg,
      badgeStyle.text,
      badgeStyle.border,
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-sm',
    ]"
  >
    <span :class="['w-1.5 h-1.5 rounded-full shrink-0', badgeStyle.dot]" aria-hidden="true" />
    <span class="whitespace-nowrap">{{ status }}</span>
  </span>
</template>
