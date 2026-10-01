<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="i in 4"
      :key="i"
      class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs animate-pulse flex items-start justify-between"
    >
      <div class="space-y-3 flex-1">
        <div class="h-3.5 bg-slate-200 rounded w-24"></div>
        <div class="h-8 bg-slate-200 rounded w-16"></div>
        <div class="h-3 bg-slate-100 rounded w-32"></div>
      </div>
      <div class="w-11 h-11 bg-slate-100 rounded-xl"></div>
    </div>
  </div>
</template>
