"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface BlogContentProcessorProps {
  content: string;
  onMediaClick?: (src: string, type: string) => void;
}

export function BlogContentProcessor({ content, onMediaClick }: BlogContentProcessorProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const container = contentRef.current;

    // Process all links for embedding
    const links = container.querySelectorAll('a[href]');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      // YouTube embed
      const youtubeMatch = href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      if (youtubeMatch) {
        const videoId = youtubeMatch[1];
        const iframe = document.createElement('div');
        iframe.className = 'relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl my-8';
        iframe.innerHTML = `
          <iframe
            src="https://www.youtube.com/embed/${videoId}"
            class="absolute inset-0 w-full h-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        `;
        link.parentNode?.replaceChild(iframe, link);
        return;
      }

      // Vimeo embed
      const vimeoMatch = href.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        const videoId = vimeoMatch[1];
        const iframe = document.createElement('div');
        iframe.className = 'relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl my-8';
        iframe.innerHTML = `
          <iframe
            src="https://player.vimeo.com/video/${videoId}"
            class="absolute inset-0 w-full h-full"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen
          ></iframe>
        `;
        link.parentNode?.replaceChild(iframe, link);
        return;
      }

      // Twitter/X embed
      const twitterMatch = href.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
      if (twitterMatch) {
        const tweetId = twitterMatch[1];
        const blockquote = document.createElement('div');
        blockquote.className = 'twitter-tweet-container my-8';
        blockquote.innerHTML = `
          <blockquote class="twitter-tweet" data-theme="dark">
            <a href="${href}"></a>
          </blockquote>
        `;
        link.parentNode?.replaceChild(blockquote, link);
        
        // Load Twitter widget script
        if (!document.querySelector('script[src*="twitter.com/widgets.js"]')) {
          const script = document.createElement('script');
          script.src = 'https://platform.twitter.com/widgets.js';
          script.async = true;
          document.body.appendChild(script);
        }
        return;
      }

      // Spotify embed
      const spotifyMatch = href.match(/spotify\.com\/(track|album|playlist|episode)\/([^?]+)/);
      if (spotifyMatch) {
        const [, type, id] = spotifyMatch;
        const iframe = document.createElement('div');
        iframe.className = 'w-full rounded-xl overflow-hidden shadow-lg my-8';
        iframe.innerHTML = `
          <iframe
            src="https://open.spotify.com/embed/${type}/${id}"
            width="100%"
            height="${type === 'track' || type === 'episode' ? '152' : '380'}"
            frameborder="0"
            allowtransparency="true"
            allow="encrypted-media"
          ></iframe>
        `;
        link.parentNode?.replaceChild(iframe, link);
        return;
      }

      // SoundCloud embed
      if (href.includes('soundcloud.com')) {
        const iframe = document.createElement('div');
        iframe.className = 'w-full rounded-xl overflow-hidden shadow-lg my-8';
        iframe.innerHTML = `
          <iframe
            width="100%"
            height="166"
            scrolling="no"
            frameborder="no"
            allow="autoplay"
            src="https://w.soundcloud.com/player/?url=${encodeURIComponent(href)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
          ></iframe>
        `;
        link.parentNode?.replaceChild(iframe, link);
        return;
      }

      // CodePen embed
      const codepenMatch = href.match(/codepen\.io\/([^\/]+)\/pen\/([^\/]+)/);
      if (codepenMatch) {
        const [, user, penId] = codepenMatch;
        const iframe = document.createElement('div');
        iframe.className = 'relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl my-8';
        iframe.innerHTML = `
          <iframe
            src="https://codepen.io/${user}/embed/${penId}?default-tab=result"
            class="absolute inset-0 w-full h-full"
            frameborder="0"
            allowfullscreen
          ></iframe>
        `;
        link.parentNode?.replaceChild(iframe, link);
        return;
      }
    });

    // Process images for lightbox
    const images = container.querySelectorAll('img');
    images.forEach((img) => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => {
        if (onMediaClick) {
          onMediaClick(img.src, 'image');
        }
      });
    });

    // Process video tags
    const videos = container.querySelectorAll('video');
    videos.forEach((video) => {
      video.controls = true;
      video.className = 'w-full rounded-xl shadow-2xl my-8';
      video.addEventListener('click', () => {
        if (onMediaClick && video.src) {
          onMediaClick(video.src, 'video');
        }
      });
    });

    // Process audio tags
    const audios = container.querySelectorAll('audio');
    audios.forEach((audio) => {
      audio.controls = true;
      audio.className = 'w-full rounded-xl shadow-lg my-8';
    });

  }, [content, onMediaClick]);

  return (
    <div
      ref={contentRef}
      className="prose prose-xl dark:prose-invert max-w-none
        prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-20
        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border/30
        prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
        prose-p:text-lg prose-p:leading-relaxed prose-p:text-foreground/90 prose-p:mb-6 prose-p:text-justify prose-p:hyphens-auto
        prose-a:text-primary prose-a:font-medium prose-a:no-underline prose-a:border-b-2 prose-a:border-primary/30 hover:prose-a:border-primary prose-a:transition-colors
        prose-strong:text-foreground prose-strong:font-semibold
        prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
        prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:shadow-inner
        prose-img:rounded-2xl prose-img:shadow-2xl prose-img:my-8
        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:font-normal
        prose-ul:my-6 prose-li:my-2 prose-li:text-foreground/90 prose-li:text-justify
        first-letter:text-7xl first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:leading-[0.8]"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
