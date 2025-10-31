"use client";

import { Suspense } from "react";
import { PostsList } from "./posts-list";

interface PostsListWrapperProps {
  posts: any[];
  postsLoading: boolean;
  currentPage: number;
  postsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (post: any) => void;
  onDelete: (postId: string) => void;
}

function PostsListSkeleton({ postsPerPage }: { postsPerPage: number }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-4">All Posts</h2>
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
    </div>
  );
}

export function PostsListWrapper(props: PostsListWrapperProps) {
  if (props.postsLoading) {
    return <PostsListSkeleton postsPerPage={props.postsPerPage} />;
  }

  return (
    <Suspense fallback={<PostsListSkeleton postsPerPage={props.postsPerPage} />}>
      <PostsList {...props} />
    </Suspense>
  );
}
