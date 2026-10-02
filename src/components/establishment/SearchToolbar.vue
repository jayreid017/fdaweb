<script setup lang="ts">
import { computed } from 'vue';
import type { FilterState } from '../../types/establishment';
import { 
  PRODUCT_TYPES, 
  PHILIPPINE_LOCATIONS, 
  ESTABLISHMENT_STATUSES, 
  INSPECTION_STATUSES 
} from '../../data/locationData';
import { Search, X, ChevronDown } from 'lucide-vue-next';

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
    props.filters.product_type ||
    props.filters.province ||
    props.filters.city_municipality ||
    props.filters.status ||
    props.filters.status_last_inspection
  );
});

function handleSearchChange(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  emit('update:filters', { ...props.filters, search: value });
}

function handleSelectChange(key: keyof FilterState, value: string) {
  const updated = { ...props.filters, [key]: value };
  if (key === 'province' && value && PHILIPPINE_LOCATIONS[value]) {
    if (!PHILIPPINE_LOCATIONS[value].includes(updated.city_municipality)) {
      updated.city_municipality = '';
    }
  }
  emit('update:filters', updated);
}
</script>

<template>
  <div class="bg-[#FFFEFB] rounded-2xl border border-[#E8E3D8] shadow-xs p-5 sm:p-6 space-y-4">
    <!-- Top Row: Search Input + Reset Filters Button -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
      <!-- Search Input -->
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7A8E81]">
          <Search class="w-4 h-4 stroke-[2]" />
        </div>
        <input
          id="establishment-search-input"
          type="text"
          :value="filters.search"
          @input="handleSearchChange"
          placeholder="Search by name, LTO #, owner, contact, email, province, municipality, or inspector..."
          class="w-full pl-11 pr-10 py-3 bg-[#F6F4EE] hover:bg-[#F0EEE6] focus:bg-[#FFFEFB] text-xs sm:text-[13.5px] text-[#162A1F] placeholder:text-[#8E9F94] border border-[#E2DDD0] rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-[#1E4B35]/15 focus:border-[#1E4B35] transition-all duration-150"
        />
        <button
          v-if="filters.search"
          type="button"
          @click="handleSelectChange('search', '')"
          class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#889D90] hover:text-[#162A1F] cursor-pointer"
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
          'inline-flex items-center justify-center px-6 py-3 text-xs sm:text-[13px] font-medium rounded-2xl border transition-all duration-150',
          hasActiveFilters
            ? 'bg-[#F6F4EE] hover:bg-[#EAE6DB] text-[#1E4B35] border-[#D4CEBF] shadow-2xs cursor-pointer font-semibold'
            : 'bg-[#F6F4EE]/60 text-[#9DAEA3] border-[#E8E4D8] cursor-not-allowed opacity-80',
        ]"
      >
        <span>Reset filters</span>
      </button>
    </div>

    <!-- Filter Selects Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 pt-0.5">
      <!-- 1. Product Type -->
      <div>
        <label for="filter-product-type" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#44564B] mb-1.5 font-sans">
          Product type
        </label>
        <div class="relative">
          <select
            id="filter-product-type"
            :value="filters.product_type"
            @change="(e) => handleSelectChange('product_type', (e.target as HTMLSelectElement).value)"
            class="w-full py-2.5 sm:py-3 pl-4 pr-9 text-xs sm:text-[13px] bg-[#F6F4EE] hover:bg-[#F0EEE6] focus:bg-[#FFFEFB] text-[#162A1F] border border-[#E2DDD0] rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-[#1E4B35]/15 focus:border-[#1E4B35] transition-all appearance-none cursor-pointer font-medium"
          >
            <option value="">All product types</option>
            <option v-for="type in PRODUCT_TYPES" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#5A6F62]">
            <ChevronDown class="w-4 h-4 stroke-[2]" />
          </div>
        </div>
      </div>

      <!-- 2. Province -->
      <div>
        <label for="filter-province" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#44564B] mb-1.5 font-sans">
          Province
        </label>
        <div class="relative">
          <select
            id="filter-province"
            :value="filters.province"
            @change="(e) => handleSelectChange('province', (e.target as HTMLSelectElement).value)"
            class="w-full py-2.5 sm:py-3 pl-4 pr-9 text-xs sm:text-[13px] bg-[#F6F4EE] hover:bg-[#F0EEE6] focus:bg-[#FFFEFB] text-[#162A1F] border border-[#E2DDD0] rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-[#1E4B35]/15 focus:border-[#1E4B35] transition-all appearance-none cursor-pointer font-medium"
          >
            <option value="">All provinces</option>
            <option v-for="province in provincesList" :key="province" :value="province">
              {{ province }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#5A6F62]">
            <ChevronDown class="w-4 h-4 stroke-[2]" />
          </div>
        </div>
      </div>

      <!-- 3. City / Municipality -->
      <div>
        <label for="filter-city" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#44564B] mb-1.5 font-sans">
          City / municipality
        </label>
        <div class="relative">
          <select
            id="filter-city"
            :value="filters.city_municipality"
            @change="(e) => handleSelectChange('city_municipality', (e.target as HTMLSelectElement).value)"
            class="w-full py-2.5 sm:py-3 pl-4 pr-9 text-xs sm:text-[13px] bg-[#F6F4EE] hover:bg-[#F0EEE6] focus:bg-[#FFFEFB] text-[#162A1F] border border-[#E2DDD0] rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-[#1E4B35]/15 focus:border-[#1E4B35] transition-all appearance-none cursor-pointer font-medium"
          >
            <option value="">All cities</option>
            <option v-for="city in availableCities" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#5A6F62]">
            <ChevronDown class="w-4 h-4 stroke-[2]" />
          </div>
        </div>
      </div>

      <!-- 4. Status -->
      <div>
        <label for="filter-status" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#44564B] mb-1.5 font-sans">
          Status
        </label>
        <div class="relative">
          <select
            id="filter-status"
            :value="filters.status"
            @change="(e) => handleSelectChange('status', (e.target as HTMLSelectElement).value)"
            class="w-full py-2.5 sm:py-3 pl-4 pr-9 text-xs sm:text-[13px] bg-[#F6F4EE] hover:bg-[#F0EEE6] focus:bg-[#FFFEFB] text-[#162A1F] border border-[#E2DDD0] rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-[#1E4B35]/15 focus:border-[#1E4B35] transition-all appearance-none cursor-pointer font-medium"
          >
            <option value="">All statuses</option>
            <option v-for="st in ESTABLISHMENT_STATUSES" :key="st" :value="st">
              {{ st }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#5A6F62]">
            <ChevronDown class="w-4 h-4 stroke-[2]" />
          </div>
        </div>
      </div>

      <!-- 5. Status of Last Inspection -->
      <div class="col-span-2 sm:col-span-1">
        <label for="filter-inspection-status" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#44564B] mb-1.5 font-sans">
          Last inspection
        </label>
        <div class="relative">
          <select
            id="filter-inspection-status"
            :value="filters.status_last_inspection"
            @change="(e) => handleSelectChange('status_last_inspection', (e.target as HTMLSelectElement).value)"
            class="w-full py-2.5 sm:py-3 pl-4 pr-9 text-xs sm:text-[13px] bg-[#F6F4EE] hover:bg-[#F0EEE6] focus:bg-[#FFFEFB] text-[#162A1F] border border-[#E2DDD0] rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-[#1E4B35]/15 focus:border-[#1E4B35] transition-all appearance-none cursor-pointer font-medium"
          >
            <option value="">All results</option>
            <option v-for="inst in INSPECTION_STATUSES" :key="inst" :value="inst">
              {{ inst }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#5A6F62]">
            <ChevronDown class="w-4 h-4 stroke-[2]" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
