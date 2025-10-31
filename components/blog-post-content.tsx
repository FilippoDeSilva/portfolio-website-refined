"use client";

import { useEffect, useState, Suspense } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabaseClient";
import { BlogPost } from "@/components/blog-card";
import BlogComments from "@/components/blog-comments";
import { BlogReactions } from "@/components/blog-reactions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BlogList } from "@/components/blog-list";
import Image from "next/image";
import ImageViewer from "@/components/ui/image-viewer";
import NativeVideoPlayer from "@/components/ui/native-video-player";
import NativeAudioPlayer from "@/components/ui/native-audio-player";
import { BlogContentProcessor } from "@/components/blog-content-processor";
import { AttachmentGalleryModal } from "@/components/attachment-gallery-modal";
import { CustomAudioPlayer } from "@/components/custom-audio-player";
import { CustomVideoPlayer } from "@/components/custom-video-player";
import { LinkPreviewCard } from "@/components/link-preview-card";

interface BlogPostContentProps {
  postId: string;
}

function BlogPostSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground animate-pulse">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cover Image Skeleton */}
        <div className="w-full h-96 bg-muted rounded-xl mb-8" />
        
        {/* Title Skeleton */}
        <div className="h-12 bg-muted rounded-lg mb-4 w-3/4" />
        
        {/* Meta Skeleton */}
        <div className="flex gap-4 mb-8">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-4 bg-muted rounded w-24" />
        </div>
        
        {/* Content Skeleton */}
        <div className="space-y-3 mb-8">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}

export function BlogPostContent({ postId }: BlogPostContentProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
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

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch audio thumbnails
  useEffect(() => {
    if (!post?.attachments) return;

    const fetchAudioThumbnails = async () => {
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
      const { data, error } = await supabase
        .from("blogposts")
        .select(
          "id, title, content, cover_image, media_url, media_type, created_at, likes, love, laugh, attachments, view_count"
        )
        .eq("id", postId)
        .single();
      if (error) {
        setError(error.message);
        setPost(null);
      } else if (data) {
        setPost(data as BlogPost);
        // Calculate reading time (average 200 words per minute)
        const text = data.content?.replace(/<[^>]*>/g, "") || "";
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
        .then(({ data }) => {
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

      <div className="min-h-screen bg-background">
        {/* Elegant Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/blog" className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All Posts
              </Link>
              
              {/* Theme Selector */}
              {mounted && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTheme("light")}
                    className={`p-2 rounded-lg transition-all ${
                      theme === "light"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    aria-label="Light theme"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-2 rounded-lg transition-all ${
                      theme === "dark"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    aria-label="Dark theme"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`p-2 rounded-lg transition-all ${
                      theme === "system"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    aria-label="System theme"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section with Cover Image */}
        {post.cover_image && (
          <div className="relative w-full h-[75vh] md:h-[85vh] overflow-hidden">
            {/* Sophisticated multi-layer gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-transparent z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-contain lg:object-cover"
              priority
            />
            {/* Hero Content Overlay */}
            <div className="absolute inset-0 z-20 flex items-end">
              <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12">
                <div className="space-y-4">
                  {/* Category Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Article
                  </div>
                  {/* Title */}
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.2] tracking-tight drop-shadow-2xl">
                    {post.title}
                  </h1>
                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                    <time className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <span className="w-1 h-1 rounded-full bg-white/50" />
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{readingTime} min read</span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-white/50" />
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{post.view_count?.toLocaleString() || 0} views</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <article className="relative">
          {/* Content Container */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            {/* Drop Cap & Content with Auto-Embedding */}
            <BlogContentProcessor 
              content={post.content} 
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-1 h-8 bg-primary rounded-full" />
                    Resources & Attachments
                  </h2>
                  <span className="text-sm text-muted-foreground px-3 py-1 rounded-full bg-muted/50">
                    {post.attachments.length} {post.attachments.length === 1 ? 'file' : 'files'}
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
                                const imageAttachments = post.attachments.filter((a: any) => a.type?.includes('image'));
                                const imageIndex = imageAttachments.findIndex((a: any) => a.url === att.url);
                                setGalleryIndex(imageIndex);
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
                                    <p className="text-sm font-semibold text-white drop-shadow-md">Audio Track</p>
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
                            
                            {/* Extension Badge */}
                            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
                              <span className="text-xs font-bold text-white">{getFileExtension(att.name)}</span>
                            </div>
                          </div>
                        )}

                        {/* File Info or Link Preview */}
                        {isUrl ? (
                          <LinkPreviewCard url={att.url} name={att.name} />
                        ) : (
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors mb-1">
                                  {att.name}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">{att.type || 'Unknown type'}</p>
                              </div>
                              <div className="flex-shrink-0">
                                <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold">
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
                        )}
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
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                More to Explore
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Continue Your Journey
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
