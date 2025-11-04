"use client";

import { useEffect, useState, Suspense } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabaseClient";
import { BlogPost } from "@/components/blog/blog-card";
import BlogComments from "@/components/blog/blog-comments";
import { BlogReactions } from "@/components/blog/blog-reactions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BlogList } from "@/components/blog";
import Image from "next/image";
import ImageViewer from "@/components/ui/image-viewer";
import NativeVideoPlayer from "@/components/ui/native-video-player";
import NativeAudioPlayer from "@/components/ui/native-audio-player";
import { BlogContentProcessor } from "@/components/blog";
import { AttachmentGalleryModal } from "@/components/media";
import { CustomAudioPlayer } from "@/components/media";
import { CustomVideoPlayer } from "@/components/media";
import { LinkPreviewCard } from "@/components/media";
import { blogCache, getPostCacheKey } from "@/lib/blog-cache";
import { Share2, Check } from "lucide-react";

interface BlogPostContentProps {
  postId: string;
}

function BlogPostSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Skeleton - Matches actual hero layout */}
      <div className="relative w-full h-[60vh] sm:h-[75vh] md:h-[85vh] overflow-hidden bg-muted animate-pulse">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
        
        {/* Hero Content Skeleton */}
        <div className="absolute inset-0 z-20 flex items-end">
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12">
            <div className="space-y-4">
              {/* Category Badge Skeleton */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <div className="w-16 h-4 bg-white/20 rounded" />
              </div>
              
              {/* Title Skeleton */}
              <div className="space-y-3">
                <div className="h-8 sm:h-10 md:h-12 bg-white/20 rounded-lg w-full max-w-2xl" />
                <div className="h-8 sm:h-10 md:h-12 bg-white/20 rounded-lg w-3/4 max-w-xl" />
              </div>
              
              {/* Meta Skeleton */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-4 bg-white/20 rounded w-32" />
                <div className="w-1 h-1 rounded-full bg-white/50" />
                <div className="h-4 bg-white/20 rounded w-24" />
                <div className="w-1 h-1 rounded-full bg-white/50" />
                <div className="h-4 bg-white/20 rounded w-28" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content Skeleton */}
      <article className="relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Content Lines */}
          <div className="space-y-4 mb-12 animate-pulse">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-11/12" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-10/12" />
            <div className="h-6 bg-muted rounded w-0 mt-8" /> {/* Spacer */}
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-9/12" />
          </div>
          
          {/* Engagement Section Skeleton */}
          <div className="mt-20 pt-12 border-t-2 border-border/30 animate-pulse">
            <div className="flex justify-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-full" />
              <div className="w-16 h-16 bg-muted rounded-full" />
              <div className="w-16 h-16 bg-muted rounded-full" />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export function BlogPostContent({ postId }: BlogPostContentProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Initialize with cached data if available
  const [post, setPost] = useState<BlogPost | null>(() => {
    const cacheKey = getPostCacheKey(postId);
    const cachedPost = blogCache.get<BlogPost>(cacheKey);
    return cachedPost;
  });
  
  const [loading, setLoading] = useState(() => {
    const cacheKey = getPostCacheKey(postId);
    return !blogCache.has(cacheKey); // Only show loading if no cache
  });
  
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{
    open: boolean;
    src: string;
    name?: string;
  } | null>(null);
  const [playing, setPlaying] = useState<{ src: string; name?: string } | null>(null);
  const [isPIPActive, setIsPIPActive] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [expandedAttachments, setExpandedAttachments] = useState<Set<number>>(new Set());
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [audioThumbnails, setAudioThumbnails] = useState<Record<number, string>>({});
  const [shareSuccess, setShareSuccess] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: post?.title || 'Blog Post',
      text: `Check out this article: ${post?.title}`,
      url: window.location.href,
    };

    try {
      // Check if native share is available (mobile devices)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (error) {
      // If share is cancelled or fails, try clipboard
      if (error instanceof Error && error.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 2000);
        } catch (clipboardError) {
          console.error('Failed to copy link:', clipboardError);
        }
      }
    }
  };

  // Fetch audio thumbnails
  useEffect(() => {
    if (!post?.attachments) return;

    const fetchAudioThumbnails = async () => {
      if (!post.attachments) return;
      
      const audioAttachments = post.attachments.filter((att: any) => att.type?.includes('audio'));
      
      for (let i = 0; i < post.attachments.length; i++) {
        const att = post.attachments[i];
        if (att.type?.includes('audio')) {
          try {
            const response = await fetch('/api/extract-music-thumbnail', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioUrl: att.url,
                audioName: att.name
              })
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.thumbnail?.url) {
                setAudioThumbnails(prev => ({
                  ...prev,
                  [i]: data.thumbnail.url
                }));
              }
            }
          } catch (error) {
            console.log('No thumbnail for audio:', att.name);
          }
        }
      }
    };

    fetchAudioThumbnails();
  }, [post]);

  useEffect(() => {
    async function fetchPost() {
      const cacheKey = getPostCacheKey(postId);
      
      // Check cache first (stale-while-revalidate)
      const { data: cachedPost, isStale } = blogCache.getStale<BlogPost>(cacheKey);
      
      if (cachedPost && !isStale) {
        // Use fresh cached data
        setPost(cachedPost);
        const text = cachedPost.content?.replace(/<[^>]*>/g, "") || "";
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        setReadingTime(Math.ceil(wordCount / 200));
        setLoading(false);
        return;
      }
      
      // Show cached data immediately if available (even if stale)
      if (cachedPost) {
        setPost(cachedPost);
        const text = cachedPost.content?.replace(/<[^>]*>/g, "") || "";
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        setReadingTime(Math.ceil(wordCount / 200));
        setLoading(false);
      }
      
      // Fetch fresh data
      const { data, error } = await supabase
        .from("blogposts")
        .select(
          "id, title, content, cover_image, media_url, media_type, created_at, likes, love, laugh, attachments, view_count"
        )
        .eq("id", postId)
        .single();
        
      if (error) {
        setError(error.message);
        if (!cachedPost) {
          setPost(null);
        }
      } else if (data) {
        const blogPost = data as BlogPost;
        
        // Cache the result (5 minutes TTL)
        blogCache.set(cacheKey, blogPost, 5 * 60 * 1000);
        
        setPost(blogPost);
        // Calculate reading time (average 200 words per minute)
        const text = blogPost.content?.replace(/<[^>]*>/g, "") || "";
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        const minutes = Math.ceil(wordCount / 200);
        setReadingTime(minutes);
      }
      setLoading(false);
    }
    if (postId) fetchPost();
  }, [postId]);

  // Increment view count
  useEffect(() => {
    if (!post?.id) return;
    supabase.rpc("increment_view_count", { post_id: post.id }).then(() => {
      supabase
        .from("blogposts")
        .select("view_count")
        .eq("id", post.id)
        .single()
        .then(({ data }: { data: { view_count: number } | null }) => {
          if (data && typeof data.view_count === "number") {
            setPost((prev) =>
              prev ? { ...prev, view_count: data.view_count } : prev
            );
          }
        });
    });
  }, [post?.id]);

  if (loading) return <BlogPostSkeleton />;
  
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The blog post you're looking for doesn't exist.
          </p>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Image Viewer Modal */}
      {lightbox && (
        <ImageViewer
          src={lightbox.src}
          alt={lightbox.name || "Image"}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* Video Player Modal */}
      {playing && !isPIPActive && (
        <NativeVideoPlayer
          src={playing.src}
          name={playing.name || "Video"}
          onClose={() => setPlaying(null)}
          onPIPChange={setIsPIPActive}
        />
      )}

      {/* Audio Player Modal */}
      {playing && playing.src.match(/\.(mp3|wav|ogg|m4a)$/i) && (
        <NativeAudioPlayer
          src={playing.src}
          name={playing.name || "Audio"}
          onClose={() => setPlaying(null)}
        />
      )}

      {/* Image Gallery Modal */}
      {post && post.attachments && (
        <AttachmentGalleryModal
          attachments={post.attachments}
          initialIndex={galleryIndex}
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      <div className="min-h-screen bg-background pt-16">
        {/* Floating Share Button - Fixed position for easy access */}
        <button
          onClick={handleShare}
          className="fixed bottom-5 right-5 z-50 group"
          aria-label="Share this post"
        >
          <div className="relative">
            {/* Main button */}
            <div className={`
              w-11 h-11 rounded-full flex items-center justify-center
              shadow-md hover:shadow-xl
              transition-all duration-500 ease-out
              transform hover:scale-110 active:scale-90
              ${shareSuccess 
                ? 'bg-gradient-to-br from-green-400 to-green-600 rotate-[360deg]' 
                : 'bg-gradient-to-br from-primary to-primary/80 hover:rotate-12'
              }
            `}>
              {shareSuccess ? (
                <Check 
                  className="w-5 h-5 text-white animate-in zoom-in-50 duration-300" 
                  strokeWidth={2.5}
                />
              ) : (
                <Share2 
                  className="w-5 h-5 text-white transition-transform duration-300 group-hover:translate-y-[-2px]" 
                  strokeWidth={2}
                />
              )}
            </div>
            
            {/* Pulse ring effect on success */}
            {shareSuccess && (
              <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping" />
            )}
            
            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          </div>
        </button>
        {/* Hero Section with Cover Image */}
        {post.cover_image && (
          <>
            {/* Cover Image - Full width with overlay */}
            <div className="relative w-full h-[60vh] sm:h-[75vh] md:h-[85vh] overflow-hidden">
              {/* Sophisticated multi-layer gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-10" />
              
              {/* Light mode cotton-like soft shade effect below cover - Desktop only */}
              {mounted && theme === 'light' && (
                <>
                  <div className="hidden sm:block absolute -bottom-10 left-0 right-0 h-48 bg-gradient-to-b from-background/0 via-background/70 to-background z-20" />
                  <div className="hidden sm:block absolute -bottom-24 left-0 right-0 h-40 bg-gradient-to-b from-background/0 via-background/50 to-background/95 z-20" />
                  <div className="hidden sm:block absolute -bottom-16 left-0 right-0 h-32 bg-gradient-to-b from-background/0 via-background/80 to-background z-20" />
                </>
              )}
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                className="object-cover object-center"
                priority
              />
              {/* Hero Content Overlay - All screens */}
              <div className="absolute inset-0 z-20 flex items-end">
                <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12">
                  <div className="space-y-4">
                    {/* Category Badge */}
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white text-xs sm:text-sm font-semibold shadow-lg">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Article
                    </div>
                    {/* Title */}
                    <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.2] tracking-tight drop-shadow-2xl">
                      {post.title}
                    </h1>
                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
                      <time className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium shadow-lg">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="whitespace-nowrap">
                          {new Date(post.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </time>
                      <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium shadow-lg whitespace-nowrap">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{readingTime} min</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium shadow-lg whitespace-nowrap">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{post.view_count?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Title Section - Below cover image */}
            <div className="sm:hidden bg-background px-3 xs:px-4 pt-6 pb-6 border-b border-border/30 relative z-30">
              <div className="space-y-3 xs:space-y-4">
                {/* Category Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] xs:text-xs font-semibold">
                  <svg className="w-3 xs:w-3.5 h-3 xs:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Article
                </div>
                {/* Title */}
                <h1 className="text-xl xs:text-2xl font-bold text-foreground leading-[1.2] xs:leading-tight tracking-tight break-words pb-2">
                  {post.title}
                </h1>
                {/* Meta */}
                <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 pt-2">
                  <time className="flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[10px] xs:text-xs font-medium whitespace-nowrap">
                    <svg className="w-3 xs:w-3.5 h-3 xs:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </time>
                  <div className="flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[10px] xs:text-xs font-medium whitespace-nowrap">
                    <svg className="w-3 xs:w-3.5 h-3 xs:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{readingTime} min</span>
                  </div>
                  <div className="flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[10px] xs:text-xs font-medium whitespace-nowrap">
                    <svg className="w-3 xs:w-3.5 h-3 xs:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{post.view_count?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Article Content */}
        <article className="relative">
          {/* Content Container */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            {/* Drop Cap & Content with Auto-Embedding */}
            <BlogContentProcessor 
              content={post?.content || ""} 
              onMediaClick={(src, type) => {
                if (type === 'image') {
                  setLightbox({ open: true, src, name: 'Image' });
                } else if (type === 'video') {
                  setPlaying({ src, name: 'Video' });
                }
              }}
            />

            {/* Attachments */}
            {post.attachments && post.attachments.length > 0 && (
              <div className="mt-16 pt-12 border-t border-border/30">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
                    <div className="w-1 h-6 sm:h-8 bg-primary rounded-full" />
                    <span className="hidden sm:inline">Resources & Attachments</span>
                    <span className="sm:hidden">Resources</span>
                  </h2>
                  <span className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-muted/50">
                    {post.attachments.length} <span className="hidden xs:inline">{post.attachments.length === 1 ? 'file' : 'files'}</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {post.attachments.map((att: any, idx: number) => {
                    const isExpanded = expandedAttachments.has(idx);
                    
                    const toggleExpanded = () => {
                      setExpandedAttachments(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(idx)) {
                          newSet.delete(idx);
                        } else {
                          newSet.add(idx);
                        }
                        return newSet;
                      });
                    };

                    const getFileExtension = (name: string) => {
                      const ext = name.split('.').pop()?.toUpperCase();
                      return ext || 'FILE';
                    };

                    const isVideo = att.type?.includes('video');
                    const isAudio = att.type?.includes('audio');
                    const isImage = att.type?.includes('image');
                    const isUrl = att.type?.includes('html') || att.url?.startsWith('http') && !isVideo && !isAudio && !isImage;

                    // For URLs, render LinkPreviewCard directly without wrapper
                    if (isUrl) {
                      return <LinkPreviewCard key={idx} url={att.url} name={att.name} />;
                    }

                    return (
                      <div
                        key={idx}
                        className="group relative rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-200 overflow-hidden bg-card"
                      >
                        {/* Thumbnail/Preview - Only for Images and Audio */}
                        {(isImage || isAudio) && (
                          <div className="relative aspect-video bg-gradient-to-br from-muted/50 to-muted/30 overflow-hidden cursor-pointer"
                            onClick={() => {
                              if (isImage) {
                                const imageAttachments = post?.attachments?.filter((a: any) => a.type?.includes('image'));
                                const imageIndex = imageAttachments?.findIndex((a: any) => a.url === att.url);
                                setGalleryIndex(imageIndex || 0);
                                setGalleryOpen(true);
                              }
                            }}
                          >
                            {isImage ? (
                              <>
                                <Image
                                  src={att.url}
                                  alt={att.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {/* Small Download Button Overlay */}
                                <a
                                  href={att.url}
                                  download={att.name}
                                  className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/10 transition-all z-10"
                                  title="Download image"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </a>
                              </>
                            ) : isVideo ? (
                              <>
                                <video
                                  src={att.url}
                                  className="w-full h-full object-cover"
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </div>
                                </div>
                              </>
                            ) : isAudio ? (
                              audioThumbnails[idx] ? (
                                // Show extracted album art
                                <Image
                                  src={audioThumbnails[idx]}
                                  alt={att.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                // Fallback to custom waveform thumbnail
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-primary/20 flex items-center justify-center overflow-hidden">
                                  {/* Animated Waveform Background */}
                                  <div className="absolute inset-0 flex items-center justify-center gap-1 px-8 opacity-30">
                                    {[...Array(32)].map((_, i) => (
                                      <div
                                        key={i}
                                        className="flex-1 bg-gradient-to-t from-primary to-purple-500 rounded-full animate-pulse"
                                        style={{
                                          height: `${Math.random() * 60 + 20}%`,
                                          animationDelay: `${i * 0.1}s`,
                                          animationDuration: `${Math.random() * 1 + 1}s`
                                        }}
                                      />
                                    ))}
                                  </div>
                                  {/* Center Icon */}
                                  <div className="relative z-10 text-center">
                                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 backdrop-blur-sm flex items-center justify-center border-2 border-white/20 shadow-2xl">
                                      <svg className="w-12 h-12 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                      </svg>
                                    </div>
                                    <p className="text-xs sm:text-sm font-semibold text-white drop-shadow-md">Audio Track</p>
                                  </div>
                                </div>
                              )
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                                <svg className="w-16 h-16 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            
                            {/* Extension Badge - Hidden on small screens for audio */}
                            <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 ${
                              isAudio ? 'hidden sm:block' : ''
                            }`}>
                              <span className="text-xs font-bold text-white">{getFileExtension(att.name)}</span>
                            </div>
                          </div>
                        )}

                        {/* File Info */}
                        <div className="p-3 sm:p-4">
                            <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm sm:text-base truncate group-hover:text-primary transition-colors mb-1">
                                  {att.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">{att.type || 'Unknown type'}</p>
                              </div>
                              <div className="flex-shrink-0">
                                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-primary/10 text-primary text-[10px] sm:text-xs font-bold">
                                  {getFileExtension(att.name)}
                                </span>
                              </div>
                            </div>

                            {/* Player for Video and Audio */}
                            {isVideo ? (
                              <CustomVideoPlayer
                                src={att.url}
                                title={att.name}
                                fileName={att.name}
                              />
                            ) : isAudio ? (
                              <CustomAudioPlayer
                                src={att.url}
                                title={att.name}
                                artist="Unknown Artist"
                                fileName={att.name}
                              />
                            ) : !isImage && (
                              <button
                                onClick={() => window.open(att.url, "_blank")}
                                className="w-full px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-all font-medium text-sm flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Open File
                              </button>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Engagement Section */}
            <div className="mt-20 pt-12 border-t-2 border-border/30">
              <BlogReactions 
              postId={post.id}
              initialReactions={{
                likes: post.likes || 0,
                love: post.love || 0,
                laugh: post.laugh || 0,
                fire: 0,
                wow: 0,
                coffee: 0
              }}
              viewCount={post.view_count || 0}
              />
            </div>

            {/* Comments */}
            <div className="mt-16 pt-12 border-t border-border/30">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <div className="w-1 h-10 bg-primary rounded-full" />
                Discussion
              </h2>
              <BlogComments postId={post.id} />
            </div>
          </div>
        </article>

        {/* Related Posts */}
        <section className="bg-muted/30 border-y border-border/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-16">
              {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                More to Explore
              </div> */}
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                More Blog Posts
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover more insights, stories, and ideas that matter
              </p>
            </div>
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-4">
                    <div className="h-48 bg-background rounded-2xl animate-pulse" />
                    <div className="h-4 bg-background rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-background rounded animate-pulse w-1/2" />
                  </div>
                ))}
              </div>
            }>
              <BlogList 
                excludeId={post.id}
                columns={3}
                postsPerPage={3}
                showControls={false}
              />
            </Suspense>
          </div>
        </section>
      </div>
    </>
  );
}
