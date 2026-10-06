import { supabase } from '../lib/supabase';
import type { Establishment, EstablishmentFormData, SummaryStats } from '../types/establishment';

export class EstablishmentService {
  public static async getAll(): Promise<Establishment[]> {
    const pageSize = 1000;

    // Fetch the first 1000 active rows (deleted_at IS NULL), sorted newest first
    const { data: firstBatch, count, error } = await supabase
      .from('establishments')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false, nullsFirst: false })
      .order('id', { ascending: false })
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
            .is('deleted_at', null)
            .order('created_at', { ascending: false, nullsFirst: false })
            .order('id', { ascending: false })
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

  /**
   * Fetch all soft-deleted establishments in Trash (deleted_at IS NOT NULL), sorted by deleted_at DESC
   */
  public static async getTrash(): Promise<Establishment[]> {
    const pageSize = 1000;

    const { data: firstBatch, count, error } = await supabase
      .from('establishments')
      .select('*', { count: 'exact' })
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
      .range(0, pageSize - 1);

    if (error) {
      console.error('Error fetching trash establishments from Supabase:', error);
      throw error;
    }

    const allData: Establishment[] = [...((firstBatch as Establishment[]) || [])];
    const totalCount = count || allData.length;

    if (totalCount > pageSize) {
      const remainingPromises = [];
      for (let from = pageSize; from < totalCount; from += pageSize) {
        const to = Math.min(from + pageSize - 1, totalCount - 1);
        remainingPromises.push(
          supabase
            .from('establishments')
            .select('*')
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false })
            .range(from, to)
        );
      }

      const responses = await Promise.all(remainingPromises);
      for (const res of responses) {
        if (res.error) {
          console.error('Error fetching trash batch from Supabase:', res.error);
        } else if (res.data) {
          allData.push(...(res.data as Establishment[]));
        }
      }
    }

    return allData;
  }

  /**
   * Fetch count of soft-deleted records in Trash
   */
  public static async getTrashCount(): Promise<number> {
    const { count, error } = await supabase
      .from('establishments')
      .select('id', { count: 'exact', head: true })
      .not('deleted_at', 'is', null);

    if (error) {
      console.error('Error fetching trash count from Supabase:', error);
      return 0;
    }

    return count || 0;
  }

  public static async getById(id: string): Promise<Establishment | null> {
    const { data, error } = await supabase
      .from('establishments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

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

  /**
   * Soft-delete: Moves the establishment to Trash by updating deleted_at to NOW() and restored_at to NULL.
   */
  public static async moveToTrash(id: string): Promise<Establishment> {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('establishments')
      .update({
        deleted_at: nowIso,
        restored_at: null,
        updated_at: nowIso,
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error(`Error moving establishment ${id} to trash:`, error);
      throw error;
    }

    if (!data || data.length === 0) {
      const notFoundErr = new Error(`Establishment with ID ${id} was not found or could not be moved to trash.`);
      console.error(notFoundErr);
      throw notFoundErr;
    }

    return data[0] as Establishment;
  }

  /**
   * Normal delete method: delegates to moveToTrash for safety.
   */
  public static async delete(id: string): Promise<boolean> {
    await this.moveToTrash(id);
    return true;
  }

  /**
   * Restores an establishment from Trash by resetting deleted_at to NULL and setting restored_at to NOW().
   */
  public static async restore(id: string): Promise<Establishment> {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('establishments')
      .update({
        deleted_at: null,
        restored_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error(`Error restoring establishment ${id}:`, error);
      throw error;
    }

    if (!data || data.length === 0) {
      const notFoundErr = new Error(`Establishment with ID ${id} was not found or could not be restored.`);
      console.error(notFoundErr);
      throw notFoundErr;
    }

    return data[0] as Establishment;
  }

  /**
   * Permanently deletes an establishment from the database. ONLY callable from Trash.
   */
  public static async permanentDelete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('establishments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error permanently deleting establishment ${id} in Supabase:`, error);
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
