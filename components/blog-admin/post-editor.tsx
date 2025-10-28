"use client";

import { EditorContent } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Check, RefreshCw, Send, X, Paperclip, Plus } from "lucide-react";
import { TiptapMenuBar } from "./tiptap-menu-bar";
import { AttachmentsGrid } from "./attachments-grid";
import { getFileTypeFromExtension } from "@/lib/blog-utils";

interface PostEditorProps {
  form: {
    title: string;
    cover_image: string;
    media_url: string | undefined;
    media_type: string | undefined;
    attachments: any[];
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  editor: any;
  editingId: string | null;
  coverImageUrlInput: string;
  setCoverImageUrlInput: (value: string) => void;
  coverUploadStatus: string | null;
  attachmentUrlInput: string;
  setAttachmentUrlInput: (value: string) => void;
  attachmentUploadStatus: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onCoverImageUpload: (file: File) => void;
  onAttachmentFiles: (files: FileList | null) => void;
  onPreviewAttachment: (att: any) => void;
}

export function PostEditor({
  form,
  setForm,
  editor,
  editingId,
  coverImageUrlInput,
  setCoverImageUrlInput,
  coverUploadStatus,
  attachmentUrlInput,
  setAttachmentUrlInput,
  attachmentUploadStatus,
  onSubmit,
  onCancel,
  onCoverImageUpload,
  onAttachmentFiles,
  onPreviewAttachment,
}: PostEditorProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-background via-muted/60 to-background/80 shadow-xl border-0 rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold tracking-tight mb-1">
          {editingId ? "Edit Post" : "New Post"}
        </CardTitle>
        <CardDescription className="mb-2 text-base">
          Share your latest thoughts, stories, or updates. Make it memorable and
          beautiful!
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-5">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              placeholder="Enter a captivating title..."
            />
          </div>

          <div>
            <label
              htmlFor="cover_image"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Cover Image
            </label>
            {coverUploadStatus && (
              <div className="text-xs text-muted-foreground mb-1">
                {coverUploadStatus}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 mt-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) onCoverImageUpload(file);
                  }}
                  className="sr-only"
                />
                <span className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg shadow-inner hover:bg-blue-50 dark:hover:bg-blue-900/30 transition">
                  <Paperclip className="w-5 h-5 text-blue-500" />
                </span>
              </label>
              <input
                type="text"
                placeholder="Paste image URL"
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={coverImageUrlInput}
                onChange={(e) => setCoverImageUrlInput(e.target.value)}
                onBlur={() => {
                  if (coverImageUrlInput)
                    setForm((f: any) => ({
                      ...f,
                      cover_image: coverImageUrlInput,
                    }));
                }}
              />
            </div>
            {form.cover_image && (
              <div className="mt-3 flex justify-center">
                <img
                  src={form.cover_image}
                  alt="cover preview"
                  className="max-h-40 rounded-xl shadow"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Content
            </label>
            <div className="rounded-xl border border-border bg-background/80 shadow-inner">
              <TiptapMenuBar editor={editor} />
              <div className="overflow-hidden rounded-b-xl">
                <div className="prose dark:prose-invert prose-ul:pl-6 prose-ol:pl-6 max-w-none">
                  <EditorContent editor={editor} key={editingId || "new"} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Attachments{" "}
              <span className="text-xs text-muted-foreground">
                (optional, multiple)
              </span>
            </label>
            {attachmentUploadStatus && (
              <div className="text-xs text-muted-foreground mb-1">
                {attachmentUploadStatus}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 mt-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={(e) => onAttachmentFiles(e.target.files)}
                  className="sr-only"
                />
                <span className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg shadow-inner hover:bg-blue-50 dark:hover:bg-blue-900/30 transition">
                  <Paperclip className="w-5 h-5 text-blue-500" />
                </span>
              </label>
              <input
                type="text"
                placeholder="Paste attachment URL"
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={attachmentUrlInput}
                onChange={(e) => setAttachmentUrlInput(e.target.value)}
              />
              <button
                type="button"
                className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold shadow hover:bg-primary/90 transition flex items-center justify-center"
                aria-label="Add Attachment"
                onClick={() => {
                  if (attachmentUrlInput) {
                    const url = attachmentUrlInput.trim();
                    const withoutQuery = url.split("?")[0].toLowerCase();
                    const ext = withoutQuery.includes(".")
                      ? withoutQuery.split(".").pop() || ""
                      : "";
                    const type = getFileTypeFromExtension(ext);
                    setForm((f: any) => ({
                      ...f,
                      attachments: [
                        ...(f.attachments || []),
                        { url, name: url, type, ext },
                      ],
                    }));
                    setAttachmentUrlInput("");
                  }
                }}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {form.attachments && form.attachments.length > 0 && (
              <AttachmentsGrid
                attachments={form.attachments}
                onPreview={onPreviewAttachment}
                onRemove={(i) =>
                  setForm((f: any) => ({
                    ...f,
                    attachments: f.attachments.filter(
                      (_: any, idx: number) => idx !== i
                    ),
                  }))
                }
              />
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 flex items-center justify-center text-base rounded-lg shadow-md"
            aria-label={editingId ? "Update Post" : "Publish Post"}
          >
            {editingId ? (
              <Check className="w-6 h-6" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center text-base rounded-lg shadow-md"
            aria-label={editingId ? "Cancel Edit" : "Clear Form"}
          >
            {editingId ? <X className="w-6 h-6" /> : <RefreshCw className="w-6 h-6" />}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
