import { getSupabaseClient } from '../supabase';
import type { Database } from '../database.types';

type Archive = Database['public']['Tables']['archives']['Row'];
type ArchiveInsert = Database['public']['Tables']['archives']['Insert'];

export async function getArchives(userId: string): Promise<Archive[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('archives')
        .select('*')
        .eq('user_id', userId)
        .order('completed_date', { ascending: false });

    if (error) {
        console.error('Error fetching archives:', error);
        return [];
    }
    return data || [];
}

export async function createArchive(archive: ArchiveInsert): Promise<Archive | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('archives')
        .insert(archive)
        .select()
        .single();

    if (error) {
        console.error('Error creating archive:', error);
        return null;
    }
    return data;
}
