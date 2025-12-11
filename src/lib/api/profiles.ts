import { getSupabaseClient } from '../supabase';
import type { Database } from '../database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export async function getProfile(userId: string): Promise<Profile | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        // If profile doesn't exist, create it (self-healing for users created before schema)
        if (error.code === 'PGRST116') { // JSON object requested, multiple (or no) rows returned
            console.log('Profile missing, creating default profile for:', userId);

            // Get user email for username fallback
            const { data: { user } } = await supabase.auth.getUser();
            const username = user?.email?.split('@')[0] || 'Adventurer';

            // Create profile
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    username,
                    level: 1,
                    current_xp: 0,
                    xp_to_next_level: 100
                })
                .select()
                .single();

            if (createError) {
                console.error('Error creating default profile:', createError);
                return null;
            }

            // Create default areas
            await supabase.from('areas').insert([
                { user_id: userId, title: 'Work & Career', associated_attribute: 'wealth' },
                { user_id: userId, title: 'Health & Fitness', associated_attribute: 'strength' },
                { user_id: userId, title: 'Learning', associated_attribute: 'intellect' },
                { user_id: userId, title: 'Social', associated_attribute: 'charisma' },
            ]);

            return newProfile;
        }

        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
}

export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating profile:', error);
        return null;
    }
    return data;
}

export async function addXP(
    userId: string,
    amount: number,
    attribute?: 'strength' | 'intellect' | 'charisma' | 'wealth'
): Promise<Profile | null> {
    const supabase = getSupabaseClient();

    // Get current profile
    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (fetchError || !profile) {
        console.error('Error fetching profile for XP:', fetchError);
        return null;
    }

    let { level, current_xp, xp_to_next_level, strength, intellect, charisma, wealth } = profile;
    current_xp += amount;

    // Level up logic
    while (current_xp >= xp_to_next_level) {
        current_xp -= xp_to_next_level;
        level++;
        xp_to_next_level = Math.floor(level * 100 * 1.5);
    }

    // Update attribute if specified
    const attributeUpdates: Partial<Profile> = {};
    if (attribute) {
        switch (attribute) {
            case 'strength':
                attributeUpdates.strength = strength + amount;
                break;
            case 'intellect':
                attributeUpdates.intellect = intellect + amount;
                break;
            case 'charisma':
                attributeUpdates.charisma = charisma + amount;
                break;
            case 'wealth':
                attributeUpdates.wealth = wealth + amount;
                break;
        }
    }

    const { data, error } = await supabase
        .from('profiles')
        .update({
            level,
            current_xp,
            xp_to_next_level,
            ...attributeUpdates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating XP:', error);
        return null;
    }
    return data;
}
