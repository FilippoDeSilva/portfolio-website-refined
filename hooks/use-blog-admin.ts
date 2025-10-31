import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { blogCache } from "@/lib/blog-cache";

const ADMIN_CACHE_KEY = "blog-admin-posts";

export function useBlogAdmin() {
  // Check if we have cached data
  const hasCachedData = blogCache.has(ADMIN_CACHE_KEY);
  
  // Initialize with cached data if available
  const [posts, setPosts] = useState<any[]>(() => {
    const cachedPosts = blogCache.get<any[]>(ADMIN_CACHE_KEY);
    return cachedPosts || [];
  });
  
  const [postsLoading, setPostsLoading] = useState(() => {
    return !hasCachedData; // Only show loading if no cache
  });
  
  // If we have cached data, mark as initialized immediately
  const [postsInitialized, setPostsInitialized] = useState(hasCachedData);
  const [currentPage, setCurrentPage] = useState(1);

  async function fetchPosts(forceRefresh = false) {
    // If force refresh, invalidate all caches
    if (forceRefresh) {
      blogCache.invalidateAll();
    }
    
    // Check cache first
    const { data: cachedPosts, isStale } = blogCache.getStale<any[]>(ADMIN_CACHE_KEY);
    
    if (cachedPosts && !isStale && !forceRefresh) {
      // Use fresh cached data
      setPosts(cachedPosts);
      setPostsLoading(false);
      return;
    }
    
    // Show cached data immediately if available (even if stale)
    if (cachedPosts && !forceRefresh) {
      setPosts(cachedPosts);
      setPostsLoading(false);
    } else {
      setPostsLoading(true);
    }
    
    // Fetch fresh data
    const { data, error } = await supabase
      .from("blogposts")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (!error && data) {
      // Cache the result (5 minutes TTL)
      blogCache.set(ADMIN_CACHE_KEY, data, 5 * 60 * 1000);
      setPosts(data);
    }
    setPostsLoading(false);
  }

  return {
    posts,
    setPosts,
    postsLoading,
    postsInitialized,
    setPostsInitialized,
    currentPage,
    setCurrentPage,
    fetchPosts,
  };
}
