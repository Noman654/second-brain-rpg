export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    avatar_url: string | null
                    level: number
                    current_xp: number
                    xp_to_next_level: number
                    strength: number
                    intellect: number
                    charisma: number
                    wealth: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username?: string | null
                    avatar_url?: string | null
                    level?: number
                    current_xp?: number
                    xp_to_next_level?: number
                    strength?: number
                    intellect?: number
                    charisma?: number
                    wealth?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string | null
                    avatar_url?: string | null
                    level?: number
                    current_xp?: number
                    xp_to_next_level?: number
                    strength?: number
                    intellect?: number
                    charisma?: number
                    wealth?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            areas: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    associated_attribute: string
                    current_level: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    associated_attribute: string
                    current_level?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    associated_attribute?: string
                    current_level?: number
                    created_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    user_id: string
                    linked_area_id: string | null
                    title: string
                    difficulty: string
                    xp_reward: number
                    deadline: string | null
                    is_completed: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    linked_area_id?: string | null
                    title: string
                    difficulty: string
                    xp_reward: number
                    deadline?: string | null
                    is_completed?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    linked_area_id?: string | null
                    title?: string
                    difficulty?: string
                    xp_reward?: number
                    deadline?: string | null
                    is_completed?: boolean
                    created_at?: string
                }
            }
            milestones: {
                Row: {
                    id: string
                    project_id: string
                    text: string
                    is_done: boolean
                    position: number
                }
                Insert: {
                    id?: string
                    project_id: string
                    text: string
                    is_done?: boolean
                    position?: number
                }
                Update: {
                    id?: string
                    project_id?: string
                    text?: string
                    is_done?: boolean
                    position?: number
                }
            }
            habits: {
                Row: {
                    id: string
                    user_id: string
                    linked_area_id: string | null
                    title: string
                    target_minutes: number | null
                    xp_reward: number
                    streak: number
                    best_streak: number
                    last_completed_date: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    linked_area_id?: string | null
                    title: string
                    target_minutes?: number | null
                    xp_reward?: number
                    streak?: number
                    best_streak?: number
                    last_completed_date?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    linked_area_id?: string | null
                    title?: string
                    target_minutes?: number | null
                    xp_reward?: number
                    streak?: number
                    best_streak?: number
                    last_completed_date?: string | null
                    created_at?: string
                }
            }
            resources: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    content: string | null
                    link: string | null
                    linked_area_id: string | null
                    tags: string[] | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    content?: string | null
                    link?: string | null
                    linked_area_id?: string | null
                    tags?: string[] | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    content?: string | null
                    link?: string | null
                    linked_area_id?: string | null
                    tags?: string[] | null
                    created_at?: string
                }
            }
            archives: {
                Row: {
                    id: string
                    user_id: string
                    original_id: string | null
                    title: string
                    type: string
                    completed_date: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    original_id?: string | null
                    title: string
                    type: string
                    completed_date?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    original_id?: string | null
                    title?: string
                    type?: string
                    completed_date?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
