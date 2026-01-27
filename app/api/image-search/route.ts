import { NextRequest, NextResponse } from 'next/server';

// Google Custom Search API
const GOOGLE_SEARCH_URL = 'https://www.googleapis.com/customsearch/v1';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const apiKey = searchParams.get('apiKey');
  const cx = searchParams.get('cx'); // Custom Search Engine ID

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  if (!apiKey || !cx) {
    return NextResponse.json({ error: 'API key and CX are required' }, { status: 401 });
  }

  try {
    const fullQuery = `무한도전 ${query}`;
    const params = new URLSearchParams({
      key: apiKey,
      cx: cx,
      q: fullQuery,
      searchType: 'image',
      num: '10',
      safe: 'active',
    });

    const response = await fetch(`${GOOGLE_SEARCH_URL}?${params}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google API error: ${error}`);
    }

    const data = await response.json();

    // Transform the results
    const images = (data.items || []).map((item: {
      title: string;
      link: string;
      image?: {
        thumbnailLink?: string;
        contextLink?: string;
        width?: number;
        height?: number;
      };
      displayLink?: string;
    }) => ({
      title: item.title,
      link: item.link,
      thumbnail: item.image?.thumbnailLink || item.link,
      source: item.image?.contextLink || '',
      width: item.image?.width,
      height: item.image?.height,
      displayLink: item.displayLink,
    }));

    return NextResponse.json({
      success: true,
      query: fullQuery,
      images,
      totalResults: data.searchInformation?.totalResults || 0,
    });
  } catch (error) {
    console.error('Image search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
