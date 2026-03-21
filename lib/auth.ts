import 'server-only';

import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

import type { NextRequest, NextResponse } from 'next/server';

import type { GithubProfile } from '@/lib/github';
import { fetchGithubProfileByEmail } from '@/lib/github';
import { getMongoDb } from '@/lib/mongodb';

const scrypt = promisify(scryptCallback);

const SESSION_COOKIE_NAME = 'organiseed_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

declare global {
    var mongoAuthIndexesPromise: Promise<void> | undefined;
}

export interface UserDocument {
    id: string;
    email: string;
    password_hash: string;
    name: string;
    avatar_url?: string | null;
    github_login?: string | null;
    github_url?: string | null;
    role: string;
    createdAt: string;
    updatedAt: string;
}

interface SessionDocument {
    token_hash: string;
    user_id: string;
    createdAt: string;
    lastSeenAt: string;
    expiresAt: Date;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    role: string;
}

export class AuthValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthValidationError';
    }
}

function getUsersCollection() {
    return getMongoDb().then((db) => db.collection<UserDocument>('users'));
}

function getSessionsCollection() {
    return getMongoDb().then((db) => db.collection<SessionDocument>('sessions'));
}

function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

function validateEmail(email: string) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new AuthValidationError('Ingresa un email valido.');
    }
}

function validatePassword(password: string) {
    if (password.length < 8) {
        throw new AuthValidationError('La contraseña debe tener al menos 8 caracteres.');
    }
}

function formatNameFromEmail(email: string) {
    const localPart = email.split('@')[0] ?? 'Usuario';
    const cleaned = localPart.replace(/[._-]+/g, ' ').trim();

    if (!cleaned) {
        return 'Usuario';
    }

    return cleaned
        .split(/\s+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password: string, storedHash: string) {
    const [salt, key] = storedHash.split(':');

    if (!salt || !key) {
        return false;
    }

    const storedBuffer = Buffer.from(key, 'hex');
    const derivedKey = (await scrypt(password, salt, storedBuffer.length)) as Buffer;

    if (derivedKey.length !== storedBuffer.length) {
        return false;
    }

    return timingSafeEqual(derivedKey, storedBuffer);
}

function generateSessionToken() {
    return randomBytes(32).toString('hex');
}

function hashSessionToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
}

function toAuthUser(user: UserDocument): AuthUser {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url ?? null,
        role: user.role,
    };
}

function applyGithubProfile(user: UserDocument, githubProfile: GithubProfile | null) {
    if (!githubProfile) {
        return user;
    }

    return {
        ...user,
        name: githubProfile.name?.trim() || user.name,
        avatar_url: githubProfile.avatarUrl ?? user.avatar_url ?? null,
        github_login: githubProfile.login,
        github_url: githubProfile.profileUrl,
    };
}

export async function ensureAuthIndexes() {
    if (!global.mongoAuthIndexesPromise) {
        global.mongoAuthIndexesPromise = (async () => {
            const [users, sessions] = await Promise.all([
                getUsersCollection(),
                getSessionsCollection(),
            ]);

            await Promise.all([
                users.createIndex({ email: 1 }, { unique: true, name: 'users_email_unique' }),
                sessions.createIndex({ token_hash: 1 }, { unique: true, name: 'sessions_token_hash_unique' }),
                sessions.createIndex({ user_id: 1 }, { name: 'sessions_user_id' }),
                sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'sessions_expires_at_ttl' }),
            ]);
        })();
    }

    return global.mongoAuthIndexesPromise;
}

export async function createUser(emailInput: string, password: string) {
    const email = normalizeEmail(emailInput);

    validateEmail(email);
    validatePassword(password);
    await ensureAuthIndexes();

    const users = await getUsersCollection();
    const now = new Date().toISOString();
    const githubProfile = await fetchGithubProfileByEmail(email);
    const baseUser: UserDocument = {
        id: randomUUID(),
        email,
        password_hash: await hashPassword(password),
        name: formatNameFromEmail(email),
        avatar_url: null,
        github_login: null,
        github_url: null,
        role: 'Admin',
        createdAt: now,
        updatedAt: now,
    };
    const user = applyGithubProfile(baseUser, githubProfile);

    await users.insertOne(user);

    return user;
}

export async function findUserByEmail(emailInput: string) {
    const email = normalizeEmail(emailInput);

    validateEmail(email);
    await ensureAuthIndexes();

    const users = await getUsersCollection();
    return users.findOne({ email });
}

export async function hydrateUserWithGithubProfile(user: UserDocument) {
    const githubProfile = await fetchGithubProfileByEmail(user.email);

    if (!githubProfile) {
        return user;
    }

    const nextUser = applyGithubProfile({
        ...user,
        updatedAt: new Date().toISOString(),
    }, githubProfile);

    if (
        nextUser.name === user.name &&
        nextUser.avatar_url === user.avatar_url &&
        nextUser.github_login === user.github_login &&
        nextUser.github_url === user.github_url
    ) {
        return user;
    }

    const users = await getUsersCollection();
    await users.updateOne(
        { id: user.id },
        {
            $set: {
                name: nextUser.name,
                avatar_url: nextUser.avatar_url ?? null,
                github_login: nextUser.github_login ?? null,
                github_url: nextUser.github_url ?? null,
                updatedAt: nextUser.updatedAt,
            },
        },
    );

    return nextUser;
}

export async function authenticateUser(emailInput: string, password: string) {
    const email = normalizeEmail(emailInput);

    validateEmail(email);
    validatePassword(password);
    await ensureAuthIndexes();

    const users = await getUsersCollection();
    const user = await users.findOne({ email });

    if (!user) {
        return null;
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
        return null;
    }

    return hydrateUserWithGithubProfile(user);
}

export async function createSession(userId: string) {
    await ensureAuthIndexes();

    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    const now = new Date().toISOString();

    const sessions = await getSessionsCollection();
    await sessions.insertOne({
        token_hash: hashSessionToken(token),
        user_id: userId,
        createdAt: now,
        lastSeenAt: now,
        expiresAt,
    });

    return { token, expiresAt };
}

export async function getAuthenticatedUser(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
        return null;
    }

    await ensureAuthIndexes();
    const sessions = await getSessionsCollection();
    const session = await sessions.findOne({ token_hash: hashSessionToken(token) });

    if (!session) {
        return null;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
        await sessions.deleteOne({ token_hash: session.token_hash });
        return null;
    }

    const users = await getUsersCollection();
    const user = await users.findOne({ id: session.user_id });

    if (!user) {
        await sessions.deleteOne({ token_hash: session.token_hash });
        return null;
    }

    return toAuthUser(user);
}

export async function invalidateSession(token: string | null) {
    if (!token) {
        return;
    }

    const sessions = await getSessionsCollection();
    await sessions.deleteOne({ token_hash: hashSessionToken(token) });
}

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
    response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: token,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        path: '/',
    });
}

export function clearSessionCookie(response: NextResponse) {
    response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: '',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(0),
        path: '/',
    });
}

export function getSessionCookieToken(request: NextRequest) {
    return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}