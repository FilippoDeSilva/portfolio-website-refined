"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TitleBar from "@/components/titlebar";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";
import AIChatModal from "@/components/ui/ai-chat-modal";
import { Footer } from "@/components/footer";
import { BlogUploadService } from "@/services/blog-upload.service";
import {
  LoginForm,
  PostEditor,
  PostsList,
  DeleteModal,
  MediaLightbox,
} from "@/components/blog-admin";
import {
  useAuth,
  useBlogAdmin,
  useBlogEditor,
  useBlogForm,
  useMediaLightbox,
} from "@/hooks";


export default function BlogAdmin() {
  // Custom hooks
  const { user, authLoading, loginLoading, loginError, setLoginError, handleLogin, handleLogout } = useAuth();
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

  const POSTS_PER_PAGE = 4;

  // Fetch posts when user logs in
  useEffect(() => {
    if (user && !postsInitialized) {
      fetchPosts();
      setPostsInitialized(true);
    } else if (!user) {
      setPosts([]);
      setPostsInitialized(false);
    }
  }, [user, postsInitialized, fetchPosts, setPostsInitialized, setPosts]);

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
    fetchPosts();
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
    <div className="p-4 sm:p-6 lg:p-8 bg-background text-foreground min-h-screen">
      <MediaLightbox
        lightbox={lightbox}
        isPIPActive={isPIPActive}
        onClose={() => setLightbox(null)}
        onPIPChange={setIsPIPActive}
      />
      <TitleBar title="Blog Admin">
        {user && (
          <Button
            variant="ghost"
            className="ml-4 p-2 rounded-full text-primary dark:text-primary-foreground hover:bg-primary/10 dark:hover:bg-primary/20 hover:scale-110 hover:opacity-80 transition-all duration-150"
            onClick={handleLogout}
            aria-label="Sign Out"
          >
            <LogOut className="w-6 h-6" />
          </Button>
        )}
      </TitleBar>
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
        />
      ) : (
        <div>
          <div className="mb-4">
            <span className="text-sm text-gray-500">
              Logged in as <strong>{user.email}</strong>
            </span>
          </div>
          {/* Floating AI button */}
          <Button
            variant="default"
            size="icon"
            className="fixed bottom-6 right-6 z-50 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setAIModalOpen(true)}
            aria-label="Open AI Assistant"
          >
            <Sparkles className="w-7 h-7 animate-pulse" />
          </Button>
          <AIChatModal
            open={aiModalOpen}
            onClose={() => setAIModalOpen(false)}
            onInsert={(text) => {
              setAIModalOpen(false);
              setContent(content + text);
            }}
          />
          {/* Responsive layout: editor first on mobile, posts second */}
          <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
            {/* Post Editor */}
            <div className="order-1 md:order-none">
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
              />
            </div>
            {/* Posts List */}
            <div className="order-2 md:order-none">
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
                fetchPosts();
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
      <div className="h-3">
        <Footer />
      </div>
    </div>
  );
}
