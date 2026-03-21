import { NextRequest, NextResponse } from 'next/server';

import { AuthValidationError, findUserByEmail, hydrateUserWithGithubProfile } from '@/lib/auth';
import { MongoConnectionError } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();
        const existingUser = await findUserByEmail(email ?? '');

        if (!existingUser) {
            return NextResponse.json({
                exists: false,
                user: null,
            });
        }

        const user = await hydrateUserWithGithubProfile(existingUser);

        return NextResponse.json({
            exists: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatar_url ?? null,
                githubLogin: user.github_login ?? null,
                githubUrl: user.github_url ?? null,
                role: user.role,
            },
        });
    } catch (error) {
        if (error instanceof AuthValidationError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (error instanceof MongoConnectionError) {
            return NextResponse.json({ error: error.message }, { status: 503 });
        }

        console.error('Error checking email:', error);
        return NextResponse.json({ error: 'No se pudo verificar el email.' }, { status: 500 });
    }
}