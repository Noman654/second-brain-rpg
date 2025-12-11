import { getSupabaseClient } from '../supabase';
import type { Database } from '../database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
type Milestone = Database['public']['Tables']['milestones']['Row'];
type MilestoneInsert = Database['public']['Tables']['milestones']['Insert'];

export interface ProjectWithMilestones extends Project {
    milestones: Milestone[];
}

export async function getProjects(userId: string): Promise<ProjectWithMilestones[]> {
    const supabase = getSupabaseClient();
    const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', false)
        .order('created_at', { ascending: false });

    if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        return [];
    }

    // Fetch milestones for all projects
    const projectIds = projects?.map(p => p.id) || [];
    if (projectIds.length === 0) return [];

    const { data: milestones, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .in('project_id', projectIds)
        .order('position', { ascending: true });

    if (milestonesError) {
        console.error('Error fetching milestones:', milestonesError);
    }

    // Combine projects with their milestones
    return projects.map(project => ({
        ...project,
        milestones: milestones?.filter(m => m.project_id === project.id) || [],
    }));
}

export async function createProject(
    project: ProjectInsert,
    milestones: Omit<MilestoneInsert, 'project_id'>[]
): Promise<ProjectWithMilestones | null> {
    const supabase = getSupabaseClient();

    // Create project
    const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

    if (projectError || !newProject) {
        console.error('Error creating project:', projectError);
        return null;
    }

    // Create milestones
    if (milestones.length > 0) {
        const milestonesToInsert = milestones.map((m, i) => ({
            ...m,
            project_id: newProject.id,
            position: i,
        }));

        const { data: newMilestones, error: milestonesError } = await supabase
            .from('milestones')
            .insert(milestonesToInsert)
            .select();

        if (milestonesError) {
            console.error('Error creating milestones:', milestonesError);
        }

        return { ...newProject, milestones: newMilestones || [] };
    }

    return { ...newProject, milestones: [] };
}

export async function toggleMilestone(milestoneId: string, isDone: boolean): Promise<Milestone | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('milestones')
        .update({ is_done: isDone })
        .eq('id', milestoneId)
        .select()
        .single();

    if (error) {
        console.error('Error toggling milestone:', error);
        return null;
    }
    return data;
}

export async function completeProject(projectId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
        .from('projects')
        .update({ is_completed: true })
        .eq('id', projectId);

    if (error) {
        console.error('Error completing project:', error);
        return false;
    }
    return true;
}

export async function deleteProject(projectId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    // Milestones are deleted via CASCADE
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

    if (error) {
        console.error('Error deleting project:', error);
        return false;
    }
    return true;
}

export async function updateProject(projectId: string, updates: ProjectUpdate): Promise<Project | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

    if (error) {
        console.error('Error updating project:', error);
        return null;
    }
    return data;
}
