import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Fetch the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch URL');
    }

    const html = await response.text();

    // Extract Open Graph and meta tags
    const metadata: any = {
      url,
      title: extractMetaTag(html, 'og:title') || extractMetaTag(html, 'twitter:title') || extractTitle(html),
      description: extractMetaTag(html, 'og:description') || extractMetaTag(html, 'twitter:description') || extractMetaTag(html, 'description'),
      image: extractMetaTag(html, 'og:image') || extractMetaTag(html, 'twitter:image'),
      siteName: extractMetaTag(html, 'og:site_name'),
    };

    // Make image URL absolute if it's relative
    if (metadata.image && !metadata.image.startsWith('http')) {
      const urlObj = new URL(url);
      metadata.image = new URL(metadata.image, urlObj.origin).href;
    }

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error fetching link preview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch link preview' },
      { status: 500 }
    );
  }
}

function extractMetaTag(html: string, property: string): string | null {
  // Try Open Graph tags
  const ogRegex = new RegExp(`<meta\\s+property=["']og:${property}["']\\s+content=["']([^"']+)["']`, 'i');
  const ogMatch = html.match(ogRegex);
  if (ogMatch) return ogMatch[1];

  // Try Twitter tags
  const twitterRegex = new RegExp(`<meta\\s+name=["']twitter:${property}["']\\s+content=["']([^"']+)["']`, 'i');
  const twitterMatch = html.match(twitterRegex);
  if (twitterMatch) return twitterMatch[1];

  // Try standard meta tags
  const metaRegex = new RegExp(`<meta\\s+name=["']${property}["']\\s+content=["']([^"']+)["']`, 'i');
  const metaMatch = html.match(metaRegex);
  if (metaMatch) return metaMatch[1];

  // Try property attribute
  const propRegex = new RegExp(`<meta\\s+property=["']${property}["']\\s+content=["']([^"']+)["']`, 'i');
  const propMatch = html.match(propRegex);
  if (propMatch) return propMatch[1];

  return null;
}

function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1] : null;
}
