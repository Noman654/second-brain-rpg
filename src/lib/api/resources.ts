import { getSupabaseClient } from '../supabase';
import type { Database } from '../database.types';

type Resource = Database['public']['Tables']['resources']['Row'];
type ResourceInsert = Database['public']['Tables']['resources']['Insert'];

export async function fetchResources(userId: string): Promise<Resource[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching resources:', error);
        return [];
    }
    return data || [];
}

export async function createResource(resource: Omit<ResourceInsert, 'id' | 'created_at'>): Promise<Resource | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('resources')
        .insert(resource)
        .select()
        .single();

    if (error) {
        console.error('Error creating resource:', error);
        return null;
    }
    return data;
}

export async function deleteResource(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting resource:', error);
        return false;
    }
    return true;
}
