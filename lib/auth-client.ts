"use client";

import { useEffect, useState } from 'react';

export interface SessionUser {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    githubLogin?: string | null;
    githubUrl?: string | null;
    role: string;
}

interface SessionResponse {
    user: SessionUser | null;
}

interface EmailLookupResponse {
    exists: boolean;
    user: SessionUser | null;
}

const AUTH_EVENT = 'organiseed:authChanged';

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let message = 'Request failed';

        try {
            const payload = await response.json();
            message = payload.error ?? message;
        } catch {
            message = response.statusText || message;
        }

        throw new Error(message);
    }

    return response.json() as Promise<T>;
}

function notifyAuthChanged() {
    window.dispatchEvent(new CustomEvent(AUTH_EVENT));
}

export async function getSession() {
    const response = await fetch('/api/auth/session', {
        cache: 'no-store',
        credentials: 'same-origin',
    });

    const payload = await response.json() as SessionResponse;
    return payload.user;
}

export async function login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const payload = await parseResponse<SessionResponse>(response);
    notifyAuthChanged();
    return payload.user;
}

export async function lookupEmail(email: string) {
    const response = await fetch('/api/auth/email', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    return parseResponse<EmailLookupResponse>(response);
}

export async function register(email: string, password: string) {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const payload = await parseResponse<SessionResponse>(response);
    notifyAuthChanged();
    return payload.user;
}

export async function logout() {
    await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
    });

    notifyAuthChanged();
}

export function useAuthSession() {
    const [user, setUser] = useState<SessionUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const loadSession = async () => {
            try {
                const nextUser = await getSession();
                if (active) {
                    setUser(nextUser);
                }
            } catch {
                if (active) {
                    setUser(null);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadSession();
        window.addEventListener(AUTH_EVENT, loadSession);

        return () => {
            active = false;
            window.removeEventListener(AUTH_EVENT, loadSession);
        };
    }, []);

    return {
        user,
        loading,
        authenticated: user !== null,
    };
}