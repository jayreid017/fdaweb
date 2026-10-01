<template>
  <div class="space-y-3 p-4 animate-pulse">
    <div
      v-for="i in 6"
      :key="i"
      class="h-12 bg-slate-100/80 rounded-lg flex items-center px-4 gap-4"
    >
      <div class="h-4 bg-slate-200 rounded w-8"></div>
      <div class="h-4 bg-slate-200 rounded w-48"></div>
      <div class="h-4 bg-slate-200 rounded w-24"></div>
      <div class="h-4 bg-slate-200 rounded w-32"></div>
      <div class="h-4 bg-slate-200 rounded w-36"></div>
      <div class="h-4 bg-slate-200 rounded w-20 ml-auto"></div>
    </div>
  </div>
</template>
