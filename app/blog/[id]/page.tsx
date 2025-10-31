import { Suspense, use, cache } from "react";
import { BlogPostContent } from "@/components/blog-post-content";
import { supabase } from "@/lib/supabaseClient";
import type { Metadata } from "next";
import { unstable_cacheLife as cacheLife } from "next/cache";

// PPR is enabled globally via cacheComponents in next.config.mjs
// Using Next.js 16's new caching with cacheLife

// Cache the post fetch with 60-second revalidation
const getPost = cache(async (id: string) => {
  "use cache";
  cacheLife("minutes");
  
  const { data: post } = await supabase
    .from("blogposts")
    .select("*")
    .eq("id", id)
    .single();
  
  return post;
});

// Generate static params - Pre-render top posts at build time
export async function generateStaticParams() {
  try {
    // Fetch the most recent 20 posts to pre-render at build time
    const { data: posts } = await supabase
      .from("blogposts")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!posts) return [];

    return posts.map((post) => ({
      id: post.id,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
      return {
        title: "Blog Post Not Found | Filippo De Silva",
        description: "The requested blog post could not be found.",
      };
    }

    // Extract plain text from HTML content for description
    const plainText = post.content
      ?.replace(/<[^>]*>/g, "")
      ?.replace(/\s+/g, " ")
      ?.trim()
      ?.substring(0, 160) || "Read this blog post by Filippo De Silva";

    const description = plainText.length >= 160 ? `${plainText}...` : plainText;

    return {
      title: `${post.title} | Filippo De Silva`,
      description,
      authors: [{ name: "Filippo De Silva" }],
      creator: "Filippo De Silva",
      publisher: "Filippo De Silva",
      keywords: [
        "Filippo De Silva",
        "Blog",
        "Web Development",
        "Fullstack Developer",
        post.title,
      ],
      openGraph: {
        title: post.title,
        description,
        type: "article",
        publishedTime: post.created_at,
        authors: ["Filippo De Silva"],
        images: post.cover_image
          ? [
              {
                url: post.cover_image,
                width: 1200,
                height: 630,
                alt: post.title,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
        images: post.cover_image ? [post.cover_image] : [],
        creator: "@filippodesilva",
      },
      alternates: {
        canonical: `https://filippodesilva.vercel.app/blog/${id}`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Blog Post | Filippo De Silva",
      description: "Read this blog post by Filippo De Silva",
    };
  }
}

function BlogPostSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground animate-pulse">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full h-96 bg-muted rounded-xl mb-8" />
        <div className="h-12 bg-muted rounded-lg mb-4 w-3/4" />
        <div className="flex gap-4 mb-8">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-4 bg-muted rounded w-24" />
        </div>
        <div className="space-y-3 mb-8">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  
  return (
    <Suspense fallback={<BlogPostSkeleton />}>
      <BlogPostContent postId={id} />
    </Suspense>
  );
}
