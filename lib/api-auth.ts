import 'server-only';

import { NextRequest } from 'next/server';

import { getAuthenticatedUser } from '@/lib/auth';

export async function getAuthenticatedUserId(request: NextRequest) {
    const user = await getAuthenticatedUser(request);
    return user?.id ?? null;
}