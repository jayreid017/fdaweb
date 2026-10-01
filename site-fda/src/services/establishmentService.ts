import type { Establishment, EstablishmentFormData, SummaryStats } from '../types/establishment';
import { SAMPLE_ESTABLISHMENTS } from '../data/sampleEstablishments';

const STORAGE_KEY = 'fda_establishments_data_car_v2';

export class EstablishmentService {
  private static loadFromStorage(): Establishment[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
    }
    // Seed initial CAR provinces data
    this.saveToStorage(SAMPLE_ESTABLISHMENTS);
    return [...SAMPLE_ESTABLISHMENTS];
  }

  private static saveToStorage(data: Establishment[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
    }
  }

  public static async getAll(): Promise<Establishment[]> {
    // Return data
    return this.loadFromStorage();
  }

  public static async getById(id: string): Promise<Establishment | null> {
    const list = this.loadFromStorage();
    return list.find((item) => item.id === id) || null;
  }

  public static async create(data: EstablishmentFormData): Promise<Establishment> {
    const list = this.loadFromStorage();
    const newEstablishment: Establishment = {
      ...data,
      id: `est-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newEstablishment);
    this.saveToStorage(list);
    return newEstablishment;
  }

  public static async update(id: string, data: Partial<EstablishmentFormData>): Promise<Establishment> {
    const list = this.loadFromStorage();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Establishment with ID ${id} not found`);
    }

    const updated: Establishment = {
      ...list[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    this.saveToStorage(list);
    return updated;
  }

  public static async delete(id: string): Promise<boolean> {
    const list = this.loadFromStorage();
    const filtered = list.filter((item) => item.id !== id);
    if (filtered.length === list.length) {
      return false;
    }
    this.saveToStorage(filtered);
    return true;
  }

  public static async resetToDefaults(): Promise<Establishment[]> {
    this.saveToStorage(SAMPLE_ESTABLISHMENTS);
    return [...SAMPLE_ESTABLISHMENTS];
  }

  public static calculateStats(items: Establishment[]): SummaryStats {
    const now = new Date();
    // upcoming within next 60 days
    const upcomingLimit = new Date();
    upcomingLimit.setDate(now.getDate() + 60);

    let activeCount = 0;
    let expiredLtoCount = 0;
    let upcomingInspectionsCount = 0;

    for (const item of items) {
      if (item.status === 'Active') {
        activeCount++;
      }

      // Check if LTO expiry date is in past or status is Expired
      const expiry = new Date(item.expiryDate);
      if (item.status === 'Expired' || (!isNaN(expiry.getTime()) && expiry < now)) {
        expiredLtoCount++;
      }

      // Check if next inspection is within next 60 days and not in past
      if (item.nextInspection) {
        const nextInsp = new Date(item.nextInspection);
        if (!isNaN(nextInsp.getTime()) && nextInsp >= now && nextInsp <= upcomingLimit) {
          upcomingInspectionsCount++;
        }
      }
    }

    return {
      totalEstablishments: items.length,
      activeCount,
      expiredLtoCount,
      upcomingInspectionsCount,
      activeTrendPercentage: 94.2,
      expiredTrend: 2,
      upcomingTrend: 12,
    };
  }
}
