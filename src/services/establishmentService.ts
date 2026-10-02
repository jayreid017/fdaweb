import { supabase } from '../lib/supabase';
import type { Establishment, EstablishmentFormData, SummaryStats } from '../types/establishment';

export class EstablishmentService {
  public static async getAll(): Promise<Establishment[]> {
    const pageSize = 1000;

    // Fetch the first 1000 rows along with the exact total row count
    const { data: firstBatch, count, error } = await supabase
      .from('establishments')
      .select('*', { count: 'exact' })
      .order('id', { ascending: true })
      .range(0, pageSize - 1);

    if (error) {
      console.error('Error fetching establishments from Supabase:', error);
      throw error;
    }

    const allData: Establishment[] = [...((firstBatch as Establishment[]) || [])];
    const totalCount = count || allData.length;

    // If there are more than 1000 records, fetch remaining pages in parallel
    if (totalCount > pageSize) {
      const remainingPromises = [];
      for (let from = pageSize; from < totalCount; from += pageSize) {
        const to = Math.min(from + pageSize - 1, totalCount - 1);
        remainingPromises.push(
          supabase
            .from('establishments')
            .select('*')
            .order('id', { ascending: true })
            .range(from, to)
        );
      }

      const responses = await Promise.all(remainingPromises);
      for (const res of responses) {
        if (res.error) {
          console.error('Error fetching batch from Supabase:', res.error);
        } else if (res.data) {
          allData.push(...(res.data as Establishment[]));
        }
      }
    }

    return allData;
  }

  public static async getById(id: string): Promise<Establishment | null> {
    const { data, error } = await supabase
      .from('establishments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching establishment ${id}:`, error);
      return null;
    }

    return (data as Establishment) || null;
  }

  public static async create(data: EstablishmentFormData): Promise<Establishment> {
    const { data: created, error } = await supabase
      .from('establishments')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Error creating establishment in Supabase:', error);
      throw error;
    }

    return created as Establishment;
  }

  public static async update(id: string, data: Partial<EstablishmentFormData>): Promise<Establishment> {
    const { data: updated, error } = await supabase
      .from('establishments')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating establishment ${id} in Supabase:`, error);
      throw error;
    }

    return updated as Establishment;
  }

  public static async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('establishments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting establishment ${id} in Supabase:`, error);
      throw error;
    }

    return true;
  }

  public static calculateStats(items: Establishment[]): SummaryStats {
    const now = new Date();
    const upcomingLimit = new Date();
    upcomingLimit.setDate(now.getDate() + 60);

    let activeCount = 0;
    let expiredLtoCount = 0;
    let upcomingInspectionsCount = 0;

    for (const item of items) {
      const statusLower = item.status?.trim().toLowerCase();
      if (statusLower === 'active') {
        activeCount++;
      }

      // Check if LTO expiry date is in past or status is Expired
      if (item.expiry) {
        const expiry = new Date(item.expiry);
        if (statusLower === 'expired' || (!isNaN(expiry.getTime()) && expiry < now)) {
          expiredLtoCount++;
        }
      } else if (statusLower === 'expired') {
        expiredLtoCount++;
      }

      // Check if next inspection is within next 60 days and not in past
      if (item.next_inspection) {
        const nextInsp = new Date(item.next_inspection);
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
      activeTrendPercentage: items.length > 0 ? Math.round((activeCount / items.length) * 100) : 0,
      expiredTrend: 0,
      upcomingTrend: 0,
    };
  }
}
