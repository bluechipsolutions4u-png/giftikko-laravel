import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    try {
        const response = await fetch(imageUrl);

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
        }

        const arrayBuffer = await response.arrayBuffer();
        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('content-type') || 'image/png');
        // Ensure aggressive cache headers if you want
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        return new NextResponse(arrayBuffer, {
            status: 200,
            headers: headers,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 });
    }
}
