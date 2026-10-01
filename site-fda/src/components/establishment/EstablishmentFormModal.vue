<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted, computed } from 'vue';
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
  FileBadge2, 
  MapPin, 
  UserCheck, 
  ClipboardCheck, 
  AlertCircle 
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  establishment: Establishment | null; // null means Add, object means Edit
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
  establishmentName: '',
  productType: 'Food',
  primaryActivity: 'Manufacturer',
  specificActivities: '',
  productLine: '',
  products: '',
  ltoNumber: '',
  ltoIssuanceDate: '',
  expiryDate: '',
  address: '',
  province: 'Baguio',
  cityMunicipality: 'Session Road District',
  owner: '',
  contactNumber: '',
  emailAddress: '',
  lastInspection: '',
  statusOfLastInspection: 'Completed',
  frequency: 'Annually',
  nextInspection: '',
  typeInspection: 'Routine Inspection',
  inspector: '',
  status: 'Active',
});

const errors = reactive<FormErrors>({});

function resetForm() {
  if (props.establishment) {
    // Populate with existing data
    form.establishmentName = props.establishment.establishmentName || '';
    form.productType = props.establishment.productType || 'Food';
    form.primaryActivity = props.establishment.primaryActivity || 'Manufacturer';
    form.specificActivities = props.establishment.specificActivities || '';
    form.productLine = props.establishment.productLine || '';
    form.products = props.establishment.products || '';
    form.ltoNumber = props.establishment.ltoNumber || '';
    form.ltoIssuanceDate = props.establishment.ltoIssuanceDate || '';
    form.expiryDate = props.establishment.expiryDate || '';
    form.address = props.establishment.address || '';
    form.province = props.establishment.province || 'Baguio';
    form.cityMunicipality = props.establishment.cityMunicipality || 'Session Road District';
    form.owner = props.establishment.owner || '';
    form.contactNumber = props.establishment.contactNumber || '';
    form.emailAddress = props.establishment.emailAddress || '';
    form.lastInspection = props.establishment.lastInspection || '';
    form.statusOfLastInspection = props.establishment.statusOfLastInspection || 'Completed';
    form.frequency = props.establishment.frequency || 'Annually';
    form.nextInspection = props.establishment.nextInspection || '';
    form.typeInspection = props.establishment.typeInspection || 'Routine Inspection';
    form.inspector = props.establishment.inspector || '';
    form.status = props.establishment.status || 'Active';
  } else {
    // Reset to clean defaults
    form.establishmentName = '';
    form.productType = 'Food';
    form.primaryActivity = 'Manufacturer';
    form.specificActivities = '';
    form.productLine = '';
    form.products = '';
    form.ltoNumber = '';
    form.ltoIssuanceDate = new Date().toISOString().split('T')[0];
    const exp = new Date();
    exp.setFullYear(exp.getFullYear() + 3);
    form.expiryDate = exp.toISOString().split('T')[0];
    form.address = '';
    form.province = 'Baguio';
    form.cityMunicipality = 'Session Road District';
    form.owner = '';
    form.contactNumber = '';
    form.emailAddress = '';
    form.lastInspection = '';
    form.statusOfLastInspection = 'Completed';
    form.frequency = 'Annually';
    const nxt = new Date();
    nxt.setFullYear(nxt.getFullYear() + 1);
    form.nextInspection = nxt.toISOString().split('T')[0];
    form.typeInspection = 'Routine Inspection';
    form.inspector = '';
    form.status = 'Active';
  }

  // Clear errors
  Object.keys(errors).forEach((k) => delete errors[k]);
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
      if (!cities.includes(form.cityMunicipality)) {
        form.cityMunicipality = cities[0] || '';
      }
    }
  }
);

