"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Check, Eraser, Send, X } from "lucide-react";
import { AdvancedEditor, type AdvancedEditorRef } from "./advanced-editor";
import { CoverImageUpload } from "./cover-image-upload";
import { AttachmentUpload } from "./attachment-upload";
import { getFileTypeFromExtension } from "@/lib/blog-utils";
import { useRef } from "react";

interface PostEditorProps {
  form: {
    title: string;
    cover_image: string;
    media_url: string | undefined;
    media_type: string | undefined;
    attachments: any[];
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  content: string;
  setContent: (content: string) => void;
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
  onOpenAI: () => void;
  editorRef?: React.RefObject<AdvancedEditorRef | null>;
}

export function PostEditor({
  form,
  setForm,
  content,
  setContent,
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
  onOpenAI,
  editorRef: externalEditorRef,
}: PostEditorProps) {
  const internalEditorRef = useRef<AdvancedEditorRef | null>(null);
  const editorRef = externalEditorRef || internalEditorRef;
  
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

          <CoverImageUpload
            coverImage={form.cover_image}
            onUpload={onCoverImageUpload}
            onUrlChange={(url) => setForm({ ...form, cover_image: url })}
            onRemove={() => setForm({ ...form, cover_image: "" })}
            uploadStatus={coverUploadStatus || undefined}
          />

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Content
            </label>
            <AdvancedEditor
              ref={editorRef}
              key={editingId || "new"}
              content={content}
              onChange={setContent}
              placeholder="Start writing your amazing blog post... Type '/' for commands"
              onOpenAI={onOpenAI}
            />
          </div>

          <AttachmentUpload
            attachments={form.attachments || []}
            onUpload={(files) => onAttachmentFiles(files)}
            onUrlAdd={(url) => {
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
            }}
            onRemove={(i) =>
              setForm((f: any) => ({
                ...f,
                attachments: f.attachments.filter(
                  (_: any, idx: number) => idx !== i
                ),
              }))
            }
            onPreview={onPreviewAttachment}
            uploadStatus={attachmentUploadStatus || undefined}
          />
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
            {editingId ? <X className="w-6 h-6" /> : <Eraser className="w-6 h-6" />}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
