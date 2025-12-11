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

    // Actions
    initialize: (userId: string) => Promise<void>;
    reset: () => void;

    // Profile
    refreshProfile: () => Promise<void>;

    // Projects
    createProject: (project: Omit<api.ProjectWithMilestones, 'id' | 'user_id' | 'created_at' | 'is_completed' | 'milestones'>, milestones: { text: string }[]) => Promise<void>;
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
};

export const useGameStore = create<GameState>()((set, get) => ({
    ...initialState,

    initialize: async (userId: string) => {
        set({ loading: true, userId });

        try {
            // Fetch all data in parallel
            const [profile, areas, projects, habits, archives] = await Promise.all([
                api.getProfile(userId),
                api.getAreas(userId),
                api.getProjects(userId),
                api.getHabits(userId),
                api.getArchives(userId),
            ]);

            // Check habit streaks
            await api.checkStreaks(userId);

            set({
                profile,
                areas,
                projects,
                habits,
                archives,
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
        const { userId, areas, profile } = get();
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
}));
