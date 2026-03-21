import { NextRequest, NextResponse } from 'next/server';

import { AuthValidationError, createSession, createUser, setSessionCookie } from '@/lib/auth';
import { MongoConnectionError } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        const user = await createUser(email ?? '', password ?? '');
        const { token, expiresAt } = await createSession(user.id);
        const response = NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatar_url ?? null,
                role: user.role,
            },
        }, { status: 201 });

        setSessionCookie(response, token, expiresAt);
        return response;
    } catch (error) {
        if (error instanceof AuthValidationError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (error instanceof MongoConnectionError) {
            return NextResponse.json({ error: error.message }, { status: 503 });
        }

        if (typeof error === 'object' && error && 'code' in error && error.code === 11000) {
            return NextResponse.json({ error: 'La cuenta ya existe.' }, { status: 409 });
        }

        console.error('Error registering user:', error);
        return NextResponse.json({ error: 'No se pudo crear la cuenta.' }, { status: 500 });
    }
}