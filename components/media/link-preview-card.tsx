"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface LinkMetadata {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  url: string;
}

interface LinkPreviewCardProps {
  url: string;
  name: string;
}

function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com/watch') || url.includes('youtu.be/');
}

function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function LinkPreviewCard({ url, name }: LinkPreviewCardProps) {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          const data = await response.json();
          setMetadata(data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchMetadata();
  }, [url]);

  if (loading) {
    return (
      <div className="w-full rounded-xl border border-border/50 overflow-hidden bg-card animate-pulse">
        <div className="aspect-video bg-muted" />
        <div className="p-4 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }

  // Check if it's a YouTube video
  const isYouTube = isYouTubeUrl(url);
  const youtubeVideoId = isYouTube ? getYouTubeVideoId(url) : null;

  if (isYouTube && youtubeVideoId) {
    return (
      <div className="w-full rounded-xl border border-border/50 overflow-hidden bg-card">
        <div className="relative aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}`}
            title={metadata?.title || name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
        {!loading && metadata && (
          <div className="p-4">
            <h3 className="font-semibold text-base line-clamp-2 mb-2">
              {metadata.title || name}
            </h3>
            {metadata.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {metadata.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">YouTube</span>
              <span>•</span>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors truncate"
              >
                Watch on YouTube
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all bg-card group"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate group-hover:text-primary transition-colors">{name}</p>
            <p className="text-sm text-muted-foreground truncate">{url}</p>
          </div>
          <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full rounded-xl border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all overflow-hidden bg-card group"
    >
      {/* Always show preview - OG image or placeholder */}
      <div className="relative aspect-video overflow-hidden">
        {metadata.image ? (
          <Image
            src={metadata.image}
            alt={metadata.title || name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-muted flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <p className="text-sm font-medium text-muted-foreground">{new URL(url).hostname}</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
            {metadata.title || name}
          </h3>
          <svg className="w-5 h-5 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
        {metadata.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {metadata.description}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {metadata.siteName && (
            <>
              <span className="font-medium">{metadata.siteName}</span>
              <span>•</span>
            </>
          )}
          <span className="truncate">{new URL(url).hostname}</span>
        </div>
      </div>
    </a>
  );
}
