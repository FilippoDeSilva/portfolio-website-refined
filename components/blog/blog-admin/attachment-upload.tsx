"use client";

import { Paperclip } from "lucide-react";
import { useState } from "react";
import { AttachmentsGrid } from "./attachments-grid";

interface AttachmentUploadProps {
  attachments: { url: string; name?: string; type?: string; ext?: string }[];
  onUpload: (files: FileList) => void;
  onUrlAdd: (url: string) => void;
  onRemove: (index: number) => void;
  onPreview?: (att: any) => void;
  uploadStatus?: string;
}

export function AttachmentUpload({
  attachments,
  onUpload,
  onUrlAdd,
  onRemove,
  onPreview,
  uploadStatus,
}: AttachmentUploadProps) {
  const [urlInput, setUrlInput] = useState("");

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      onUrlAdd(urlInput);
      setUrlInput("");
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-foreground">
        Attachments
      </label>

      {/* Upload Section */}
      <div className="rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors p-3 sm:p-4 bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="flex flex-col gap-3">
          {/* Upload Button */}
          <label className="cursor-pointer group w-full">
            <input
              type="file"
              multiple
              onChange={(e) => {
                if (e.target.files) onUpload(e.target.files);
              }}
              className="sr-only"
            />
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary/30 transition-all group-hover:scale-105 w-full">
              <Paperclip className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-primary">
                Upload Files
              </span>
            </div>
          </label>

          {/* URL Input */}
          <div className="flex flex-col xs:flex-row gap-2 w-full">
            <input
              type="text"
              placeholder="Or paste file URL..."
              className="flex-1 px-3 py-2 border-2 border-border rounded-lg text-xs sm:text-sm bg-background focus:outline-none focus:border-primary transition-colors min-w-0"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddUrl}
              disabled={!urlInput.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm font-medium whitespace-nowrap"
            >
              Attach
            </button>
          </div>
        </div>

        {/* Upload Status */}
        {uploadStatus && (
          <div className="mt-3 text-xs text-center text-muted-foreground bg-muted/50 rounded-lg py-2 px-3">
            {uploadStatus}
          </div>
        )}
      </div>

      {/* Attachments Grid */}
      {attachments.length > 0 && (
        <AttachmentsGrid
          attachments={attachments}
          onPreview={onPreview}
          onRemove={onRemove}
        />
      )}
    </div>
  );
}
