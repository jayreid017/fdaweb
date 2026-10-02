<script setup lang="ts">
import { reactive, watch, ref, computed, onMounted, onUnmounted } from 'vue';
import type { Establishment, EstablishmentFormData, FormErrors } from '../../types/establishment';
import { 
  PRODUCT_TYPES, 
  PRIMARY_ACTIVITIES, 
  PHILIPPINE_LOCATIONS, 
  ESTABLISHMENT_STATUSES, 
  INSPECTION_STATUSES, 
  INSPECTION_FREQUENCIES, 
  INSPECTION_TYPES 
} from '../../data/locationData';
import { 
  X, 
  Building2, 
  Landmark,
  FileBadge2, 
  MapPin, 
  UserCheck, 
  ClipboardCheck, 
  AlertCircle 
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  establishment: Establishment | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', data: EstablishmentFormData): void;
}>();

const activeTab = ref<'all' | 'establishment' | 'license' | 'location' | 'contact' | 'inspection'>('all');

// Provinces strictly limited to Image 2:
// Abra, Baguio, Benguet, Mt. Province, Kalinga, Apayao, Ifugao
const provincesList = computed(() => {
  const allowedOrder = ['Abra', 'Baguio', 'Benguet', 'Mt. Province', 'Kalinga', 'Apayao', 'Ifugao'];
  return allowedOrder.filter((p) => p in PHILIPPINE_LOCATIONS);
});

const form = reactive<EstablishmentFormData>({
  establishment_name: '',
  product_type: 'Food',
  primary_activity: 'Manufacturer',
  specific_activities: '',
  product_line: '',
  products: '',
  lto_number: '',
  lto_issuance_date: '',
  expiry: '',
  address: '',
  province: 'Baguio',
  city_municipality: 'Session Road District',
  owner: '',
  contact_number: '',
  email_address: '',
  last_inspection: '',
  status_last_inspection: 'Completed',
  frequency: 'Annually',
  next_inspection: '',
  type_inspection: 'Routine Inspection',
  inspector: '',
  status: 'Active',
});

const errors = reactive<FormErrors>({});

function resetForm() {
  if (props.establishment) {
    // Populate with existing data
    form.establishment_name = props.establishment.establishment_name || '';
    form.product_type = props.establishment.product_type || '';
    form.primary_activity = props.establishment.primary_activity || 'Manufacturer';
    form.specific_activities = props.establishment.specific_activities || '';
    form.product_line = props.establishment.product_line || '';
    form.products = props.establishment.products || '';
    form.lto_number = props.establishment.lto_number || '';
    form.lto_issuance_date = props.establishment.lto_issuance_date || '';
    form.expiry = props.establishment.expiry || '';
    form.address = props.establishment.address || '';
    form.province = props.establishment.province || 'Baguio';
    form.city_municipality = props.establishment.city_municipality || 'Session Road District';
    form.owner = props.establishment.owner || '';
    form.contact_number = props.establishment.contact_number || '';
    form.email_address = props.establishment.email_address || '';
    form.last_inspection = props.establishment.last_inspection || '';
    form.status_last_inspection = props.establishment.status_last_inspection || 'Completed';
    form.frequency = props.establishment.frequency || 'Annually';
    form.next_inspection = props.establishment.next_inspection || '';
    form.type_inspection = props.establishment.type_inspection || 'Routine Inspection';
    form.inspector = props.establishment.inspector || '';
    form.status = props.establishment.status || 'Active';
  } else {
    // Reset to clean defaults
    form.establishment_name = '';
    form.product_type = 'Food';
    form.primary_activity = 'Manufacturer';
    form.specific_activities = '';
    form.product_line = '';
    form.products = '';
    form.lto_number = '';
    form.lto_issuance_date = new Date().toISOString().split('T')[0];
    const exp = new Date();
    exp.setFullYear(exp.getFullYear() + 3);
    form.expiry = exp.toISOString().split('T')[0];
    form.address = '';
    form.province = 'Baguio';
    form.city_municipality = 'Session Road District';
    form.owner = '';
    form.contact_number = '';
    form.email_address = '';
    form.last_inspection = '';
    form.status_last_inspection = 'Completed';
    form.frequency = 'Annually';
    const nxt = new Date();
    nxt.setFullYear(nxt.getFullYear() + 1);
    form.next_inspection = nxt.toISOString().split('T')[0];
    form.type_inspection = 'Routine Inspection';
    form.inspector = '';
    form.status = 'Active';
  }

  // Clear errors
  Object.keys(errors).forEach((key) => {
    delete errors[key];
  });
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      resetForm();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
);

