export type ProductType =
  | 'Food'
  | 'Drug'
  | 'Medical Devices'
  | 'Cosmetics'
  | 'Household/Urban Hazardous'
  | 'Radiation Health'
  | string;

export type EstablishmentStatus = 'Active' | 'Inactive' | 'Pending' | 'Expired' | string;

export type InspectionStatus = 'Completed' | 'For Inspection' | 'Failed' | 'Scheduled' | string;

export type InspectionFrequency = 'Quarterly' | 'Semi-Annually' | 'Annually' | 'Bi-annually' | string;

export interface Establishment {
  id: string;
  establishment_name: string;
  product_type: string | null;
  primary_activity: string | null;
  specific_activities: string | null;
  product_line: string | null;
  products: string | null;
  lto_number: string | null;
  lto_issuance_date: string | null;
  expiry: string | null;
  address: string | null;
  province: string | null;
  city_municipality: string | null;
  owner: string | null;
  contact_number: string | null;
  email_address: string | null;
  last_inspection: string | null;
  status_last_inspection: string | null;
  frequency: string | null;
  next_inspection: string | null;
  type_inspection: string | null;
  inspector: string | null;
  status: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  restored_at?: string | null;
}

export type EstablishmentFormData = Omit<Establishment, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'restored_at'>;

export interface FilterState {
  search: string;
  product_type: string;
  province: string;
  city_municipality: string;
  status: string;
  status_last_inspection: string;
}

export interface SummaryStats {
  totalEstablishments: number;
  activeCount: number;
  expiredLtoCount: number;
  upcomingInspectionsCount: number;
  activeTrendPercentage?: number;
  expiredTrend?: number;
  upcomingTrend?: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export type ConfirmationMode = 'trash' | 'restore' | 'permanent';