function validateField(field: keyof EstablishmentFormData): boolean {
  let isValid = true;
  errors[field] = undefined;

  switch (field) {
    case 'establishmentName':
      if (!form.establishmentName.trim()) {
        errors.establishmentName = 'Establishment name is required';
        isValid = false;
      }
      break;

    case 'productType':
      if (!form.productType) {
        errors.productType = 'Please select a product type';
        isValid = false;
      }
      break;

    case 'primaryActivity':
      if (!form.primaryActivity) {
        errors.primaryActivity = 'Primary activity is required';
        isValid = false;
      }
      break;

    case 'ltoNumber':
      if (!form.ltoNumber.trim()) {
        errors.ltoNumber = 'LTO Number is required';
        isValid = false;
      } else if (form.ltoNumber.trim().length < 6) {
        errors.ltoNumber = 'Please enter a valid LTO number (e.g. FDA-CDRR-2024-00123)';
        isValid = false;
      }
      break;

    case 'ltoIssuanceDate':
      if (!form.ltoIssuanceDate) {
        errors.ltoIssuanceDate = 'Issuance date is required';
        isValid = false;
      }
      break;

    case 'expiryDate':
      if (!form.expiryDate) {
        errors.expiryDate = 'Expiry date is required';
        isValid = false;
      } else if (form.ltoIssuanceDate && new Date(form.expiryDate) < new Date(form.ltoIssuanceDate)) {
        errors.expiryDate = 'Expiry date cannot be earlier than issuance date';
        isValid = false;
      }
      break;

    case 'address':
      if (!form.address.trim()) {
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

    case 'cityMunicipality':
      if (!form.cityMunicipality) {
        errors.cityMunicipality = 'City or municipality is required';
        isValid = false;
      }
      break;

    case 'owner':
      if (!form.owner.trim()) {
        errors.owner = 'Owner name is required';
        isValid = false;
      }
      break;

    case 'contactNumber':
      if (!form.contactNumber.trim()) {
        errors.contactNumber = 'Contact number is required';
        isValid = false;
      } else if (!/^[0-9+\s\-()]{7,20}$/.test(form.contactNumber.trim())) {
        errors.contactNumber = 'Enter a valid phone number (e.g. +63 917 123 4567)';
        isValid = false;
      }
      break;

    case 'emailAddress':
      if (!form.emailAddress.trim()) {
        errors.emailAddress = 'Email address is required';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress.trim())) {
        errors.emailAddress = 'Please enter a valid email address';
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
    'establishmentName',
    'productType',
    'primaryActivity',
    'ltoNumber',
    'ltoIssuanceDate',
    'expiryDate',
    'address',
    'province',
    'cityMunicipality',
    'owner',
    'contactNumber',
    'emailAddress',
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
          class="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-[#dbe6de] overflow-hidden flex flex-col max-h-[90vh]"
        >
          <!-- Fixed Header -->
          <div class="px-6 py-4 border-b border-[#e5eee7] bg-[#f8faf8] flex items-center justify-between shrink-0">
            <div>
              <h2 class="text-lg font-bold text-[#172a1f]">
                {{ establishment ? 'Edit Establishment' : 'Add Establishment' }}
              </h2>
              <p class="text-xs text-[#5e7768] mt-0.5">
                {{ establishment ? 'Update establishment information.' : 'Enter the establishment information below.' }}
              </p>
            </div>
            <button
              type="button"
              @click="emit('close')"
              class="text-[#7c9586] hover:text-[#172a1f] p-1.5 rounded-lg hover:bg-[#eaf2ec] transition-colors cursor-pointer"
              title="Close modal (Esc)"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Section Navigation Tabs -->
          <div class="px-6 pt-3 pb-2 border-b border-[#eef4f0] bg-white flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
            <button
              type="button"
              @click="activeTab = 'all'"
              :class="[
                'px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0',
                activeTab === 'all' ? 'bg-[#366649] text-white shadow-2xs' : 'text-[#486353] hover:bg-[#edf5ef]'
              ]"
            >
              All Sections
            </button>
            <button
              type="button"
              @click="activeTab = 'establishment'"
              :class="[
                'px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5',
                activeTab === 'establishment' ? 'bg-[#366649] text-white shadow-2xs' : 'text-[#486353] hover:bg-[#edf5ef]'
              ]"
            >
              <Building2 class="w-3.5 h-3.5" />
              1. Establishment
            </button>
            <button
              type="button"
              @click="activeTab = 'license'"
              :class="[
                'px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5',
                activeTab === 'license' ? 'bg-[#366649] text-white shadow-2xs' : 'text-[#486353] hover:bg-[#edf5ef]'
              ]"
            >
              <FileBadge2 class="w-3.5 h-3.5" />
              2. License
            </button>
            <button
              type="button"
              @click="activeTab = 'location'"
              :class="[
                'px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5',
                activeTab === 'location' ? 'bg-[#366649] text-white shadow-2xs' : 'text-[#486353] hover:bg-[#edf5ef]'
              ]"
            >
              <MapPin class="w-3.5 h-3.5" />
              3. Location
            </button>
            <button
              type="button"
              @click="activeTab = 'contact'"
              :class="[
                'px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5',
                activeTab === 'contact' ? 'bg-[#366649] text-white shadow-2xs' : 'text-[#486353] hover:bg-[#edf5ef]'
              ]"
            >
              <UserCheck class="w-3.5 h-3.5" />
              4. Contact
            </button>
            <button
              type="button"
              @click="activeTab = 'inspection'"
              :class="[
                'px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5',
                activeTab === 'inspection' ? 'bg-[#366649] text-white shadow-2xs' : 'text-[#486353] hover:bg-[#edf5ef]'
              ]"
            >
              <ClipboardCheck class="w-3.5 h-3.5" />
              5. Inspection
            </button>
          </div>

          <!-- Scrollable Form Body -->
          <div class="px-6 py-5 overflow-y-auto flex-1 space-y-6">
            <!-- SECTION 1: Establishment Information -->
            <section
              v-show="activeTab === 'all' || activeTab === 'establishment'"
              class="bg-[#f9fbf9] rounded-xl p-4 sm:p-5 border border-[#e3ede6] space-y-4"
            >
              <div class="flex items-center gap-2 border-b border-[#e4ede7] pb-2.5">
                <Building2 class="w-4 h-4 text-[#366649]" />
                <h3 class="text-xs font-bold text-[#244331] uppercase tracking-wider">
                  Section 1 — Establishment Information
                </h3>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Establishment Name -->
                <div class="sm:col-span-2 lg:col-span-3">
                  <label for="form-name" class="block text-xs font-bold text-[#264433] mb-1">
                    Establishment Name <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="form-name"
                    type="text"
                    v-model="form.establishmentName"
                    @blur="validateField('establishmentName')"
                    placeholder="e.g. Benguet Highland Harvest & Agro-Processing Corp."
                    :class="[
                      'w-full px-3.5 py-2 text-xs sm:text-sm bg-white border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 transition-colors',
                      errors.establishmentName ? 'border-rose-400 focus:border-rose-500' : 'border-[#d7e3db] focus:border-[#366649]'
                    ]"
                  />
                  <p v-if="errors.establishmentName" class="text-rose-600 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle class="w-3 h-3" /> {{ errors.establishmentName }}
                  </p>
                </div>

                <!-- Product Type -->
                <div>
                  <label for="form-product-type" class="block text-xs font-bold text-[#264433] mb-1">
                    Product Type <span class="text-rose-500">*</span>
                  </label>
                  <select
                    id="form-product-type"
                    v-model="form.productType"
                    @blur="validateField('productType')"
                    class="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d7e3db] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
                  >
                    <option v-for="type in PRODUCT_TYPES" :key="type" :value="type">
                      {{ type }}
                    </option>
                  </select>
                </div>

                <!-- Primary Activity -->
                <div>
                  <label for="form-primary-activity" class="block text-xs font-bold text-[#264433] mb-1">
                    Primary Activity <span class="text-rose-500">*</span>
                  </label>
                  <select
                    id="form-primary-activity"
                    v-model="form.primaryActivity"
                    @blur="validateField('primaryActivity')"
                    class="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d7e3db] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
                  >
                    <option v-for="act in PRIMARY_ACTIVITIES" :key="act" :value="act">
                      {{ act }}
                    </option>
                  </select>
                </div>

                <!-- Specific Activity/s -->
                <div>
                  <label for="form-specific-activities" class="block text-xs font-bold text-[#264433] mb-1">
                    Specific Activity/s
                  </label>
                  <input
                    id="form-specific-activities"
                    type="text"
                    v-model="form.specificActivities"
                    placeholder="e.g. Toll Manufacturer, Repacker"
                    class="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d7e3db] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
                  />
                </div>

                <!-- Product Line -->
                <div class="sm:col-span-2 lg:col-span-1">
                  <label for="form-product-line" class="block text-xs font-bold text-[#264433] mb-1">
                    Product Line
                  </label>
                  <input
                    id="form-product-line"
                    type="text"
                    v-model="form.productLine"
                    placeholder="e.g. Preserved Highland Vegetables & Berry Conserves"
                    class="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d7e3db] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
                  />
                </div>

                <!-- Products -->
                <div class="sm:col-span-2 lg:col-span-2">
                  <label for="form-products" class="block text-xs font-bold text-[#264433] mb-1">
                    Products
                  </label>
                  <input
                    id="form-products"
                    type="text"
                    v-model="form.products"
                    placeholder="e.g. Preserved Strawberries in Syrup, Carrot Nectar"
                    class="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d7e3db] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
                  />
                </div>
              </div>
            </section>

            <!-- SECTION 2: License Information -->
            <section
              v-show="activeTab === 'all' || activeTab === 'license'"
              class="bg-[#f9fbf9] rounded-xl p-4 sm:p-5 border border-[#e3ede6] space-y-4"
            >
              <div class="flex items-center gap-2 border-b border-[#e4ede7] pb-2.5">
                <FileBadge2 class="w-4 h-4 text-[#366649]" />
                <h3 class="text-xs font-bold text-[#244331] uppercase tracking-wider">
                  Section 2 — License Information
                </h3>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <!-- LTO Number -->
                <div>
                  <label for="form-lto-number" class="block text-xs font-bold text-[#264433] mb-1">
                    LTO Number <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="form-lto-number"
                    type="text"
                    v-model="form.ltoNumber"
                    @blur="validateField('ltoNumber')"
                    placeholder="e.g. FDA-CFRR-2024-00123"
                    :class="[
                      'w-full px-3 py-2 text-xs sm:text-sm font-mono bg-white border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 transition-colors',
                      errors.ltoNumber ? 'border-rose-400 focus:border-rose-500' : 'border-[#d7e3db] focus:border-[#366649]'
                    ]"
                  />
                  <p v-if="errors.ltoNumber" class="text-rose-600 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle class="w-3 h-3" /> {{ errors.ltoNumber }}
                  </p>
                </div>

                <!-- LTO Issuance Date -->
                <div>
                  <label for="form-lto-issuance" class="block text-xs font-bold text-[#264433] mb-1">
                    LTO Issuance Date <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="form-lto-issuance"
                    type="date"
                    v-model="form.ltoIssuanceDate"
                    @blur="validateField('ltoIssuanceDate')"
                    :class="[
                      'w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 transition-colors',
                      errors.ltoIssuanceDate ? 'border-rose-400 focus:border-rose-500' : 'border-[#d7e3db] focus:border-[#366649]'
                    ]"
                  />
                  <p v-if="errors.ltoIssuanceDate" class="text-rose-600 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle class="w-3 h-3" /> {{ errors.ltoIssuanceDate }}
                  </p>
                </div>

                <!-- Expiry Date -->
                <div>
                  <label for="form-expiry-date" class="block text-xs font-bold text-[#264433] mb-1">
                    Expiry <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="form-expiry-date"
                    type="date"
                    v-model="form.expiryDate"
                    @blur="validateField('expiryDate')"
                    :class="[
                      'w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 transition-colors',
                      errors.expiryDate ? 'border-rose-400 focus:border-rose-500' : 'border-[#d7e3db] focus:border-[#366649]'
                    ]"
                  />
                  <p v-if="errors.expiryDate" class="text-rose-600 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle class="w-3 h-3" /> {{ errors.expiryDate }}
                  </p>
                </div>
              </div>
            </section>

            <!-- SECTION 3: Location (Strictly CAR Provinces) -->
            <section
              v-show="activeTab === 'all' || activeTab === 'location'"
              class="bg-[#f9fbf9] rounded-xl p-4 sm:p-5 border border-[#e3ede6] space-y-4"
            >
              <div class="flex items-center gap-2 border-b border-[#e4ede7] pb-2.5">
                <MapPin class="w-4 h-4 text-[#366649]" />
                <h3 class="text-xs font-bold text-[#244331] uppercase tracking-wider">
                  Section 3 — Location
                </h3>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <!-- Address -->
                <div class="sm:col-span-3">
                  <label for="form-address" class="block text-xs font-bold text-[#264433] mb-1">
                    Address <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="form-address"
                    type="text"
                    v-model="form.address"
                    @blur="validateField('address')"
                    placeholder="e.g. Km 5 Strawberry Farm Road, Betag"
                    :class="[
                      'w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 transition-colors',
                      errors.address ? 'border-rose-400 focus:border-rose-500' : 'border-[#d7e3db] focus:border-[#366649]'
                    ]"
                  />
                  <p v-if="errors.address" class="text-rose-600 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle class="w-3 h-3" /> {{ errors.address }}
                  </p>
                </div>

                <!-- Province (Only the 7 from image 2) -->
                <div>
                  <label for="form-province" class="block text-xs font-bold text-[#264433] mb-1">
                    Province <span class="text-rose-500">*</span>
                  </label>
                  <select
                    id="form-province"
                    v-model="form.province"
                    @blur="validateField('province')"
                    class="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d7e3db] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
                  >
                    <option v-for="prov in provincesList" :key="prov" :value="prov">
                      {{ prov }}
                    </option>
                  </select>
                </div>

                <!-- City or Municipality -->
                <div class="sm:col-span-2">
                  <label for="form-city" class="block text-xs font-bold text-[#264433] mb-1">
                    City or Municipality <span class="text-rose-500">*</span>
                  </label>
                  <select
                    id="form-city"
                    v-model="form.cityMunicipality"
                    @blur="validateField('cityMunicipality')"
                    class="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d7e3db] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
                  >
                    <option v-for="city in (PHILIPPINE_LOCATIONS[form.province] || [])" :key="city" :value="city">
                      {{ city }}
                    </option>
                  </select>
                </div>
              </div>
            </section>

            <!-- SECTION 4: Owner & Contact -->
            <section
              v-show="activeTab === 'all' || activeTab === 'contact'"
              class="bg-[#f9fbf9] rounded-xl p-4 sm:p-5 border border-[#e3ede6] space-y-4"
            >
              <div class="flex items-center gap-2 border-b border-[#e4ede7] pb-2.5">
                <UserCheck class="w-4 h-4 text-[#366649]" />
                <h3 class="text-xs font-bold text-[#244331] uppercase tracking-wider">
                  Section 4 — Owner & Contact
                </h3>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <!-- Owner -->
                <div>
                  <label for="form-owner" class="block text-xs font-bold text-[#264433] mb-1">
                    Owner <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="form-owner"
                    type="text"
                    v-model="form.owner"
                    @blur="validateField('owner')"
                    placeholder="e.g. Federico Tan Jr."
                    :class="[
                      'w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 transition-colors',
                      errors.owner ? 'border-rose-400 focus:border-rose-500' : 'border-[#d7e3db] focus:border-[#366649]'
                    ]"
                  />
                  <p v-if="errors.owner" class="text-rose-600 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle class="w-3 h-3" /> {{ errors.owner }}
                  </p>
                </div>

                <!-- Contact Number -->
                <div>
                  <label for="form-contact-number" class="block text-xs font-bold text-[#264433] mb-1">
                    Contact Number <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="form-contact-number"
                    type="text"
                    v-model="form.contactNumber"
                    @blur="validateField('contactNumber')"
                    placeholder="e.g. +63 920 955 7712"
                    :class="[
                      'w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 transition-colors',
                      errors.contactNumber ? 'border-rose-400 focus:border-rose-500' : 'border-[#d7e3db] focus:border-[#366649]'
                    ]"
                  />
                  <p v-if="errors.contactNumber" class="text-rose-600 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle class="w-3 h-3" /> {{ errors.contactNumber }}
                  </p>
                </div>

                <!-- Email Address -->
                <div>
                  <label for="form-email" class="block text-xs font-bold text-[#264433] mb-1">
                    Email Address <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="form-email"
                    type="email"
                    v-model="form.emailAddress"
                    @blur="validateField('emailAddress')"
                    placeholder="e.g. qa.canning@highlandharvest.ph"
                    :class="[
                      'w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 transition-colors',
                      errors.emailAddress ? 'border-rose-400 focus:border-rose-500' : 'border-[#d7e3db] focus:border-[#366649]'
                    ]"
                  />
                  <p v-if="errors.emailAddress" class="text-rose-600 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle class="w-3 h-3" /> {{ errors.emailAddress }}
                  </p>
                </div>
              </div>
            </section>

            <!-- SECTION 5: Inspection Information & Status -->
            <section
              v-show="activeTab === 'all' || activeTab === 'inspection'"
              class="bg-[#f9fbf9] rounded-xl p-4 sm:p-5 border border-[#e3ede6] space-y-4"
            >
              <div class="flex items-center gap-2 border-b border-[#e4ede7] pb-2.5">
                <ClipboardCheck class="w-4 h-4 text-[#366649]" />
                <h3 class="text-xs font-bold text-[#244331] uppercase tracking-wider">
                  Section 5 — Inspection Information & Status
                </h3>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Last Inspection -->
                <div>
                  <label for="form-last-inspection" class="block text-xs font-bold text-[#264433] mb-1">
                    Last Inspection
                  </label>
                  <input
                    id="form-last-inspection"
                    type="date"
                    v-model="form.lastInspection"
                    class="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d7e3db] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
                  />
                </div>

                <!-- Status of Last Inspection -->
                <div>
                  <label for="form-status-last-insp" class="block text-xs font-bold text-[#264433] mb-1">
                    Status of Last Inspection
                  </label>
                  <select
                    id="form-status-last-insp"
                    v-model="form.statusOfLastInspection"
                    class="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d7e3db] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
                  >
                    <option v-for="st in INSPECTION_STATUSES" :key="st" :value="st">
                      {{ st }}
                    </option>
                  </select>
                </div>

                <!-- Frequency -->
                <div>
                  <label for="form-frequency" class="block text-xs font-bold text-[#264433] mb-1">
                    Frequency
                  </label>
                  <select
                    id="form-frequency"
                    v-model="form.frequency"
                    class="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d7e3db] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
                  >
                    <option v-for="freq in INSPECTION_FREQUENCIES" :key="freq" :value="freq">
                      {{ freq }}
                    </option>
                  </select>
                </div>

                <!-- Next Inspection -->
                <div>
                  <label for="form-next-inspection" class="block text-xs font-bold text-[#264433] mb-1">
                    Next Inspection
                  </label>
                  <input
                    id="form-next-inspection"
                    type="date"
                    v-model="form.nextInspection"
                    class="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d7e3db] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
                  />
                </div>

                <!-- Type Inspection -->
                <div class="sm:col-span-2">
                  <label for="form-type-inspection" class="block text-xs font-bold text-[#264433] mb-1">
                    Type Inspection
                  </label>
                  <select
                    id="form-type-inspection"
                    v-model="form.typeInspection"
                    class="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d7e3db] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
                  >
                    <option v-for="type in INSPECTION_TYPES" :key="type" :value="type">
                      {{ type }}
                    </option>
                  </select>
                </div>

                <!-- Inspector -->
                <div>
                  <label for="form-inspector" class="block text-xs font-bold text-[#264433] mb-1">
                    Inspector
                  </label>
                  <input
                    id="form-inspector"
                    type="text"
                    v-model="form.inspector"
                    placeholder="e.g. Dr. Maria Santos, RPh"
                    class="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d7e3db] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
                  />
                </div>

                <!-- Establishment Status -->
                <div>
                  <label for="form-establishment-status" class="block text-xs font-bold text-[#264433] mb-1">
                    Establishment Status <span class="text-rose-500">*</span>
                  </label>
                  <select
                    id="form-establishment-status"
                    v-model="form.status"
                    @blur="validateField('status')"
                    class="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d7e3db] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#366649]/20 focus:border-[#366649] transition-colors"
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
          <div class="px-6 py-4 border-t border-[#e5eee7] bg-[#f8faf8] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#486353] bg-white border border-[#d7e3db] rounded-xl hover:bg-[#edf5ef] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="handleSubmit"
              class="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#366649] rounded-xl hover:bg-[#2b533a] shadow-sm transition-all duration-150 cursor-pointer active:scale-98"
            >
              {{ establishment ? 'Save Changes' : 'Save Establishment' }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
