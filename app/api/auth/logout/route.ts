import { NextRequest, NextResponse } from 'next/server';

import { clearSessionCookie, getSessionCookieToken, invalidateSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const token = getSessionCookieToken(request);
    await invalidateSession(token);

    const response = new NextResponse(null, { status: 204 });
    clearSessionCookie(response);
    return response;
}