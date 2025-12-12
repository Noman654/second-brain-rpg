'use client';

import { create } from 'zustand';
import type { Database } from './database.types';
import * as api from './api';

// Type aliases
type Profile = Database['public']['Tables']['profiles']['Row'];
type Area = Database['public']['Tables']['areas']['Row'];
type Habit = Database['public']['Tables']['habits']['Row'];
type Archive = Database['public']['Tables']['archives']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type Milestone = Database['public']['Tables']['milestones']['Row'];
type Resource = Database['public']['Tables']['resources']['Row'];

type FriendProfile = api.FriendProfile;
type Notification = api.Notification;

interface ProjectWithMilestones extends Project {
    milestones: Milestone[];
}

interface GameState {
    // User state
    userId: string | null;
    profile: Profile | null;
    loading: boolean;
    initialized: boolean;

    // Data
    projects: ProjectWithMilestones[];
    areas: Area[];
    habits: Habit[];
    archives: Archive[];
    resources: Resource[];

    // Social Data
    friends: FriendProfile[];
    pendingRequests: FriendProfile[];
    leaderboard: Profile[];
    notifications: Notification[];

    // Actions
    fetchNotifications: () => Promise<void>;
    sendChallenge: (friendId: string, type: 'habit_challenge', title: string, data: any) => Promise<boolean>;
    acceptChallenge: (notification: Notification) => Promise<void>;
    dismissNotification: (id: string) => Promise<void>;

    // Actions
    initialize: (userId: string) => Promise<void>;
    reset: () => void;

    // Profile
    refreshProfile: () => Promise<void>;

    // Projects
    createProject: (project: Omit<api.ProjectWithMilestones, 'id' | 'user_id' | 'created_at' | 'is_completed' | 'milestones'>, milestones: { text: string }[]) => Promise<void>;
    updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
    toggleMilestone: (milestoneId: string, projectId: string) => Promise<void>;
    completeProject: (projectId: string) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;

    // Areas
    createArea: (title: string, associatedAttribute: string) => Promise<void>;
    updateArea: (id: string, title: string) => Promise<void>;
    deleteArea: (id: string) => Promise<void>;

    // Habits
    createHabit: (title: string, linkedAreaId: string, xpReward?: number) => Promise<void>;
    completeHabit: (habitId: string) => Promise<void>;
    deleteHabit: (habitId: string) => Promise<void>;

    // Resources
    createResource: (title: string, content: string, tags: string[], link?: string, linkedAreaId?: string) => Promise<void>;
    deleteResource: (id: string) => Promise<void>;

    // Social Actions
    fetchSocials: () => Promise<void>;
    sendFriendRequest: (userId: string) => Promise<boolean>;
    acceptFriendRequest: (friendshipId: string) => Promise<void>;
    declineFriendRequest: (friendshipId: string) => Promise<void>;
}

const initialState = {
    userId: null,
    profile: null,
    loading: false,
    initialized: false,
    projects: [],
    areas: [],
    habits: [],
    archives: [],
    resources: [],
    friends: [],
    pendingRequests: [],
    notifications: [],
    leaderboard: [],
};

