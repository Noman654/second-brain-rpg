import { getSupabaseClient } from '../supabase';
import type { Database } from '../database.types';

type Area = Database['public']['Tables']['areas']['Row'];
type AreaInsert = Database['public']['Tables']['areas']['Insert'];
type AreaUpdate = Database['public']['Tables']['areas']['Update'];

export async function getAreas(userId: string): Promise<Area[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('areas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching areas:', error);
        return [];
    }
    return data || [];
}

export async function createArea(area: AreaInsert): Promise<Area | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('areas')
        .insert(area)
        .select()
        .single();

    if (error) {
        console.error('Error creating area:', error);
        return null;
    }
    return data;
}

export async function updateArea(id: string, updates: AreaUpdate): Promise<Area | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('areas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating area:', error);
        return null;
    }
    return data;
}

export async function deleteArea(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
        .from('areas')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting area:', error);
        return false;
    }
    return true;
}
