import 'server-only';

import type { Note, Priority, Project, Seed, Status, Task, TeamMember, Week } from '@/lib/projects';

const PRIORITIES: Priority[] = ['Baja', 'Media', 'Alta'];
const SEEDS: Seed[] = ['Roble', 'Bambú', 'Girasol'];
const STATUSES: Status[] = ['Sin iniciar', 'En proceso', 'Finalizado'];
const GITHUB_REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const DEFAULT_WEEKS: Week[] = [
    {
        id: 1,
        finished: false,
        tasks: [
            { id: 101, text: 'Organizar reunion inicial (Kickoff).', completed: false },
            { id: 102, text: 'Definir alcance y requerimientos basicos.', completed: false },
            { id: 103, text: 'Configurar el repositorio y entorno de desarrollo.', completed: false },
        ],
    },
];

export interface ProjectDocument extends Project {
    user_id: string;
    updatedAt: string;
}

export class ProjectValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ProjectValidationError';
    }
}

function trimString(value: unknown, fieldName: string, maxLength: number, allowEmpty = false) {
    if (typeof value !== 'string') {
        throw new ProjectValidationError(`${fieldName} must be a string.`);
    }

    const normalized = value.trim();

    if (!allowEmpty && !normalized) {
        throw new ProjectValidationError(`${fieldName} is required.`);
    }

    if (normalized.length > maxLength) {
        throw new ProjectValidationError(`${fieldName} is too long.`);
    }

    return normalized;
}

function trimOptionalString(value: unknown, fieldName: string, maxLength: number) {
    if (value == null || value === '') {
        return undefined;
    }

    return trimString(value, fieldName, maxLength);
}

function normalizeDate(value: unknown, fieldName: string) {
    const normalized = trimString(value, fieldName, 10);

    if (!DATE_PATTERN.test(normalized) || Number.isNaN(new Date(`${normalized}T00:00:00.000Z`).getTime())) {
        throw new ProjectValidationError(`${fieldName} must use YYYY-MM-DD format.`);
    }

    return normalized;
}

function normalizeEnum<T extends string>(value: unknown, allowed: readonly T[], fieldName: string) {
    if (typeof value !== 'string' || !allowed.includes(value as T)) {
        throw new ProjectValidationError(`${fieldName} is invalid.`);
    }

    return value as T;
}

function normalizeTask(task: unknown, index: number): Task {
    if (!task || typeof task !== 'object') {
        throw new ProjectValidationError(`tasks[${index}] is invalid.`);
    }

    const current = task as Partial<Task>;
    const taskId = typeof current.id === 'number' && Number.isInteger(current.id)
        ? current.id
        : index + 1;

    return {
        id: taskId,
        text: trimString(current.text, `tasks[${index}].text`, 500),
        completed: Boolean(current.completed),
    };
}

function normalizeWeek(week: unknown, index: number): Week {
    if (!week || typeof week !== 'object') {
        throw new ProjectValidationError(`weeks[${index}] is invalid.`);
    }

    const current = week as Partial<Week>;
    const tasks = Array.isArray(current.tasks) ? current.tasks.map(normalizeTask) : [];
    const weekId = typeof current.id === 'number' && Number.isInteger(current.id)
        ? current.id
        : index + 1;

    return {
        id: weekId,
        tasks,
        finished: Boolean(current.finished),
        completedCount: typeof current.completedCount === 'number' ? current.completedCount : undefined,
    };
}

function normalizeNote(note: unknown, index: number): Note {
    if (!note || typeof note !== 'object') {
        throw new ProjectValidationError(`notes[${index}] is invalid.`);
    }

    const current = note as Partial<Note>;
    const noteId = typeof current.id === 'number' && Number.isInteger(current.id)
        ? current.id
        : index + 1;

    return {
        id: noteId,
        text: trimString(current.text, `notes[${index}].text`, 1000),
    };
}

function normalizeTeamMember(member: unknown, index: number): TeamMember {
    if (!member || typeof member !== 'object') {
        throw new ProjectValidationError(`team[${index}] is invalid.`);
    }

    const current = member as Partial<TeamMember>;

    return {
        name: trimString(current.name, `team[${index}].name`, 120),
        username: trimOptionalString(current.username, `team[${index}].username`, 80),
        avatar: trimOptionalString(current.avatar, `team[${index}].avatar`, 500),
        color: trimString(current.color, `team[${index}].color`, 32),
        fromGithub: typeof current.fromGithub === 'boolean' ? current.fromGithub : undefined,
    };
}

