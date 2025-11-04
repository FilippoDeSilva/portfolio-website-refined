"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { TitleBar } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";
import AIChatModal from "@/components/ui/ai-chat-modal";
import { Footer } from "@/components/layout";
import { BlogUploadService } from "@/services/blog-upload.service";
import { useUserLocationInfo } from "@/components/shared";
import {
  LoginForm,
  PostEditor,
  PostsList,
  DeleteModal,
  MediaLightbox,
} from "@/components/blog/blog-admin";
import {
  useAuth,
  useBlogAdmin,
  useBlogEditor,
  useBlogForm,
  useMediaLightbox,
} from "@/hooks";
import type { AdvancedEditorRef } from "@/components/blog/blog-admin/advanced-editor";


export default function BlogAdmin() {
  // Editor ref for AI insertion
  const editorRef = useRef<AdvancedEditorRef | null>(null);
  
  // Custom hooks
  const { user, authLoading, loginLoading, loginError, setLoginError, handleLogin, handleLogout } = useAuth();
  const userInfo = useUserLocationInfo();
  const { posts, setPosts, postsLoading, postsInitialized, setPostsInitialized, currentPage, setCurrentPage, fetchPosts } = useBlogAdmin();
  const { content, setContent, editingId, setEditingId } = useBlogEditor();
  const {
    form,
    setForm,
    coverImageUrlInput,
    setCoverImageUrlInput,
    coverImageFile,
    setCoverImageFile,
    attachmentUrlInput,
    setAttachmentUrlInput,
    coverUploadStatus,
    setCoverUploadStatus,
    attachmentUploadStatus,
    setAttachmentUploadStatus,
    resetForm,
  } = useBlogForm();

  // Local state
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    postId: string | null;
  }>({ open: false, postId: null });
  const [deleting, setDeleting] = useState(false);
  const [aiModalOpen, setAIModalOpen] = useState(false);
  const { lightbox, setLightbox, isPIPActive, setIsPIPActive } = useMediaLightbox(deleteModal.open, aiModalOpen);

  const POSTS_PER_PAGE = 6;

  // Fetch posts when user logs in
  useEffect(() => {
    if (user && !postsInitialized) {
      // Only fetch if we don't have cached data
      if (posts.length === 0) {
        fetchPosts();
      }
      setPostsInitialized(true);
    } else if (!user && postsInitialized) {
      setPosts([]);
      setPostsInitialized(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, postsInitialized]);

  // Handle escape key to logout
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && user && !deleteModal.open && !aiModalOpen) {
        handleLogout();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [user, deleteModal.open, aiModalOpen, handleLogout]);

  // --- Upload Handlers ---
  async function handleCoverImageUpload(file: File) {
    const url = await BlogUploadService.uploadCoverImage(
      file,
      form.cover_image,
      setCoverUploadStatus
    );
    if (url) {
      setForm((f) => ({ ...f, cover_image: url }));
      setCoverImageFile(null);
    }
  }

  async function handleAttachmentFiles(files: FileList | null) {
    const uploaded = await BlogUploadService.uploadAttachments(
      files,
      setAttachmentUploadStatus
    );
    if (uploaded.length > 0) {
      setForm((f) => ({
        ...f,
        attachments: [...(f.attachments || []), ...uploaded],
      }));
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (coverImageFile) await handleCoverImageUpload(coverImageFile);
    if (coverImageUrlInput)
      setForm((f) => ({ ...f, cover_image: coverImageUrlInput }));

    const postData = {
      ...form,
      content: content || "",
      created_at: new Date().toISOString(),
    };

    if (editingId) {
      await supabase.from("blogposts").update(postData).eq("id", editingId);
      setEditingId(null);
    } else {
      await supabase.from("blogposts").insert([postData]);
    }

    resetForm();
    setContent("");
    fetchPosts(true); // Force refresh to invalidate all caches
  }

  async function handleEdit(post: any) {
    // Batch state updates to prevent race conditions
    const postContent = post.content || "";
    const postId = post.id;
    
    // Set content and editing ID first
    setEditingId(postId);
    setContent(postContent);
    
    // Then set form data
    setForm({
      title: post.title || "",
      cover_image: post.cover_image || "",
      media_url: post.media_url || undefined,
      media_type: post.media_type || undefined,
      attachments: post.attachments || [],
    });
  }

  // Calculate paginated posts
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  function handlePreviewAttachment(att: any) {
    if (att?.type?.startsWith?.("image")) {
      setLightbox({
        open: true,
        src: att.url,
        name: att.name,
        type: "image",
      });
    } else if (att?.type?.startsWith?.("video")) {
      setLightbox({
        open: true,
        src: att.url,
        name: att.name,
        type: "video",
      });
    } else if (att?.type?.startsWith?.("audio")) {
      let thumb = att.thumbnail;
      if (!thumb) {
        const getBase = (s?: string) => {
          if (!s) return "";
          try {
            const u = new URL(
              s,
              s.startsWith("http") ? undefined : "http://local"
            );
            s = u.pathname;
          } catch {}
          const last = s.split("/").pop() || s;
          return (
            last.includes(".")
              ? last.substring(0, last.lastIndexOf("."))
              : last
          ).toLowerCase();
        };
        const base = getBase(att.name || att.url);
        const img = (form.attachments || []).find((x: any) => {
          const isImage = x?.type?.startsWith?.("image");
          const matchesBase = getBase(x.name || x.url) === base;
          return isImage && matchesBase;
        });
        thumb = img?.url;
      }
      setLightbox({
        open: true,
        src: att.url,
        name: att.name,
        type: "audio",
        thumb,
      });
    } else {
      window.open(att.url, "_blank");
    }
  }

  return (
    <>
      <MediaLightbox
        lightbox={lightbox}
        isPIPActive={isPIPActive}
        onClose={() => setLightbox(null)}
        onPIPChange={setIsPIPActive}
      />
      
      {/* Header */}
      <TitleBar 
        title=""
        onLogout={user ? handleLogout : undefined}
      >
        {user && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-primary/10 transition-colors"
            onClick={handleLogout}
            aria-label="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        )}
      </TitleBar>

      <div className="p-4 sm:p-6 lg:p-8 bg-background text-foreground min-h-screen">
      {authLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <svg
              className="animate-spin h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <p className="text-sm text-muted-foreground">
              Checking authentication...
            </p>
          </div>
        </div>
      ) : !user ? (
        <LoginForm
          onLogin={handleLogin}
          loginLoading={loginLoading}
          loginError={loginError}
          setLoginError={setLoginError}
          userName={userInfo?.name}
        />
      ) : (
        <div>
          <AIChatModal
            open={aiModalOpen}
            onClose={() => setAIModalOpen(false)}
            onInsert={(html) => {
              editorRef.current?.insertContent(html);
              setAIModalOpen(false);
            }}
          />
          {/* Responsive layout: editor first on mobile, posts second */}
          <div className="flex flex-col md:grid md:grid-cols-2 gap-6">
            {/* Post Editor - Modern Card */}
            <div className="order-1 md:order-none">
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden min-h-[1000px]">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border px-6 py-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {editingId ? "Edit Post" : "Create New Post"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {editingId ? "Update your blog post" : "Share your thoughts with the world"}
                  </p>
                </div>
                <div className="p-6">
                  <PostEditor
                form={form}
                setForm={setForm}
                content={content}
                setContent={setContent}
                editingId={editingId}
                coverImageUrlInput={coverImageUrlInput}
                setCoverImageUrlInput={setCoverImageUrlInput}
                coverUploadStatus={coverUploadStatus}
                attachmentUrlInput={attachmentUrlInput}
                setAttachmentUrlInput={setAttachmentUrlInput}
                attachmentUploadStatus={attachmentUploadStatus}
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (coverImageFile)
                    await handleCoverImageUpload(coverImageFile);
                  if (coverImageUrlInput)
                    setForm((f) => ({
                      ...f,
                      cover_image: coverImageUrlInput,
                    }));
                  handleSubmit(e);
                }}
                onCancel={() => {
                  setEditingId(null);
                  resetForm();
                  setContent("");
                }}
                onCoverImageUpload={handleCoverImageUpload}
                onAttachmentFiles={handleAttachmentFiles}
                onPreviewAttachment={handlePreviewAttachment}
                onOpenAI={() => setAIModalOpen(true)}
                editorRef={editorRef}
              />
                </div>
              </div>
            </div>
            
            {/* Posts List - Modern Card */}
            <div className="order-2 md:order-none">
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border px-6 py-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    All Posts
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage and preview your published content
                  </p>
                </div>
                <div className="p-6">
                  <PostsList
                posts={posts}
                postsLoading={postsLoading}
                currentPage={currentPage}
                postsPerPage={POSTS_PER_PAGE}
                onPageChange={setCurrentPage}
                onEdit={handleEdit}
                onDelete={(postId) =>
                  setDeleteModal({ open: true, postId })
                }
              />
                </div>
              </div>
            </div>
          </div>
          
          <DeleteModal
            isOpen={deleteModal.open}
            isDeleting={deleting}
            onConfirm={async () => {
              if (!deleteModal.postId) return;
              setDeleting(true);
              try {
                const { data: postToDelete } = await supabase
                  .from("blogposts")
                  .select("cover_image, attachments")
                  .eq("id", deleteModal.postId)
                  .single();
                if (postToDelete) {
                  await fetch("/api/admin/delete-blog-files", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      cover_image: postToDelete.cover_image,
                      attachments: postToDelete.attachments,
                    }),
                  });
                }
                await supabase
                  .from("blogposts")
                  .delete()
                  .eq("id", deleteModal.postId);
                fetchPosts(true); // Force refresh to invalidate all caches
              } catch (err) {
                console.error("Error during post deletion:", err);
              } finally {
                setDeleting(false);
                setDeleteModal({ open: false, postId: null });
              }
            }}
            onCancel={() => setDeleteModal({ open: false, postId: null })}
          />
        </div>
      )}
      
      {/* Footer with divider */}
      <div className="mt-auto pt-16 h-3">
          <Footer />
      </div>
    </div>
    </>
  );
}
