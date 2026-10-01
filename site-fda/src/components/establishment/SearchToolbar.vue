<script setup lang="ts">
import { computed } from 'vue';
import type { FilterState } from '../../types/establishment';
import { 
  PRODUCT_TYPES, 
  PHILIPPINE_LOCATIONS, 
  ESTABLISHMENT_STATUSES, 
  INSPECTION_STATUSES 
} from '../../data/locationData';
import { Search, RotateCcw, X } from 'lucide-vue-next';

const props = defineProps<{
  filters: FilterState;
}>();

const emit = defineEmits<{
  (e: 'update:filters', filters: FilterState): void;
  (e: 'reset'): void;
}>();

// Available cities based on selected province
const availableCities = computed(() => {
  if (props.filters.province && PHILIPPINE_LOCATIONS[props.filters.province]) {
    return PHILIPPINE_LOCATIONS[props.filters.province];
  }
  const allCities = Object.values(PHILIPPINE_LOCATIONS).flat();
  return Array.from(new Set(allCities)).sort();
});

// Provinces strictly limited to the user's second image:
// Abra, Baguio, Benguet, Mt. Province, Kalinga, Apayao, Ifugao
const provincesList = computed(() => {
  const allowedOrder = ['Abra', 'Baguio', 'Benguet', 'Mt. Province', 'Kalinga', 'Apayao', 'Ifugao'];
  return allowedOrder.filter((p) => p in PHILIPPINE_LOCATIONS);
});

const hasActiveFilters = computed(() => {
  return Boolean(
    props.filters.search ||
    props.filters.productType ||
    props.filters.province ||
    props.filters.cityMunicipality ||
    props.filters.status ||
    props.filters.inspectionStatus
  );
});

function handleSearchChange(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  emit('update:filters', { ...props.filters, search: value });
}

function handleSelectChange(key: keyof FilterState, value: string) {
  const updated = { ...props.filters, [key]: value };
  if (key === 'province' && value && PHILIPPINE_LOCATIONS[value]) {
    if (!PHILIPPINE_LOCATIONS[value].includes(updated.cityMunicipality)) {
      updated.cityMunicipality = '';
    }
  }
  emit('update:filters', updated);
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-[#e3ece5] shadow-xs p-4 sm:p-5 space-y-3.5">
    <!-- Top Row: Search Input + Reset Filters Button -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <!-- Search Input -->
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71887a]">
          <Search class="w-4 h-4" />
        </div>
        <input
          id="establishment-search-input"
          type="text"
          :value="filters.search"
          @input="handleSearchChange"
          placeholder="Search by name, LTO #, owner, contact, email, province, municipality, or inspector..."
          class="w-full pl-10 pr-10 py-2.5 bg-[#f8faf8] hover:bg-[#f3f7f4] focus:bg-white text-xs sm:text-sm text-[#172a1f] placeholder:text-[#889d90] border border-[#dce6df] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-all duration-150"
        />
        <button
          v-if="filters.search"
          type="button"
          @click="handleSelectChange('search', '')"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-[#889d90] hover:text-[#172a1f]"
          title="Clear search"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Reset Filters Button -->
      <button
        type="button"
        @click="emit('reset')"
        :disabled="!hasActiveFilters"
        :class="[
          'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all duration-150',
          hasActiveFilters
            ? 'bg-[#f4f8f5] hover:bg-[#ebf4ed] text-[#28573b] border-[#cfe0d4] hover:border-[#b8d1bf] shadow-2xs cursor-pointer'
            : 'bg-[#f9faf9] text-[#a4b5aa] border-[#e7eee9] cursor-not-allowed opacity-70',
        ]"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        <span>Reset Filters</span>
      </button>
    </div>

    <!-- Filter Selects Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
      <!-- 1. Product Type -->
      <div>
        <label for="filter-product-type" class="block text-[11px] font-bold text-[#556e5f] uppercase tracking-wider mb-1.5">
          Product Type
        </label>
        <select
          id="filter-product-type"
          :value="filters.productType"
          @change="(e) => handleSelectChange('productType', (e.target as HTMLSelectElement).value)"
          class="w-full py-2.5 px-3 text-xs bg-white text-[#1f3327] border border-[#dce6df] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
        >
          <option value="">All Product Types</option>
          <option v-for="type in PRODUCT_TYPES" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>

      <!-- 2. Province (Only the 7 from image 2) -->
      <div>
        <label for="filter-province" class="block text-[11px] font-bold text-[#556e5f] uppercase tracking-wider mb-1.5">
          Province
        </label>
        <select
          id="filter-province"
          :value="filters.province"
          @change="(e) => handleSelectChange('province', (e.target as HTMLSelectElement).value)"
          class="w-full py-2.5 px-3 text-xs bg-white text-[#1f3327] border border-[#dce6df] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
        >
          <option value="">All Provinces</option>
          <option v-for="province in provincesList" :key="province" :value="province">
            {{ province }}
          </option>
        </select>
      </div>

      <!-- 3. City / Municipality -->
      <div>
        <label for="filter-city" class="block text-[11px] font-bold text-[#556e5f] uppercase tracking-wider mb-1.5">
          City / Municipality
        </label>
        <select
          id="filter-city"
          :value="filters.cityMunicipality"
          @change="(e) => handleSelectChange('cityMunicipality', (e.target as HTMLSelectElement).value)"
          class="w-full py-2.5 px-3 text-xs bg-white text-[#1f3327] border border-[#dce6df] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
        >
          <option value="">All Cities / Municipalities</option>
          <option v-for="city in availableCities" :key="city" :value="city">
            {{ city }}
          </option>
        </select>
      </div>

      <!-- 4. Status -->
      <div>
        <label for="filter-status" class="block text-[11px] font-bold text-[#556e5f] uppercase tracking-wider mb-1.5">
          Status
        </label>
        <select
          id="filter-status"
          :value="filters.status"
          @change="(e) => handleSelectChange('status', (e.target as HTMLSelectElement).value)"
          class="w-full py-2.5 px-3 text-xs bg-white text-[#1f3327] border border-[#dce6df] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
        >
          <option value="">All Statuses</option>
          <option v-for="st in ESTABLISHMENT_STATUSES" :key="st" :value="st">
            {{ st }}
          </option>
        </select>
      </div>

      <!-- 5. Inspection Status -->
      <div class="col-span-2 sm:col-span-1">
        <label for="filter-inspection-status" class="block text-[11px] font-bold text-[#556e5f] uppercase tracking-wider mb-1.5">
          Inspection Status
        </label>
        <select
          id="filter-inspection-status"
          :value="filters.inspectionStatus"
          @change="(e) => handleSelectChange('inspectionStatus', (e.target as HTMLSelectElement).value)"
          class="w-full py-2.5 px-3 text-xs bg-white text-[#1f3327] border border-[#dce6df] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
        >
          <option value="">All Inspection Statuses</option>
          <option v-for="inst in INSPECTION_STATUSES" :key="inst" :value="inst">
            {{ inst }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