function normalizeGithubRepo(value: unknown) {
    const normalized = trimOptionalString(value, 'githubRepo', 120);

    if (!normalized) {
        return undefined;
    }

    if (!GITHUB_REPO_PATTERN.test(normalized)) {
        throw new ProjectValidationError('githubRepo must use owner/repo format.');
    }

    return normalized;
}

function getDefaultWeeks() {
    return JSON.parse(JSON.stringify(DEFAULT_WEEKS)) as Week[];
}

export function normalizeProjectForInsert(project: unknown, userId: string) {
    if (!project || typeof project !== 'object') {
        throw new ProjectValidationError('Project payload is invalid.');
    }

    const current = project as Partial<Project>;
    const startDate = normalizeDate(current.startDate, 'startDate');
    const endDate = normalizeDate(current.endDate, 'endDate');

    if (endDate < startDate) {
        throw new ProjectValidationError('endDate must be greater than or equal to startDate.');
    }

    const document: ProjectDocument = {
        id: trimString(current.id, 'id', 120),
        name: trimString(current.name, 'name', 160),
        description: trimOptionalString(current.description, 'description', 2000),
        category: trimString(current.category, 'category', 80),
        priority: normalizeEnum(current.priority, PRIORITIES, 'priority'),
        seed: normalizeEnum(current.seed, SEEDS, 'seed'),
        status: normalizeEnum(current.status, STATUSES, 'status'),
        startDate,
        endDate,
        pm: current.pm ? normalizeTeamMember(current.pm, -1) : undefined,
        team: Array.isArray(current.team) ? current.team.map(normalizeTeamMember) : [],
        createdAt: normalizeDate(current.createdAt, 'createdAt'),
        weeks: Array.isArray(current.weeks) && current.weeks.length > 0 ? current.weeks.map(normalizeWeek) : getDefaultWeeks(),
        githubRepo: normalizeGithubRepo(current.githubRepo),
        notes: Array.isArray(current.notes) ? current.notes.map(normalizeNote) : [],
        user_id: userId,
        updatedAt: new Date().toISOString(),
    };

    return document;
}

export function normalizeProjectUpdates(updates: unknown) {
    if (!updates || typeof updates !== 'object') {
        throw new ProjectValidationError('Update payload is invalid.');
    }

    const current = updates as Partial<Project>;
    const normalized: Partial<Project> = {};

    if ('name' in current) normalized.name = trimString(current.name, 'name', 160);
    if ('description' in current) normalized.description = trimOptionalString(current.description, 'description', 2000);
    if ('category' in current) normalized.category = trimString(current.category, 'category', 80);
    if ('priority' in current) normalized.priority = normalizeEnum(current.priority, PRIORITIES, 'priority');
    if ('seed' in current) normalized.seed = normalizeEnum(current.seed, SEEDS, 'seed');
    if ('status' in current) normalized.status = normalizeEnum(current.status, STATUSES, 'status');
    if ('startDate' in current) normalized.startDate = normalizeDate(current.startDate, 'startDate');
    if ('endDate' in current) normalized.endDate = normalizeDate(current.endDate, 'endDate');
    if ('pm' in current) normalized.pm = current.pm ? normalizeTeamMember(current.pm, -1) : undefined;
    if ('team' in current) normalized.team = Array.isArray(current.team) ? current.team.map(normalizeTeamMember) : [];
    if ('weeks' in current) normalized.weeks = Array.isArray(current.weeks) ? current.weeks.map(normalizeWeek) : [];
    if ('githubRepo' in current) normalized.githubRepo = normalizeGithubRepo(current.githubRepo);
    if ('notes' in current) normalized.notes = Array.isArray(current.notes) ? current.notes.map(normalizeNote) : [];

    if (Object.keys(normalized).length === 0) {
        throw new ProjectValidationError('No valid project fields were provided for update.');
    }

    return normalized;
}

export function mergeAndValidateProjectDocument(document: ProjectDocument, updates: Partial<Project>) {
    const merged: Project = {
        ...document,
        ...updates,
    };

    const normalized = normalizeProjectForInsert(merged, document.user_id);

    return {
        ...normalized,
        createdAt: document.createdAt,
    };
}

export function sanitizeProject(document: ProjectDocument & { _id?: unknown }): Project {
    const project = { ...document } as Partial<ProjectDocument & { _id?: unknown }>;
    delete project._id;
    delete project.user_id;
    delete project.updatedAt;
    return project as Project;
}