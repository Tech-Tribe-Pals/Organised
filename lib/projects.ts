export class AuthRequiredError extends Error {
    constructor(message = 'Necesitas iniciar sesion para gestionar proyectos.') {
        super(message);
        this.name = 'AuthRequiredError';
    }
}

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

function dispatchProjectsUpdated() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('organiseed:projectsUpdated'));
    }
}

class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

async function apiRequest<T>(input: string, init?: RequestInit): Promise<T> {
    const response = await fetch(input, {
        cache: 'no-store',
        credentials: 'same-origin',
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        },
    });

    if (!response.ok) {
        let message = 'Request failed';
        try {
            const payload = await response.json();
            message = payload.error ?? message;
        } catch {
            message = response.statusText || message;
        }
        throw new ApiError(message, response.status);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

// ── MongoDB Operations ─────────────────────────────

export async function getProjects(): Promise<Project[]> {
    try {
        return await apiRequest<Project[]>('/api/projects');
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            return [];
        }

        console.error('Error fetching projects:', error);
        return [];
    }
}

export async function addProject(project: Project): Promise<void> {
    const payload: Project = {
        ...project,
        weeks: project.weeks?.length ? project.weeks : getMockInitialWeeks(),
        notes: project.notes ?? [],
        team: project.team ?? [],
    };

    try {
        await apiRequest('/api/projects', {
            method: 'POST',
            body: JSON.stringify({ project: payload }),
        });
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            throw new AuthRequiredError();
        }

        throw error;
    }

    dispatchProjectsUpdated();
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
    try {
        await apiRequest(`/api/projects/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ updates }),
        });
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            throw new AuthRequiredError();
        }

        throw error;
    }

    dispatchProjectsUpdated();
}

export async function deleteProject(id: string): Promise<void> {
    try {
        await apiRequest(`/api/projects/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            throw new AuthRequiredError();
        }

        throw error;
    }

    dispatchProjectsUpdated();
}

export async function getActiveProject(): Promise<Project | null> {
    const projects = await getProjects();
    return (
        projects.find(p => p.status === 'En proceso') ??
        projects[0] ??
        null
    );
}

