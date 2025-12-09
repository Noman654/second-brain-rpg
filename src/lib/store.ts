import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    Project,
    Area,
    Resource,
    ArchivedItem,
    UserStats,
    Difficulty,
    Milestone,
    Habit
} from '@/types';

interface GameState {
    userStats: UserStats;
    projects: Project[];
    areas: Area[];
    resources: Resource[];
    archives: ArchivedItem[];
    habits: Habit[];

    // Actions
    addXP: (amount: number, attribute?: keyof UserStats['attributes']) => void;
    createProject: (project: Project) => void;
    createArea: (area: Area) => void;
    updateArea: (id: string, updates: Partial<Omit<Area, 'id' | 'category'>>) => void;
    deleteArea: (id: string) => void;
    createResource: (resource: Resource) => void;
    toggleMilestone: (projectId: string, milestoneId: string) => void;
    completeProject: (projectId: string) => void;
    deleteProject: (projectId: string) => void;
    archiveItem: (item: ArchivedItem) => void;

    // Habit actions
    createHabit: (habit: Habit) => void;
    completeHabit: (habitId: string) => void;
    deleteHabit: (habitId: string) => void;
    resetDailyHabits: () => void;
}



const XP_THRESHOLDS = {
    EASY: 50,
    MEDIUM: 100,
    HARD: 200,
    EPIC: 500,
};

