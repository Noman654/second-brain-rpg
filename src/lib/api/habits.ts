import { getSupabaseClient } from '../supabase';
import type { Database } from '../database.types';

type Habit = Database['public']['Tables']['habits']['Row'];
type HabitInsert = Database['public']['Tables']['habits']['Insert'];

export async function getHabits(userId: string): Promise<Habit[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching habits:', error);
        return [];
    }
    return data || [];
}

export async function createHabit(habit: HabitInsert): Promise<Habit | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('habits')
        .insert(habit)
        .select()
        .single();

    if (error) {
        console.error('Error creating habit:', error);
        return null;
    }
    return data;
}

export async function completeHabit(habitId: string): Promise<Habit | null> {
    const supabase = getSupabaseClient();

    // Get current habit
    const { data: habit, error: fetchError } = await supabase
        .from('habits')
        .select('*')
        .eq('id', habitId)
        .single();

    if (fetchError || !habit) {
        console.error('Error fetching habit:', fetchError);
        return null;
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if already completed today
    if (habit.last_completed_date === today) {
        return habit;
    }

    // Calculate new streak
    let newStreak = 1;
    if (habit.last_completed_date === yesterday) {
        newStreak = habit.streak + 1;
    }

    const newBestStreak = Math.max(habit.best_streak, newStreak);

    const { data, error } = await supabase
        .from('habits')
        .update({
            streak: newStreak,
            best_streak: newBestStreak,
            last_completed_date: today,
        })
        .eq('id', habitId)
        .select()
        .single();

    if (error) {
        console.error('Error completing habit:', error);
        return null;
    }
    return data;
}

export async function deleteHabit(habitId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);

    if (error) {
        console.error('Error deleting habit:', error);
        return false;
    }
    return true;
}

// Check and reset streaks for habits not completed yesterday
export async function checkStreaks(userId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Reset streaks for habits not completed today or yesterday
    await supabase
        .from('habits')
        .update({ streak: 0 })
        .eq('user_id', userId)
        .neq('last_completed_date', today)
        .neq('last_completed_date', yesterday);
}
