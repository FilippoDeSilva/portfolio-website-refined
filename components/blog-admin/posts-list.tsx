"use client";

import Link from "next/link";
import { BlogCard } from "@/components/blog-card";
import { Pagination } from "@/components/ui/pagination";

interface PostsListProps {
  posts: any[];
  postsLoading: boolean;
  currentPage: number;
  postsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (post: any) => void;
  onDelete: (postId: string) => void;
}

export function PostsList({
  posts,
  postsLoading,
  currentPage,
  postsPerPage,
  onPageChange,
  onEdit,
  onDelete,
}: PostsListProps) {
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  return (
    <div className="relative flex flex-col h-full pb-16">
      {postsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
          {[...Array(postsPerPage)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl border border-border bg-gradient-to-br from-background to-muted/40 shadow-lg flex flex-col p-0 overflow-hidden"
              style={{ minHeight: 400 }}
            >
              <div className="h-[44%] w-full bg-muted/60" />
              <div className="p-6 flex flex-col flex-1">
                <div className="h-7 w-2/3 bg-muted/50 rounded mb-3" />
                <div className="h-4 w-full bg-muted/40 rounded mb-1" />
                <div className="h-4 w-full bg-muted/40 rounded mb-1" />
                <div className="h-4 w-3/4 bg-muted/40 rounded mb-4" />
                <div className="flex-1" />
                <div className="flex justify-end">
                  <div className="h-4 w-1/3 bg-muted/30 rounded mt-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-sm">No posts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
          {paginatedPosts.map((post) => (
            <Link
              href={`/blog/${post.id}`}
              key={post.id}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <BlogCard
                post={post}
                previewOnly={true}
                onEdit={() => onEdit(post)}
                onDelete={() => onDelete(post.id)}
              />
            </Link>
          ))}
        </div>
      )}
      
      {/* Fixed Pagination at Bottom */}
      {!postsLoading && posts.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