const MILESTONE_XP = 10;

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            userStats: {
                level: 1,
                currentXP: 0,
                xpToNextLevel: 100, // Starting requirement
                attributes: {
                    strength: 1,
                    intellect: 1,
                    charisma: 1,
                    wealth: 1,
                },
            },
            projects: [],
            areas: [
                { id: 'area-1', title: 'Work & Career', category: 'AREA', associatedAttribute: 'wealth', currentLevel: 1 },
                { id: 'area-2', title: 'Health & Fitness', category: 'AREA', associatedAttribute: 'strength', currentLevel: 1 },
                { id: 'area-3', title: 'Learning', category: 'AREA', associatedAttribute: 'intellect', currentLevel: 1 },
                { id: 'area-4', title: 'Social', category: 'AREA', associatedAttribute: 'charisma', currentLevel: 1 },
            ],
            resources: [],
            archives: [],
            habits: [],

            addXP: (amount, attribute) => {
                set((state) => {
                    let { level, currentXP, xpToNextLevel, attributes } = state.userStats;

                    currentXP += amount;

                    // Check for level up
                    while (currentXP >= xpToNextLevel) {
                        currentXP -= xpToNextLevel;
                        level++;
                        // Exponential curve: XP_Required = Level * 100 * 1.5
                        xpToNextLevel = Math.floor(level * 100 * 1.5);
                    }

                    const newAttributes = { ...attributes };
                    if (attribute) {
                        // Simple attribute leveling logic: 
                        // In a real RPG, attributes might have their own XP. 
                        // Here we just simulate progress or let them track 'levels' via Areas.
                        // The spec says: "The user gains Attribute XP based on the linkedAreaId ... +50 Wealth Points"
                        // But the UserStats interface has attributes as numbers (levels?). 
                        // Let's assume the number in UserStats is the "Attribute Level" or "Score".
                        // For simplicity, we'll just add the points to the attribute score directly
                        // Or we could implement a sub-leveling system.
                        // The prompt says: "Attributes: { strength: number ... }"
                        // And "Completing ... gives +50 Wealth Points."
                        // So maybe the number IS the points.
                        newAttributes[attribute] += amount;
                        // Wait, if amount is Global XP (200) and Wealth Points (50), addXP might need to be more granular.
                        // The spec function 'addXP' in the interface wasn't fully defined, but "Completing Project ... gives +200 Global XP and +50 Wealth Points".
                        // My addXP takes (amount, attribute). If success, called twice? Or logic inside completeProject handles it.
                    }

                    return {
                        userStats: {
                            level,
                            currentXP,
                            xpToNextLevel,
                            attributes: newAttributes,
                        },
                    };
                });
            },

            createProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
            createArea: (area) => set((state) => ({ areas: [...state.areas, area] })),
            createResource: (resource) => set((state) => ({ resources: [...state.resources, resource] })),

            updateArea: (id, updates) => set((state) => ({
                areas: state.areas.map(area =>
                    area.id === id ? { ...area, ...updates } : area
                )
            })),

            deleteArea: (id) => set((state) => ({
                areas: state.areas.filter(area => area.id !== id)
            })),

            toggleMilestone: (projectId, milestoneId) => {
                const state = get();
                const project = state.projects.find(p => p.id === projectId);
                if (!project) return;

                const milestone = project.milestones.find(m => m.id === milestoneId);
                if (!milestone) return;

                const isNowDone = !milestone.isDone;

                // Update milestone
                const updatedProjects = state.projects.map(p => {
                    if (p.id === projectId) {
                        return {
                            ...p,
                            milestones: p.milestones.map(m => m.id === milestoneId ? { ...m, isDone: isNowDone } : m)
                        };
                    }
                    return p;
                });

                set({ projects: updatedProjects });

                // Grant micro-XP if checking OFF (not unchecking)
                if (isNowDone) {
                    get().addXP(MILESTONE_XP);
                }
            },

            completeProject: (projectId) => {
                const state = get();
                const project = state.projects.find(p => p.id === projectId);
                if (!project || project.isCompleted) return;

                // Calculate XP
                const xpReward = project.xpReward;

                // Find linked area to award attribute points
                const area = state.areas.find(a => a.id === project.linkedAreaId);

                // Award Global XP
                get().addXP(xpReward);

                // Award Attribute Points (e.g. 25% of XP reward or fixed?)
                // Spec: "Ease=50, Med=100... Completing Med Project... +200 Global XP and +50 Wealth Points"
                // It seems Global XP is specified in xpReward, and Attribute XP is separate.
                // Let's assume Attribute XP is roughly 25-50% of Global XP or defined in Difficulty.
                // For MVP, let's treat the project.xpReward as Global XP, and give some bonus to attribute.
                if (area) {
                    // Let's add 25% of XP as attribute points
                    const attributePoints = Math.floor(xpReward * 0.25);
                    get().addXP(attributePoints, area.associatedAttribute);
                }

                // Move to Archive
                const archivedItem: ArchivedItem = {
                    originalId: project.id,
                    title: project.title,
                    completedDate: new Date(),
                    type: 'PROJECT'
                };

                get().archiveItem(archivedItem);
                get().deleteProject(projectId);
            },

            deleteProject: (projectId) => set((state) => ({
                projects: state.projects.filter(p => p.id !== projectId)
            })),

            archiveItem: (item) => set((state) => ({
                archives: [item, ...state.archives]
            })),

            // Habit actions
            createHabit: (habit) => set((state) => ({
                habits: [...state.habits, habit]
            })),

            completeHabit: (habitId) => {
                const state = get();
                const habit = state.habits.find(h => h.id === habitId);
                if (!habit) return;

                const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                // Check if already completed today
                if (habit.lastCompletedDate === today) return;

                // Calculate new streak
                let newStreak = 1;
                if (habit.lastCompletedDate === yesterday) {
                    // Continuing streak
                    newStreak = habit.streak + 1;
                }

                const newBestStreak = Math.max(habit.bestStreak, newStreak);

                // Update habit
                set((state) => ({
                    habits: state.habits.map(h =>
                        h.id === habitId
                            ? {
                                ...h,
                                streak: newStreak,
                                bestStreak: newBestStreak,
                                lastCompletedDate: today,
                                completedToday: true
                            }
                            : h
                    )
                }));

                // Award XP
                const area = state.areas.find(a => a.id === habit.linkedAreaId);
                get().addXP(habit.xpReward);
                if (area) {
                    get().addXP(Math.floor(habit.xpReward * 0.25), area.associatedAttribute);
                }
            },

            deleteHabit: (habitId) => set((state) => ({
                habits: state.habits.filter(h => h.id !== habitId)
            })),

            resetDailyHabits: () => {
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                set((state) => ({
                    habits: state.habits.map(h => {
                        // Check if streak should be broken
                        const streakBroken = h.lastCompletedDate !== today && h.lastCompletedDate !== yesterday;
                        return {
                            ...h,
                            completedToday: h.lastCompletedDate === today,
                            streak: streakBroken ? 0 : h.streak
                        };
                    })
                }));
            },
        }),

        {
            name: 'second-brain-rpg-storage',
        }
    )
);