watch(
  () => form.province,
  (newProvince) => {
    if (newProvince && PHILIPPINE_LOCATIONS[newProvince]) {
      const cities = PHILIPPINE_LOCATIONS[newProvince];
      if (!cities.includes(form.city_municipality || '')) {
        form.city_municipality = cities[0] || '';
      }
    }
  }
);

function validateField(field: keyof EstablishmentFormData): boolean {
  let isValid = true;
  errors[field] = undefined;

  switch (field) {
    case 'establishment_name':
      if (!form.establishment_name.trim()) {
        errors.establishment_name = 'Establishment name is required';
        isValid = false;
      }
      break;

    case 'product_type':
      if (!form.product_type) {
        errors.product_type = 'Please select a product type';
        isValid = false;
      }
      break;

    case 'primary_activity':
      if (!form.primary_activity) {
        errors.primary_activity = 'Primary activity is required';
        isValid = false;
      }
      break;

    case 'lto_number':
      if (!form.lto_number?.trim()) {
        errors.lto_number = 'LTO Number is required';
        isValid = false;
      } else if (form.lto_number.trim().length < 6) {
        errors.lto_number = 'Please enter a valid LTO number (e.g. FDA-CDRR-2024-00123)';
        isValid = false;
      }
      break;

    case 'lto_issuance_date':
      if (!form.lto_issuance_date) {
        errors.lto_issuance_date = 'Issuance date is required';
        isValid = false;
      }
      break;

    case 'expiry':
      if (!form.expiry) {
        errors.expiry = 'Expiry date is required';
        isValid = false;
      } else if (form.lto_issuance_date && new Date(form.expiry) < new Date(form.lto_issuance_date)) {
        errors.expiry = 'Expiry date cannot be earlier than issuance date';
        isValid = false;
      }
      break;

    case 'address':
      if (!form.address?.trim()) {
        errors.address = 'Street address is required';
        isValid = false;
      }
      break;

    case 'province':
      if (!form.province) {
        errors.province = 'Province is required';
        isValid = false;
      }
      break;

    case 'city_municipality':
      if (!form.city_municipality) {
        errors.city_municipality = 'City or municipality is required';
        isValid = false;
      }
      break;

    case 'owner':
      if (!form.owner?.trim()) {
        errors.owner = 'Owner name is required';
        isValid = false;
      }
      break;

    case 'contact_number':
      if (!form.contact_number?.trim()) {
        errors.contact_number = 'Contact number is required';
        isValid = false;
      } else if (!/^[0-9+\s\-()]{7,20}$/.test(form.contact_number.trim())) {
        errors.contact_number = 'Enter a valid phone number (e.g. +63 917 123 4567)';
        isValid = false;
      }
      break;

    case 'email_address':
      if (!form.email_address?.trim()) {
        errors.email_address = 'Email address is required';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email_address.trim())) {
        errors.email_address = 'Please enter a valid email address';
        isValid = false;
      }
      break;

    case 'status':
      if (!form.status) {
        errors.status = 'Status is required';
        isValid = false;
      }
      break;
  }

  return isValid;
}

