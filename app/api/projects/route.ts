import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUserId } from '@/lib/api-auth';
import { ensureMongoIndexes, getMongoDb, MongoConnectionError } from '@/lib/mongodb';
import { normalizeProjectForInsert, ProjectValidationError, sanitizeProject, type ProjectDocument } from '@/lib/project-model';

function getProjectsCollection() {
    return getMongoDb().then((db) => db.collection<ProjectDocument>('projects'));
}

export async function GET(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(request);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
        }

        await ensureMongoIndexes();
        const projectsCollection = await getProjectsCollection();
        const documents = await projectsCollection
            .find({ user_id: userId })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json(documents.map(sanitizeProject));
    } catch (error) {
        if (error instanceof MongoConnectionError) {
            return NextResponse.json({ error: error.message }, { status: 503 });
        }

        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects.' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();

    try {
        const document = normalizeProjectForInsert(body.project, userId);
        await ensureMongoIndexes();
        const projectsCollection = await getProjectsCollection();
        await projectsCollection.insertOne(document);

        return NextResponse.json(sanitizeProject(document), { status: 201 });
    } catch (error) {
        if (error instanceof ProjectValidationError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (error instanceof MongoConnectionError) {
            return NextResponse.json({ error: error.message }, { status: 503 });
        }

        if (typeof error === 'object' && error && 'code' in error && error.code === 11000) {
            return NextResponse.json({ error: 'A project with that id already exists.' }, { status: 409 });
        }

        console.error('Error creating project:', error);
        return NextResponse.json({ error: 'Failed to create project.' }, { status: 500 });
    }
}