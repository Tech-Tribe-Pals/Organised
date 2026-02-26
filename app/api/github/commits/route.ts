import { NextResponse } from 'next/server';

export const revalidate = 300; // Cache for 5 minutes (300 seconds)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const repo = searchParams.get('repo');

    if (!repo) {
        return NextResponse.json({ message: 'Repo parameter is required' }, { status: 400 });
    }

    const trimmedRepo = repo.trim();
    if (!trimmedRepo.includes('/')) {
        return NextResponse.json({ message: 'Invalid repo format' }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;
    const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${trimmedRepo}/commits?per_page=5`, {
            headers,
            // Next.js will cache this fetch automatically according to the exported revalidate time
            next: { revalidate: 300 }
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ message: data.message || 'GitHub API error' }, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in GitHub API backend:', error);
        return NextResponse.json({ message: 'Internal server error while fetching commits' }, { status: 500 });
    }
}
