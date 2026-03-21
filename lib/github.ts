import 'server-only';

export interface GithubProfile {
    login: string;
    name: string | null;
    avatarUrl: string | null;
    profileUrl: string;
}

function getGithubHeaders(): HeadersInit {
    const headers: HeadersInit = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
    };

    const token = process.env.GITHUB_TOKEN;
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

export async function fetchGithubProfileByEmail(email: string): Promise<GithubProfile | null> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
        return null;
    }

    try {
        const searchResponse = await fetch(
            `https://api.github.com/search/users?q=${encodeURIComponent(`${normalizedEmail} in:email`)}&per_page=1`,
            {
                headers: getGithubHeaders(),
                next: { revalidate: 300 },
            },
        );

        if (!searchResponse.ok) {
            return null;
        }

        const searchPayload = await searchResponse.json() as { items?: Array<{ login?: string; avatar_url?: string; html_url?: string }> };
        const match = searchPayload.items?.[0];

        if (!match?.login) {
            return null;
        }

        const userResponse = await fetch(`https://api.github.com/users/${encodeURIComponent(match.login)}`, {
            headers: getGithubHeaders(),
            next: { revalidate: 300 },
        });

        if (!userResponse.ok) {
            return {
                login: match.login,
                name: match.login,
                avatarUrl: match.avatar_url ?? null,
                profileUrl: match.html_url ?? `https://github.com/${match.login}`,
            };
        }

        const userPayload = await userResponse.json() as { login?: string; name?: string | null; avatar_url?: string | null; html_url?: string };

        return {
            login: userPayload.login ?? match.login,
            name: userPayload.name ?? match.login,
            avatarUrl: userPayload.avatar_url ?? match.avatar_url ?? null,
            profileUrl: userPayload.html_url ?? match.html_url ?? `https://github.com/${match.login}`,
        };
    } catch {
        return null;
    }
}