export type ProductType =
  | 'Food'
  | 'Drugs'
  | 'Medical Devices'
  | 'Cosmetics'
  | 'Household/Urban Hazardous'
  | 'Radiation Health';

export type EstablishmentStatus = 'Active' | 'Inactive' | 'Pending' | 'Expired';

export type InspectionStatus = 'Completed' | 'For Inspection' | 'Failed' | 'Scheduled';

export type InspectionFrequency = 'Quarterly' | 'Semi-Annually' | 'Annually' | 'Bi-annually';

export interface Establishment {
  id: string;
  establishmentName: string;
  productType: ProductType;
  primaryActivity: string;
  specificActivities: string;
  productLine: string;
  products: string;
  ltoNumber: string;
  ltoIssuanceDate: string; // YYYY-MM-DD
  expiryDate: string;      // YYYY-MM-DD
  address: string;
  province: string;
  cityMunicipality: string;
  owner: string;
  contactNumber: string;
  emailAddress: string;
  lastInspection: string;  // YYYY-MM-DD
  statusOfLastInspection: InspectionStatus;
  frequency: InspectionFrequency;
  nextInspection: string;  // YYYY-MM-DD
  typeInspection: string;
  inspector: string;
  status: EstablishmentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type EstablishmentFormData = Omit<Establishment, 'id' | 'createdAt' | 'updatedAt'>;

export interface FilterState {
  search: string;
  productType: string;
  province: string;
  cityMunicipality: string;
  status: string;
  inspectionStatus: string;
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
