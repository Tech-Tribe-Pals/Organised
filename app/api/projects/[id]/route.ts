import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUserId } from '@/lib/api-auth';
import { getMongoDb, MongoConnectionError } from '@/lib/mongodb';
import { mergeAndValidateProjectDocument, normalizeProjectUpdates, ProjectValidationError, type ProjectDocument } from '@/lib/project-model';

function getProjectsCollection() {
    return getMongoDb().then((db) => db.collection<ProjectDocument>('projects'));
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();

    try {
        const updates = normalizeProjectUpdates(body.updates ?? {});
        const projectsCollection = await getProjectsCollection();
        const currentDocument = await projectsCollection.findOne({ id, user_id: userId });

        if (!currentDocument) {
            return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
        }

        const nextDocument = mergeAndValidateProjectDocument(currentDocument, updates);

        await projectsCollection.updateOne(
            { id, user_id: userId },
            {
                $set: {
                    ...nextDocument,
                    updatedAt: new Date().toISOString(),
                },
            }
        );

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        if (error instanceof ProjectValidationError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (error instanceof MongoConnectionError) {
            return NextResponse.json({ error: error.message }, { status: 503 });
        }

        console.error('Error updating project:', error);
        return NextResponse.json({ error: 'Failed to update project.' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const userId = await getAuthenticatedUserId(request);

        if (!id || !userId) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
        }

        const projectsCollection = await getProjectsCollection();
        const result = await projectsCollection.deleteOne({ id, user_id: userId });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        if (error instanceof MongoConnectionError) {
            return NextResponse.json({ error: error.message }, { status: 503 });
        }

        console.error('Error deleting project:', error);
        return NextResponse.json({ error: 'Failed to delete project.' }, { status: 500 });
    }
}