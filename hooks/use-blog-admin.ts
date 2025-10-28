import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useBlogAdmin() {
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsInitialized, setPostsInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  async function fetchPosts() {
    setPostsLoading(true);
    const { data, error } = await supabase
      .from("blogposts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setPosts(data);
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
