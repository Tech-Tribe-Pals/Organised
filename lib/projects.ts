// ── Supabase Integration ──────────────────────────
import { supabase } from './supabase';

export interface TeamMember {
    name: string;
    username?: string;   // GitHub login
    avatar?: string;     // URL
    color: string;
    fromGithub?: boolean;
}

export interface Task {
    id: number;
    text: string;
    completed: boolean;
}

export interface Week {
    id: number;
    tasks: Task[];
    finished: boolean;
    completedCount?: number; // solo cuando está terminada
}

export interface Note {
    id: number;
    text: string;
}

export type Priority = 'Baja' | 'Media' | 'Alta';
export type Seed = 'Roble' | 'Bambú' | 'Girasol';
export type Status = 'Sin iniciar' | 'En proceso' | 'Finalizado';

export interface Project {
    id: string;
    name: string;
    description?: string;
    category: string;
    priority: Priority;
    seed: Seed;
    status: Status;
    startDate: string;   // ISO "YYYY-MM-DD"
    endDate: string;     // ISO "YYYY-MM-DD"
    pm?: TeamMember;
    team: TeamMember[];
    createdAt: string;   // ISO "YYYY-MM-DD"
    weeks?: Week[];
    githubRepo?: string; // e.g. "shadcn-ui/ui"
    notes?: Note[];
    user_id?: string;
}

// ── Helpers ────────────────────────────────────────

export function growthProgress(startDate: string, endDate: string): number {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    if (isNaN(start) || isNaN(end) || end <= start) return 0;
    if (now <= start) return 0;
    if (now >= end) return 1;
    return (now - start) / (end - start);
}

export function growthStage(progress: number): { label: string; color: string } {
    if (progress === 0) return { label: 'Semilla', color: '#6b7280' };
    if (progress < 0.25) return { label: 'Brote', color: '#86efac' };
    if (progress < 0.5) return { label: 'Creciendo', color: '#4ade80' };
    if (progress < 0.85) return { label: 'Madurando', color: '#22c55e' };
    return { label: 'Establecido', color: '#16a34a' };
}

export function generateId(): string {
    return crypto.randomUUID();
}

// ── Default Weeks (for new projects) ────────────────
const DEFAULT_WEEKS: Week[] = [
    {
        id: 1,
        finished: false,
        tasks: [
            { id: 101, text: "Organizar reunión inicial (Kickoff).", completed: false },
            { id: 102, text: "Definir alcance y requerimientos básicos.", completed: false },
            { id: 103, text: "Configurar el repositorio y entorno de desarrollo.", completed: false },
        ]
    }
];

export function getMockInitialWeeks(): Week[] {
    return JSON.parse(JSON.stringify(DEFAULT_WEEKS));
}

// ── Supabase Operations ────────────────────────────

export async function getProjects(): Promise<Project[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching projects:', error);
        return [];
    }

    // Map database fields (snake_case) to interface fields (camelCase) if necessary
    // Assuming the table uses the same names or handles mapping
    return (data || []).map(p => ({
        ...p,
        startDate: p.start_date,
        endDate: p.end_date,
        createdAt: p.created_at,
        githubRepo: p.github_repo
    })) as Project[];
}

export async function addProject(project: Project): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No session found");

    if (!project.weeks || project.weeks.length === 0) {
        project.weeks = getMockInitialWeeks();
    }

    const { error } = await supabase
        .from('projects')
        .insert({
            id: project.id,
            user_id: session.user.id,
            name: project.name,
            description: project.description,
            category: project.category,
            priority: project.priority,
            seed: project.seed,
            status: project.status,
            start_date: project.startDate,
            end_date: project.endDate,
            pm: project.pm,
            team: project.team,
            weeks: project.weeks,
            notes: project.notes || [],
            github_repo: project.githubRepo,
            created_at: new Date().toISOString()
        });

    if (error) {
        console.error('Error adding project:', error);
        throw error;
    }

    window.dispatchEvent(new CustomEvent('organiseed:projectsUpdated'));
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
    const dbUpdates: any = { ...updates };
    
    // Map camelCase to snake_case for DB
    if (updates.startDate) dbUpdates.start_date = updates.startDate;
    if (updates.endDate) dbUpdates.end_date = updates.endDate;
    if (updates.githubRepo) dbUpdates.github_repo = updates.githubRepo;
    
    // Clean up camelCase keys that were mapped
    delete dbUpdates.startDate;
    delete dbUpdates.endDate;
    delete dbUpdates.githubRepo;

    const { error } = await supabase
        .from('projects')
        .update(dbUpdates)
        .eq('id', id);

    if (error) {
        console.error('Error updating project:', error);
        throw error;
    }
    
    window.dispatchEvent(new CustomEvent('organiseed:projectsUpdated'));
}

export async function deleteProject(id: string): Promise<void> {
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting project:', error);
        throw error;
    }

    window.dispatchEvent(new CustomEvent('organiseed:projectsUpdated'));
}

export async function getActiveProject(): Promise<Project | null> {
    const projects = await getProjects();
    return (
        projects.find(p => p.status === 'En proceso') ??
        projects[0] ??
        null
    );
}

