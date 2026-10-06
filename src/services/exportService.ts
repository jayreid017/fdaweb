import * as XLSX from 'xlsx';
import type { Establishment } from '../types/establishment';

export interface ExportColumn {
  header: string;
  key: keyof Establishment;
  isDate?: boolean;
}

export const EXPORT_COLUMNS: readonly ExportColumn[] = [
  { header: 'ID', key: 'id' },
  { header: 'Establishment Name', key: 'establishment_name' },
  { header: 'Product Type', key: 'product_type' },
  { header: 'Primary Activity', key: 'primary_activity' },
  { header: 'Specific Activities', key: 'specific_activities' },
  { header: 'Product Line', key: 'product_line' },
  { header: 'Products', key: 'products' },
  { header: 'LTO Number', key: 'lto_number' },
  { header: 'LTO Issuance Date', key: 'lto_issuance_date', isDate: true },
  { header: 'Expiry', key: 'expiry', isDate: true },
  { header: 'Address', key: 'address' },
  { header: 'Province', key: 'province' },
  { header: 'City/Municipality', key: 'city_municipality' },
  { header: 'Owner', key: 'owner' },
  { header: 'Contact Number', key: 'contact_number' },
  { header: 'Email Address', key: 'email_address' },
  { header: 'Last Inspection', key: 'last_inspection', isDate: true },
  { header: 'Status Last Inspection', key: 'status_last_inspection' },
  { header: 'Frequency', key: 'frequency' },
  { header: 'Next Inspection', key: 'next_inspection', isDate: true },
  { header: 'Type of Inspection', key: 'type_inspection' },
  { header: 'Inspector', key: 'inspector' },
  { header: 'Status', key: 'status' },
  { header: 'Created At', key: 'created_at', isDate: true },
  { header: 'Updated At', key: 'updated_at', isDate: true },
];

/**
 * Format any date string to standard YYYY-MM-DD format
 */
export function formatDate(val: string | null | undefined): string {
  if (!val) return '';
  const trimmed = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return trimmed;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate standard export filename with current date
 */
export function getExportFilename(format: 'xlsx' | 'csv'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `FDA_Establishments_${year}-${month}-${day}.${format}`;
}

/**
 * Escape CSV field according to RFC 4180
 */
function escapeCsvValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Trigger browser file download from Blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export establishment records to Excel (.xlsx) file
 */
export async function exportToExcel(data: Establishment[], filename?: string): Promise<string> {
  const name = filename || getExportFilename('xlsx');
  const headers = EXPORT_COLUMNS.map((col) => col.header);

  const rows = data.map((item) => {
    return EXPORT_COLUMNS.map((col) => {
      const raw = item[col.key];
      return col.isDate ? formatDate(raw) : (raw ?? '');
    });
  });

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set optimized column widths for Excel readability
  worksheet['!cols'] = [
    { wch: 38 }, // ID
    { wch: 32 }, // Establishment Name
    { wch: 18 }, // Product Type
    { wch: 22 }, // Primary Activity
    { wch: 28 }, // Specific Activities
    { wch: 20 }, // Product Line
    { wch: 26 }, // Products
    { wch: 18 }, // LTO Number
    { wch: 16 }, // LTO Issuance Date
    { wch: 14 }, // Expiry
    { wch: 36 }, // Address
    { wch: 18 }, // Province
    { wch: 22 }, // City/Municipality
    { wch: 24 }, // Owner
    { wch: 18 }, // Contact Number
    { wch: 28 }, // Email Address
    { wch: 16 }, // Last Inspection
    { wch: 24 }, // Status Last Inspection
    { wch: 16 }, // Frequency
    { wch: 16 }, // Next Inspection
    { wch: 22 }, // Type of Inspection
    { wch: 22 }, // Inspector
    { wch: 14 }, // Status
    { wch: 14 }, // Created At
    { wch: 14 }  // Updated At
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Establishments');

  XLSX.writeFile(workbook, name, { bookType: 'xlsx' });
  return name;
}

/**
 * Export establishment records to CSV (.csv) file with UTF-8 encoding
 */
export async function exportToCSV(data: Establishment[], filename?: string): Promise<string> {
  const name = filename || getExportFilename('csv');
  const headers = EXPORT_COLUMNS.map((col) => col.header);

  const rows = data.map((item) => {
    return EXPORT_COLUMNS.map((col) => {
      const raw = item[col.key];
      const val = col.isDate ? formatDate(raw) : (raw ?? '');
      return escapeCsvValue(val);
    }).join(',');
  });

  const csvContent = [headers.map(escapeCsvValue).join(','), ...rows].join('\r\n');

  // Prepend UTF-8 BOM so Microsoft Excel correctly renders UTF-8 characters
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, name);
  return name;
}