function validateAll(): boolean {
  const fieldsToValidate: (keyof EstablishmentFormData)[] = [
    'establishment_name',
    'product_type',
    'primary_activity',
    'lto_number',
    'lto_issuance_date',
    'expiry',
    'address',
    'province',
    'city_municipality',
    'owner',
    'contact_number',
    'email_address',
    'status',
  ];

  let hasError = false;
  for (const field of fieldsToValidate) {
    if (!validateField(field)) {
      hasError = true;
    }
  }

  return !hasError;
}

function handleSubmit() {
  if (!validateAll()) {
    return;
  }
  emit('save', { ...form });
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close');
  }
}

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
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-[#172a1f]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 lg:p-6"
      @click.self="emit('close')"
      role="dialog"
      aria-modal="true"
    >
      <Transition name="modal-panel">
        <div
          v-if="isOpen"
          class="relative w-full max-w-4xl bg-[#F8F6EE] rounded-2xl shadow-2xl border border-[#DCE4DE] overflow-hidden flex flex-col max-h-[92vh]"
        >
          <!-- Header -->
          <div class="px-7 py-5.5 bg-[#FFFEFB] border-b border-[#EDE8DD] flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-[#E6F0EA] text-[#1D4A36] flex items-center justify-center font-bold border border-[#D5E4DA] shrink-0">
                <Landmark class="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h2 class="text-xl sm:text-2xl font-bold text-[#112419] leading-tight font-serif tracking-tight">
                  {{ establishment ? 'Edit establishment' : 'Add new establishment' }}
                </h2>
                <p class="text-xs sm:text-[13px] text-[#55695D] mt-0.5 font-normal">
                  {{ establishment ? 'Update establishment registration and license records.' : 'Enter complete regulatory information for the registry.' }}
                </p>
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

          <!-- Section Tabs -->
          <div class="px-7 border-b border-[#EDE8DD] bg-[#FFFEFB] overflow-x-auto flex gap-2 pt-1 text-xs shrink-0">
            <button
              type="button"
              @click="activeTab = 'all'"
              :class="[
                'px-3.5 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
                activeTab === 'all'
                  ? 'border-[#204F38] text-[#1B432F] font-bold'
                  : 'border-transparent text-[#627A6C] hover:text-[#182C21]'
              ]"
            >
              All Sections
            </button>
            <button
              type="button"
              @click="activeTab = 'establishment'"
              :class="[
                'px-3.5 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
                activeTab === 'establishment'
                  ? 'border-[#204F38] text-[#1B432F] font-bold'
                  : 'border-transparent text-[#627A6C] hover:text-[#182C21]'
              ]"
            >
              1. Establishment
            </button>
            <button
              type="button"
              @click="activeTab = 'license'"
              :class="[
                'px-3.5 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
                activeTab === 'license'
                  ? 'border-[#204F38] text-[#1B432F] font-bold'
                  : 'border-transparent text-[#627A6C] hover:text-[#182C21]'
              ]"
            >
              2. License
            </button>
            <button
              type="button"
              @click="activeTab = 'location'"
              :class="[
                'px-3.5 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
                activeTab === 'location'
                  ? 'border-[#204F38] text-[#1B432F] font-bold'
                  : 'border-transparent text-[#627A6C] hover:text-[#182C21]'
              ]"
            >
              3. Location
            </button>
            <button
              type="button"
              @click="activeTab = 'contact'"
              :class="[
                'px-3.5 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
                activeTab === 'contact'
                  ? 'border-[#204F38] text-[#1B432F] font-bold'
                  : 'border-transparent text-[#627A6C] hover:text-[#182C21]'
              ]"
            >
              4. Contact
            </button>
            <button
              type="button"
              @click="activeTab = 'inspection'"
              :class="[
                'px-3.5 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
                activeTab === 'inspection'
                  ? 'border-[#204F38] text-[#1B432F] font-bold'
                  : 'border-transparent text-[#627A6C] hover:text-[#182C21]'
              ]"
            >
              5. Inspection
            </button>
          </div>

          <!-- Form Body -->
          <div class="px-6 sm:px-7 py-6 overflow-y-auto flex-1 space-y-6 bg-[#F8F6EE]">
            <!-- SECTION 1: Establishment Information -->
            <section
              v-show="activeTab === 'all' || activeTab === 'establishment'"
              class="bg-[#FFFEFB] rounded-2xl p-6 sm:p-7 border border-[#E8E3D8] shadow-xs space-y-5"
            >
              <div class="flex items-center gap-2.5 border-b border-[#ECE7DC] pb-3.5">
                <Landmark class="w-4 h-4 text-[#A88C59] shrink-0 stroke-[2]" />
                <h3 class="text-xs font-bold text-[#1D4A36] uppercase tracking-wider font-sans">
                  Section 1 — Establishment Information
                </h3>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <!-- Establishment Name -->
                <div class="sm:col-span-2 lg:col-span-3">
                  <label for="form-name" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Establishment name <span class="text-[#C94242]">*</span>
                  </label>
                  <input
                    id="form-name"
                    type="text"
                    v-model="form.establishment_name"
                    @blur="validateField('establishment_name')"
                    placeholder="e.g. Benguet Highland Harvest & Agro-Processing Corp."
                    :class="[
                      'w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border rounded-xl text-[#16291E] placeholder:text-[#8E9F94] focus:outline-hidden focus:bg-[#FFFEFB] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150',
                      errors.establishment_name ? 'border-rose-400 focus:border-rose-500' : 'border-[#E2DDD0] focus:border-[#1D4A36]'
                    ]"
                  />
                  <p v-if="errors.establishment_name" class="text-rose-600 text-[11px] mt-1.5 flex items-center gap-1">
                    <AlertCircle class="w-3 h-3" /> {{ errors.establishment_name }}
                  </p>
                </div>

                <!-- Product Type -->
                <div>
                  <label for="form-product-type" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Product type <span class="text-[#C94242]">*</span>
                  </label>
                  <select
                    id="form-product-type"
                    v-model="form.product_type"
                    @blur="validateField('product_type')"
                    class="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border border-[#E2DDD0] rounded-xl text-[#16291E] focus:outline-hidden focus:bg-[#FFFEFB] focus:border-[#1D4A36] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150 cursor-pointer"
                  >
                    <option v-for="type in PRODUCT_TYPES" :key="type" :value="type">
                      {{ type }}
                    </option>
                  </select>
                </div>

                <!-- Primary Activity -->
                <div>
                  <label for="form-primary-activity" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Primary activity <span class="text-[#C94242]">*</span>
                  </label>
                  <select
                    id="form-primary-activity"
                    v-model="form.primary_activity"
                    @blur="validateField('primary_activity')"
                    class="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border border-[#E2DDD0] rounded-xl text-[#16291E] focus:outline-hidden focus:bg-[#FFFEFB] focus:border-[#1D4A36] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150 cursor-pointer"
                  >
                    <option v-for="act in PRIMARY_ACTIVITIES" :key="act" :value="act">
                      {{ act }}
                    </option>
                  </select>
                </div>

                <!-- Specific Activities -->
                <div>
                  <label for="form-specific-activities" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Specific activities
                  </label>
                  <input
                    id="form-specific-activities"
                    type="text"
                    v-model="form.specific_activities"
                    placeholder="e.g. Toll Manufacturer, Repacker"
                    class="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border border-[#E2DDD0] rounded-xl text-[#16291E] placeholder:text-[#8E9F94] focus:outline-hidden focus:bg-[#FFFEFB] focus:border-[#1D4A36] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150"
                  />
                </div>

                <!-- Product Line -->
                <div class="sm:col-span-2 lg:col-span-1">
                  <label for="form-product-line" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Product line
                  </label>
                  <input
                    id="form-product-line"
                    type="text"
                    v-model="form.product_line"
                    placeholder="e.g. Preserved Highland Vegetables"
                    class="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border border-[#E2DDD0] rounded-xl text-[#16291E] placeholder:text-[#8E9F94] focus:outline-hidden focus:bg-[#FFFEFB] focus:border-[#1D4A36] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150"
                  />
                </div>

                <!-- Products -->
                <div class="sm:col-span-2 lg:col-span-2">
                  <label for="form-products" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Products
                  </label>
                  <input
                    id="form-products"
                    type="text"
                    v-model="form.products"
                    placeholder="e.g. Preserved Strawberries in Syrup, Carrot Nectar"
                    class="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border border-[#E2DDD0] rounded-xl text-[#16291E] placeholder:text-[#8E9F94] focus:outline-hidden focus:bg-[#FFFEFB] focus:border-[#1D4A36] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150"
                  />
                </div>
              </div>
            </section>

            <!-- SECTION 2: License Information -->
            <section
              v-show="activeTab === 'all' || activeTab === 'license'"
              class="bg-[#FFFEFB] rounded-2xl p-6 sm:p-7 border border-[#E8E3D8] shadow-xs space-y-5"
            >
              <div class="flex items-center gap-2.5 border-b border-[#ECE7DC] pb-3.5">
                <FileBadge2 class="w-4 h-4 text-[#A88C59] shrink-0 stroke-[2]" />
                <h3 class="text-xs font-bold text-[#1D4A36] uppercase tracking-wider font-sans">
                  Section 2 — License Information
                </h3>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <!-- LTO Number -->
                <div>
                  <label for="form-lto-number" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    LTO number <span class="text-[#C94242]">*</span>
                  </label>
                  <input
                    id="form-lto-number"
                    type="text"
                    v-model="form.lto_number"
                    @blur="validateField('lto_number')"
                    placeholder="e.g. FDA-CFRR-2024-00123"
                    :class="[
                      'w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] font-mono bg-[#F5F4EC] border rounded-xl text-[#16291E] placeholder:text-[#8E9F94] focus:outline-hidden focus:bg-[#FFFEFB] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150',
                      errors.lto_number ? 'border-rose-400 focus:border-rose-500' : 'border-[#E2DDD0] focus:border-[#1D4A36]'
                    ]"
                  />
                  <p v-if="errors.lto_number" class="text-rose-600 text-[11px] mt-1.5 flex items-center gap-1">
                    <AlertCircle class="w-3 h-3" /> {{ errors.lto_number }}
                  </p>
                </div>

                <!-- LTO Issuance Date -->
                <div>
                  <label for="form-lto-issuance" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    LTO issuance date <span class="text-[#C94242]">*</span>
                  </label>
                  <input
                    id="form-lto-issuance"
                    type="date"
                    v-model="form.lto_issuance_date"
                    @blur="validateField('lto_issuance_date')"
                    :class="[
                      'w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border rounded-xl text-[#16291E] focus:outline-hidden focus:bg-[#FFFEFB] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150',
                      errors.lto_issuance_date ? 'border-rose-400 focus:border-rose-500' : 'border-[#E2DDD0] focus:border-[#1D4A36]'
                    ]"
                  />
                  <p v-if="errors.lto_issuance_date" class="text-rose-600 text-[11px] mt-1.5 flex items-center gap-1">
                    <AlertCircle class="w-3 h-3" /> {{ errors.lto_issuance_date }}
                  </p>
                </div>

                <!-- Expiry Date -->
                <div>
                  <label for="form-expiry-date" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Expiry <span class="text-[#C94242]">*</span>
                  </label>
                  <input
                    id="form-expiry-date"
                    type="date"
                    v-model="form.expiry"
                    @blur="validateField('expiry')"
                    :class="[
                      'w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border rounded-xl text-[#16291E] focus:outline-hidden focus:bg-[#FFFEFB] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150',
                      errors.expiry ? 'border-rose-400 focus:border-rose-500' : 'border-[#E2DDD0] focus:border-[#1D4A36]'
                    ]"
                  />
                  <p v-if="errors.expiry" class="text-rose-600 text-[11px] mt-1.5 flex items-center gap-1">
                    <AlertCircle class="w-3 h-3" /> {{ errors.expiry }}
                  </p>
                </div>
              </div>
            </section>

            <!-- SECTION 3: Location (Strictly CAR Provinces) -->
            <section
              v-show="activeTab === 'all' || activeTab === 'location'"
              class="bg-[#FFFEFB] rounded-2xl p-6 sm:p-7 border border-[#E8E3D8] shadow-xs space-y-5"
            >
              <div class="flex items-center gap-2.5 border-b border-[#ECE7DC] pb-3.5">
                <MapPin class="w-4 h-4 text-[#A88C59] shrink-0 stroke-[2]" />
                <h3 class="text-xs font-bold text-[#1D4A36] uppercase tracking-wider font-sans">
                  Section 3 — Location
                </h3>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <!-- Address -->
                <div class="sm:col-span-3">
                  <label for="form-address" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Address <span class="text-[#C94242]">*</span>
                  </label>
                  <input
                    id="form-address"
                    type="text"
                    v-model="form.address"
                    @blur="validateField('address')"
                    placeholder="e.g. Km 5 Strawberry Farm Road, Betag"
                    :class="[
                      'w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border rounded-xl text-[#16291E] placeholder:text-[#8E9F94] focus:outline-hidden focus:bg-[#FFFEFB] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150',
                      errors.address ? 'border-rose-400 focus:border-rose-500' : 'border-[#E2DDD0] focus:border-[#1D4A36]'
                    ]"
                  />
                  <p v-if="errors.address" class="text-rose-600 text-[11px] mt-1.5 flex items-center gap-1">
                    <AlertCircle class="w-3 h-3" /> {{ errors.address }}
                  </p>
                </div>

                <!-- Province -->
                <div>
                  <label for="form-province" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Province <span class="text-[#C94242]">*</span>
                  </label>
                  <select
                    id="form-province"
                    v-model="form.province"
                    @blur="validateField('province')"
                    class="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border border-[#E2DDD0] rounded-xl text-[#16291E] focus:outline-hidden focus:bg-[#FFFEFB] focus:border-[#1D4A36] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150 cursor-pointer"
                  >
                    <option v-for="prov in provincesList" :key="prov" :value="prov">
                      {{ prov }}
                    </option>
                  </select>
                </div>

                <!-- City or Municipality -->
                <div class="sm:col-span-2">
                  <label for="form-city" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    City / Municipality <span class="text-[#C94242]">*</span>
                  </label>
                  <select
                    id="form-city"
                    v-model="form.city_municipality"
                    @blur="validateField('city_municipality')"
                    class="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border border-[#E2DDD0] rounded-xl text-[#16291E] focus:outline-hidden focus:bg-[#FFFEFB] focus:border-[#1D4A36] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150 cursor-pointer"
                  >
                    <option v-for="city in (PHILIPPINE_LOCATIONS[form.province || ''] || [])" :key="city" :value="city">
                      {{ city }}
                    </option>
                  </select>
                </div>
              </div>
            </section>

            <!-- SECTION 4: Owner & Contact -->
            <section
              v-show="activeTab === 'all' || activeTab === 'contact'"
              class="bg-[#FFFEFB] rounded-2xl p-6 sm:p-7 border border-[#E8E3D8] shadow-xs space-y-5"
            >
              <div class="flex items-center gap-2.5 border-b border-[#ECE7DC] pb-3.5">
                <UserCheck class="w-4 h-4 text-[#A88C59] shrink-0 stroke-[2]" />
                <h3 class="text-xs font-bold text-[#1D4A36] uppercase tracking-wider font-sans">
                  Section 4 — Owner & Contact
                </h3>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <!-- Owner -->
                <div>
                  <label for="form-owner" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Owner <span class="text-[#C94242]">*</span>
                  </label>
                  <input
                    id="form-owner"
                    type="text"
                    v-model="form.owner"
                    @blur="validateField('owner')"
                    placeholder="e.g. Federico Tan Jr."
                    :class="[
                      'w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border rounded-xl text-[#16291E] placeholder:text-[#8E9F94] focus:outline-hidden focus:bg-[#FFFEFB] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150',
                      errors.owner ? 'border-rose-400 focus:border-rose-500' : 'border-[#E2DDD0] focus:border-[#1D4A36]'
                    ]"
                  />
                  <p v-if="errors.owner" class="text-rose-600 text-[11px] mt-1.5 flex items-center gap-1">
                    <AlertCircle class="w-3 h-3" /> {{ errors.owner }}
                  </p>
                </div>

                <!-- Contact Number -->
                <div>
                  <label for="form-contact-number" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Contact number <span class="text-[#C94242]">*</span>
                  </label>
                  <input
                    id="form-contact-number"
                    type="text"
                    v-model="form.contact_number"
                    @blur="validateField('contact_number')"
                    placeholder="e.g. +63 920 955 7712"
                    :class="[
                      'w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border rounded-xl text-[#16291E] placeholder:text-[#8E9F94] focus:outline-hidden focus:bg-[#FFFEFB] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150',
                      errors.contact_number ? 'border-rose-400 focus:border-rose-500' : 'border-[#E2DDD0] focus:border-[#1D4A36]'
                    ]"
                  />
                  <p v-if="errors.contact_number" class="text-rose-600 text-[11px] mt-1.5 flex items-center gap-1">
                    <AlertCircle class="w-3 h-3" /> {{ errors.contact_number }}
                  </p>
                </div>

                <!-- Email Address -->
                <div>
                  <label for="form-email" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Email address <span class="text-[#C94242]">*</span>
                  </label>
                  <input
                    id="form-email"
                    type="email"
                    v-model="form.email_address"
                    @blur="validateField('email_address')"
                    placeholder="e.g. qa.canning@highlandharvest.ph"
                    :class="[
                      'w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border rounded-xl text-[#16291E] placeholder:text-[#8E9F94] focus:outline-hidden focus:bg-[#FFFEFB] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150',
                      errors.email_address ? 'border-rose-400 focus:border-rose-500' : 'border-[#E2DDD0] focus:border-[#1D4A36]'
                    ]"
                  />
                  <p v-if="errors.email_address" class="text-rose-600 text-[11px] mt-1.5 flex items-center gap-1">
                    <AlertCircle class="w-3 h-3" /> {{ errors.email_address }}
                  </p>
                </div>
              </div>
            </section>

            <!-- SECTION 5: Inspection Information & Status -->
            <section
              v-show="activeTab === 'all' || activeTab === 'inspection'"
              class="bg-[#FFFEFB] rounded-2xl p-6 sm:p-7 border border-[#E8E3D8] shadow-xs space-y-5"
            >
              <div class="flex items-center gap-2.5 border-b border-[#ECE7DC] pb-3.5">
                <ClipboardCheck class="w-4 h-4 text-[#A88C59] shrink-0 stroke-[2]" />
                <h3 class="text-xs font-bold text-[#1D4A36] uppercase tracking-wider font-sans">
                  Section 5 — Inspection Information & Status
                </h3>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <!-- Last Inspection -->
                <div>
                  <label for="form-last-inspection" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Last inspection
                  </label>
                  <input
                    id="form-last-inspection"
                    type="date"
                    v-model="form.last_inspection"
                    class="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border border-[#E2DDD0] rounded-xl text-[#16291E] focus:outline-hidden focus:bg-[#FFFEFB] focus:border-[#1D4A36] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150"
                  />
                </div>

                <!-- Status of Last Inspection -->
                <div>
                  <label for="form-status-last-insp" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Status of last inspection
                  </label>
                  <select
                    id="form-status-last-insp"
                    v-model="form.status_last_inspection"
                    class="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border border-[#E2DDD0] rounded-xl text-[#16291E] focus:outline-hidden focus:bg-[#FFFEFB] focus:border-[#1D4A36] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150 cursor-pointer"
                  >
                    <option v-for="st in INSPECTION_STATUSES" :key="st" :value="st">
                      {{ st }}
                    </option>
                  </select>
                </div>

                <!-- Frequency -->
                <div>
                  <label for="form-frequency" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Frequency
                  </label>
                  <select
                    id="form-frequency"
                    v-model="form.frequency"
                    class="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border border-[#E2DDD0] rounded-xl text-[#16291E] focus:outline-hidden focus:bg-[#FFFEFB] focus:border-[#1D4A36] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150 cursor-pointer"
                  >
                    <option v-for="freq in INSPECTION_FREQUENCIES" :key="freq" :value="freq">
                      {{ freq }}
                    </option>
                  </select>
                </div>

                <!-- Next Inspection -->
                <div>
                  <label for="form-next-inspection" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Next inspection
                  </label>
                  <input
                    id="form-next-inspection"
                    type="date"
                    v-model="form.next_inspection"
                    class="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border border-[#E2DDD0] rounded-xl text-[#16291E] focus:outline-hidden focus:bg-[#FFFEFB] focus:border-[#1D4A36] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150"
                  />
                </div>

                <!-- Type of Inspection -->
                <div class="sm:col-span-2">
                  <label for="form-type-inspection" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Type of inspection
                  </label>
                  <select
                    id="form-type-inspection"
                    v-model="form.type_inspection"
                    class="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border border-[#E2DDD0] rounded-xl text-[#16291E] focus:outline-hidden focus:bg-[#FFFEFB] focus:border-[#1D4A36] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150 cursor-pointer"
                  >
                    <option v-for="type in INSPECTION_TYPES" :key="type" :value="type">
                      {{ type }}
                    </option>
                  </select>
                </div>

                <!-- Inspector -->
                <div>
                  <label for="form-inspector" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Inspector
                  </label>
                  <input
                    id="form-inspector"
                    type="text"
                    v-model="form.inspector"
                    placeholder="e.g. Dr. Maria Santos, RPh"
                    class="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border border-[#E2DDD0] rounded-xl text-[#16291E] placeholder:text-[#8E9F94] focus:outline-hidden focus:bg-[#FFFEFB] focus:border-[#1D4A36] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150"
                  />
                </div>

                <!-- Status -->
                <div>
                  <label for="form-establishment-status" class="block text-xs sm:text-[13px] font-medium sm:font-semibold text-[#3C4E43] mb-1.5 font-sans">
                    Status <span class="text-[#C94242]">*</span>
                  </label>
                  <select
                    id="form-establishment-status"
                    v-model="form.status"
                    @blur="validateField('status')"
                    class="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-[13.5px] bg-[#F5F4EC] border border-[#E2DDD0] rounded-xl text-[#16291E] focus:outline-hidden focus:bg-[#FFFEFB] focus:border-[#1D4A36] focus:ring-2 focus:ring-[#1D4A36]/15 transition-all duration-150 cursor-pointer"
                  >
                    <option v-for="st in ESTABLISHMENT_STATUSES" :key="st" :value="st">
                      {{ st }}
                    </option>
                  </select>
                </div>
              </div>
            </section>
          </div>

          <!-- Fixed Footer -->
          <div class="px-6 py-4.5 sm:px-8 sm:py-5 border-t border-[#E8E3D8] bg-[#FFFEFB] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              @click="emit('close')"
              class="px-5 sm:px-6 py-2.5 rounded-xl border border-[#DCD6C8] bg-[#F5F4EC] hover:bg-[#EAE6D9] text-[#1C2E23] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="handleSubmit"
              class="px-6 sm:px-7 py-2.5 rounded-xl bg-[#204F38] hover:bg-[#173F2C] text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all duration-150 cursor-pointer active:scale-98"
            >
              {{ establishment ? 'Save changes' : 'Save establishment' }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
