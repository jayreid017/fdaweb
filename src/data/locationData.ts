export interface ProvinceCityMap {
  [province: string]: string[];
}

// Only the provinces from the user's provided image:
// Abra, Baguio, Benguet, Mt. Province, Kalinga, Apayao, Ifugao
export const PHILIPPINE_LOCATIONS: ProvinceCityMap = {
  'Abra': [
    'Bangued',
    'Bucay',
    'Dolores',
    'La Paz',
    'Lagangilang',
    'Manabo',
    'Peñarrubia',
    'Pidigan',
    'San Juan',
    'Tayum',
  ],
  'Baguio': [
    'Session Road District',
    'Burnham - Legarda',
    'Camp 7',
    'Loakan',
    'Irisan',
    'Pacdal',
    'Mines View',
    'Trancoville',
    'Aurora Hill',
    'Bakakeng Central',
  ],
  'Benguet': [
    'La Trinidad',
    'Itogon',
    'Tuba',
    'Tublay',
    'Sablan',
    'Mankayan',
    'Buguias',
    'Atok',
    'Kibungan',
    'Kapangan',
    'Bokod',
    'Kabayan',
    'Bakun',
  ],
  'Mt. Province': [
    'Bontoc',
    'Sagada',
    'Bauko',
    'Besao',
    'Tadian',
    'Sabangan',
    'Sadanga',
    'Natonin',
    'Paracelis',
    'Barlig',
  ],
  'Kalinga': [
    'Tabuk City',
    'Tinglayan',
    'Lubuagan',
    'Pasil',
    'Balbalan',
    'Pinukpuk',
    'Rizal',
    'Tanudan',
  ],
  'Apayao': [
    'Luna',
    'Conner',
    'Flora',
    'Kabugao',
    'Pudtol',
    'Santa Marcela',
    'Calanasan',
  ],
  'Ifugao': [
    'Banaue',
    'Kiangan',
    'Lagawe',
    'Alfonso Lista',
    'Aguinaldo',
    'Asipulo',
    'Hingyon',
    'Hungduan',
    'Lamut',
    'Mayoyao',
    'Tinoc',
  ],
};

export const PRODUCT_TYPES = [
  'Food',
  'Drugs',
  'Medical Devices',
  'Cosmetics',
  'Household/Urban Hazardous',
  'Radiation Health',
] as const;

export const PRIMARY_ACTIVITIES = [
  'Manufacturer',
  'Wholesaler',
  'Distributor',
  'Importer',
  'Exporter',
  'Retailer',
  'Trader',
  'Toll Manufacturer',
] as const;

export const SPECIFIC_ACTIVITIES_LIST = [
  'Repacker',
  'Toll Manufacturer',
  'Bulk Storage & Warehousing',
  'Cold Chain Distribution',
  'Packaging & Labeling',
  'Physical-Chemical Testing',
  'Quality Assurance / R&D',
  'Sterilization Processing',
  'Clinical Diagnostic Support',
] as const;

export const INSPECTION_STATUSES = [
  'Completed',
  'For Inspection',
  'Failed',
  'Scheduled',
] as const;

export const ESTABLISHMENT_STATUSES = [
  'Active',
  'Inactive',
  'Pending',
  'Expired',
] as const;

export const INSPECTION_FREQUENCIES = [
  'Quarterly',
  'Semi-Annually',
  'Annually',
  'Bi-annually',
] as const;

export const INSPECTION_TYPES = [
  'Routine Inspection',
  'Pre-licensing Inspection',
  'Post-market Surveillance',
  'Special Audit & GMP',
  'Risk-based Monitoring',
  'Complaint-based Investigation',
] as const;
