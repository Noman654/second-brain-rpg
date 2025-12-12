import { getSupabaseClient } from '../supabase';
import type { Database } from '../database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Friendship = Database['public']['Tables']['friendships']['Row'];

export interface FriendProfile extends Profile {
    friendship_id: string;
    friendship_status: 'pending' | 'accepted';
    is_requester: boolean;
}

export async function searchUsers(query: string): Promise<Profile[]> {
    if (!query || query.length < 2) return [];

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query}%`)
        .limit(10);

    if (error) {
        console.error('Error searching users:', error);
        return [];
    }
    return data || [];
}

export async function sendFriendRequest(userId: string, friendId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
        .from('friendships')
        .insert({
            user_id: userId,
            friend_id: friendId,
            status: 'pending'
        });

    if (error) {
        console.error('Error sending friend request:', error);
        return false;
    }
    return true;
}

export async function acceptFriendRequest(friendshipId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

    if (error) {
        console.error('Error accepting friend request:', error);
        return false;
    }
    return true;
}

export async function declineFriendRequest(friendshipId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

    if (error) {
        console.error('Error declining friend request:', error);
        return false;
    }
    return true;
}

export async function getFriends(userId: string): Promise<{ confirmed: FriendProfile[], pending: FriendProfile[] }> {
    const supabase = getSupabaseClient();

    // Fetch all friendships where user is involved
    const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    if (error || !friendships) {
        console.error('Error fetching friends:', error);
        return { confirmed: [], pending: [] };
    }

    // Collect all unique profile IDs needed
    const profileIds = new Set<string>();
    friendships.forEach(f => {
        if (f.user_id !== userId) profileIds.add(f.user_id);
        if (f.friend_id !== userId) profileIds.add(f.friend_id);
    });

    if (profileIds.size === 0) return { confirmed: [], pending: [] };

    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', Array.from(profileIds));

    if (profilesError || !profiles) {
        return { confirmed: [], pending: [] };
    }

    const profileMap = new Map(profiles.map(p => [p.id, p]));
    const confirmed: FriendProfile[] = [];
    const pending: FriendProfile[] = [];

    friendships.forEach(f => {
        const otherId = f.user_id === userId ? f.friend_id : f.user_id;
        const profile = profileMap.get(otherId);

        if (profile) {
            const friendProfile: FriendProfile = {
                ...profile,
                friendship_id: f.id,
                friendship_status: f.status as 'pending' | 'accepted',
                is_requester: f.user_id === userId
            };

            if (f.status === 'accepted') {
                confirmed.push(friendProfile);
            } else if (f.status === 'pending') {
                // Only include if user is the recipient (waiting for THEIR action) OR show outgoing?
                // Usually show "Incoming Requests" and "Outgoing Requests".
                // Detailed logic:
                pending.push(friendProfile);
            }
        }
    });

    return { confirmed, pending };
}

// --- LEADERBOARD ---
export async function getLeaderboard(): Promise<Profile[]> {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Get Friends IDs (Only accepted)
    const { data: friendships } = await supabase
        .from('friendships')
        .select('*')
        .eq('status', 'accepted')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    const friendIds = friendships?.map(f => f.user_id === user.id ? f.friend_id : f.user_id) || [];
    // Include Self
    const allIds = [user.id, ...friendIds];

    // 2. Fetch Profiles for these IDs
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', allIds)
        .order('current_xp', { ascending: false });

    if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
    return data || [];
}

// --- NOTIFICATIONS / CHALLENGES ---
export interface Notification {
    id: string;
    user_id: string;
    sender_id: string;
    type: 'habit_challenge' | 'quest_invite';
    title: string;
    data: any;
    is_read: boolean;
    created_at: string;
    sender?: Profile; // Joined manually
}

export async function getNotifications(userId: string): Promise<Notification[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) return [];

    // Fetch senders details
    const notifications = data as Notification[];
    const senderIds = [...new Set(notifications.map(n => n.sender_id))];

    if (senderIds.length > 0) {
        const { data: senders } = await supabase.from('profiles').select('*').in('id', senderIds);
        if (senders) {
            notifications.forEach(n => {
                n.sender = senders.find(s => s.id === n.sender_id);
            });
        }
    }

    return notifications;
}

export async function sendChallenge(senderId: string, friendId: string, type: 'habit_challenge', title: string, data: any): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: friendId,
            sender_id: senderId,
            type,
            title,
            data
        });
    return !error;
}

export async function deleteNotification(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    return !error;
}
