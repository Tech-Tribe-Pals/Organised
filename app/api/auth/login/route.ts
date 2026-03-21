import { NextRequest, NextResponse } from 'next/server';

import { authenticateUser, AuthValidationError, createSession, setSessionCookie } from '@/lib/auth';
import { MongoConnectionError } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        const user = await authenticateUser(email ?? '', password ?? '');

        if (!user) {
            return NextResponse.json({ error: 'Credenciales invalidas.' }, { status: 401 });
        }

        const { token, expiresAt } = await createSession(user.id);
        const response = NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatar_url ?? null,
                role: user.role,
            },
        });

        setSessionCookie(response, token, expiresAt);
        return response;
    } catch (error) {
        if (error instanceof AuthValidationError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (error instanceof MongoConnectionError) {
            return NextResponse.json({ error: error.message }, { status: 503 });
        }

        console.error('Error logging in:', error);
        return NextResponse.json({ error: 'No se pudo iniciar sesion.' }, { status: 500 });
    }
}