export const useGameStore = create<GameState>()((set, get) => ({
    ...initialState,

    initialize: async (userId: string) => {
        set({ loading: true, userId });

        try {
            // Fetch all data in parallel
            const [profile, areas, projects, habits, archives, resources, friendsData, leaderboard] = await Promise.all([
                api.getProfile(userId),
                api.getAreas(userId),
                api.getProjects(userId),
                api.getHabits(userId),
                api.getArchives(userId),
                api.fetchResources(userId),
                api.getFriends(userId),
                api.getLeaderboard(),
            ]);

            // Check habit streaks
            await api.checkStreaks(userId);

            set({
                profile,
                areas,
                projects,
                habits,
                archives,
                resources,
                friends: friendsData?.confirmed || [],
                pendingRequests: friendsData?.pending || [],
                leaderboard: leaderboard || [],
                loading: false,
                initialized: true,
            });
        } catch (error) {
            console.error('Error initializing store:', error);
            set({ loading: false });
        }
    },

    reset: () => set(initialState),

    refreshProfile: async () => {
        const { userId } = get();
        if (!userId) return;
        const profile = await api.getProfile(userId);
        if (profile) set({ profile });
    },

    // Projects
    createProject: async (projectData, milestones) => {
        const { userId } = get();
        if (!userId) return;

        const project = await api.createProject(
            {
                user_id: userId,
                title: projectData.title,
                difficulty: projectData.difficulty,
                xp_reward: projectData.xp_reward,
                linked_area_id: projectData.linked_area_id,
                deadline: projectData.deadline,
            },
            milestones.map((m) => ({ text: m.text, is_done: false }))
        );

        if (project) {
            set((state) => ({ projects: [project, ...state.projects] }));
        }
    },

    updateProject: async (projectId, updates) => {
        const updated = await api.updateProject(projectId, updates);
        if (updated) {
            set((state) => ({
                projects: state.projects.map((p) => (p.id === projectId ? { ...p, ...updated } : p)),
            }));
        }
    },

    toggleMilestone: async (milestoneId, projectId) => {
        const { projects, userId, profile } = get();
        const project = projects.find((p) => p.id === projectId);
        const milestone = project?.milestones.find((m) => m.id === milestoneId);
        if (!milestone || !userId) return;

        const newIsDone = !milestone.is_done;
        const updated = await api.toggleMilestone(milestoneId, newIsDone);

        if (updated) {
            // Update local state
            set((state) => ({
                projects: state.projects.map((p) =>
                    p.id === projectId
                        ? {
                            ...p,
                            milestones: p.milestones.map((m) =>
                                m.id === milestoneId ? { ...m, is_done: newIsDone } : m
                            ),
                        }
                        : p
                ),
            }));

            // Award micro XP for completing milestone
            if (newIsDone && profile) {
                await api.addXP(userId, 10);
                get().refreshProfile();
            }
        }
    },

    completeProject: async (projectId) => {
        const { projects, areas, userId, profile } = get();
        const project = projects.find((p) => p.id === projectId);
        if (!project || !userId || !profile) return;

        await api.completeProject(projectId);

        // Archive the project
        await api.createArchive({
            user_id: userId,
            original_id: project.id,
            title: project.title,
            type: 'PROJECT',
        });

        // Award XP
        await api.addXP(userId, project.xp_reward);

        // Award attribute points
        const area = areas.find((a) => a.id === project.linked_area_id);
        if (area) {
            const attributePoints = Math.floor(project.xp_reward * 0.25);
            await api.addXP(userId, attributePoints, area.associated_attribute as 'strength' | 'intellect' | 'charisma' | 'wealth');
        }

        // Refresh
        set((state) => ({
            projects: state.projects.filter((p) => p.id !== projectId),
        }));
        const archives = await api.getArchives(userId);
        set({ archives });
        get().refreshProfile();
    },

    deleteProject: async (projectId) => {
        await api.deleteProject(projectId);
        set((state) => ({
            projects: state.projects.filter((p) => p.id !== projectId),
        }));
    },

    // Areas
    createArea: async (title, associatedAttribute) => {
        const { userId } = get();
        if (!userId) return;

        const area = await api.createArea({
            user_id: userId,
            title,
            associated_attribute: associatedAttribute,
        });

        if (area) {
            set((state) => ({ areas: [...state.areas, area] }));
        }
    },

    updateArea: async (id, title) => {
        const updated = await api.updateArea(id, { title });
        if (updated) {
            set((state) => ({
                areas: state.areas.map((a) => (a.id === id ? updated : a)),
            }));
        }
    },

    deleteArea: async (id) => {
        const success = await api.deleteArea(id);
        if (success) {
            set((state) => ({
                areas: state.areas.filter((a) => a.id !== id),
            }));
        }
    },

    // Habits
    createHabit: async (title, linkedAreaId, xpReward = 25) => {
        const { userId } = get();
        if (!userId) return;

        const habit = await api.createHabit({
            user_id: userId,
            title,
            linked_area_id: linkedAreaId,
            xp_reward: xpReward,
        });

        if (habit) {
            set((state) => ({ habits: [...state.habits, habit] }));
        }
    },

    completeHabit: async (habitId) => {
        const { habits, areas, userId, profile } = get();
        const habit = habits.find((h) => h.id === habitId);
        if (!habit || !userId || !profile) return;

        const today = new Date().toISOString().split('T')[0];
        if (habit.last_completed_date === today) return; // Already completed

        const updated = await api.completeHabit(habitId);

        if (updated) {
            set((state) => ({
                habits: state.habits.map((h) => (h.id === habitId ? updated : h)),
            }));

            // Award XP
            await api.addXP(userId, habit.xp_reward);

            // Award attribute points
            const area = areas.find((a) => a.id === habit.linked_area_id);
            if (area) {
                const attributePoints = Math.floor(habit.xp_reward * 0.25);
                await api.addXP(userId, attributePoints, area.associated_attribute as 'strength' | 'intellect' | 'charisma' | 'wealth');
            }

            get().refreshProfile();
        }
    },

    deleteHabit: async (habitId) => {
        const success = await api.deleteHabit(habitId);
        if (success) {
            set((state) => ({
                habits: state.habits.filter((h) => h.id !== habitId),
            }));
        }
    },

    // Resources
    createResource: async (title, content, tags, link, linkedAreaId) => {
        const { userId } = get();
        if (!userId) return;

        const resource = await api.createResource({
            user_id: userId,
            title,
            content,
            tags,
            link: link || null,
            linked_area_id: linkedAreaId || null,
        });

        if (resource) {
            set((state) => ({ resources: [resource, ...state.resources] }));
        }
    },

    deleteResource: async (id) => {
        const success = await api.deleteResource(id);
        if (success) {
            set((state) => ({
                resources: state.resources.filter((r) => r.id !== id),
            }));
        }
    },

    // Social
    fetchSocials: async () => {
        const { userId } = get();
        if (!userId) return;

        const [friendsData, leaderboard, notifications] = await Promise.all([
            api.getFriends(userId),
            api.getLeaderboard(),
            api.getNotifications(userId),
        ]);

        set({
            friends: friendsData.confirmed,
            pendingRequests: friendsData.pending,
            leaderboard,
            notifications,
        });
    },

    fetchNotifications: async () => {
        const { userId } = get();
        if (!userId) return;
        const notifications = await api.getNotifications(userId);
        set({ notifications });
    },

    sendChallenge: async (friendId, type, title, data) => {
        const { userId } = get();
        if (!userId) return false;
        return await api.sendChallenge(userId, friendId, type, title, data);
    },

    acceptChallenge: async (notification) => {
        const { userId } = get();
        if (!userId) return;

        // Create the habit based on challenge data
        if (notification.type === 'habit_challenge') {
            await get().createHabit(notification.title, notification.data.linkedAreaId, notification.data.xpReward);
        }

        // Delete notification after accepting
        await api.deleteNotification(notification.id);
        await get().fetchNotifications();
    },

    dismissNotification: async (id) => {
        await api.deleteNotification(id);
        await get().fetchNotifications();
    },

    sendFriendRequest: async (friendId) => {
        const { userId } = get();
        if (!userId) return false;
        return await api.sendFriendRequest(userId, friendId);
    },

    acceptFriendRequest: async (friendshipId) => {
        const success = await api.acceptFriendRequest(friendshipId);
        if (success) {
            await get().fetchSocials(); // Refresh lists
        }
    },

    declineFriendRequest: async (friendshipId) => {
        const success = await api.declineFriendRequest(friendshipId);
        if (success) {
            await get().fetchSocials(); // Refresh lists
        }
    },
}));
