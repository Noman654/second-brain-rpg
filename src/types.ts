export type Category = 'PROJECT' | 'AREA' | 'RESOURCE' | 'ARCHIVE';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';

export interface UserStats {
    level: number;
    currentXP: number;
    xpToNextLevel: number;
    attributes: {
        strength: number; // Linked to Health/Fitness Areas
        intellect: number; // Linked to Learning/Study Areas
        charisma: number; // Linked to Social/Network Areas
        wealth: number;   // Linked to Finance/Career Areas
    };
}

export interface Milestone {
    id: string;
    text: string;
    isDone: boolean;
}

export interface Project {
    id: string;
    title: string;
    category: 'PROJECT';
    linkedAreaId: string; // Which Area does this project improve? (e.g. "Work")
    difficulty: Difficulty; // Determines XP reward
    milestones: Milestone[];
    isCompleted: boolean;
    deadline: Date;
    xpReward: number; // Calc: Easy=50, Med=100, Hard=200, Epic=500
}

export interface Area {
    id: string;
    title: string; // e.g., "Software Engineering", "Physical Health"
    category: 'AREA';
    associatedAttribute: 'strength' | 'intellect' | 'charisma' | 'wealth';
    currentLevel: number; // The specific level of THIS area
}

export interface Resource {
    id: string;
    title: string;
    content: string; // Markdown or text
    tags: string[];
    category: 'RESOURCE';
}

export interface ArchivedItem {
    originalId: string;
    title: string;
    completedDate: Date;
    type: 'PROJECT' | 'RESOURCE';
}

// Daily Habits / Recurring Quests
export interface Habit {
    id: string;
    title: string;
    linkedAreaId: string; // Which Area does this habit improve?
    targetMinutes?: number; // Optional daily time goal (e.g. 60 for "1 hour")
    xpReward: number; // XP per completion
    streak: number; // Current streak count
    bestStreak: number; // Record streak
    lastCompletedDate: string | null; // ISO date string "YYYY-MM-DD"
    completedToday: boolean; // Computed based on lastCompletedDate
}
