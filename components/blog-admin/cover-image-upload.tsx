"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface CoverImageUploadProps {
  coverImage: string;
  onUpload: (file: File) => void;
  onUrlChange: (url: string) => void;
  onRemove: () => void;
  uploadStatus?: string;
}

export function CoverImageUpload({
  coverImage,
  onUpload,
  onUrlChange,
  onRemove,
  uploadStatus,
}: CoverImageUploadProps) {
  const [urlInput, setUrlInput] = useState("");

  const handleUrlBlur = () => {
    if (urlInput) {
      onUrlChange(urlInput);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-foreground">
        Cover Image
      </label>

      {coverImage ? (
        /* Preview with Delete */
        <div className="relative rounded-xl overflow-hidden border border-border shadow-lg group">
          <img
            src={coverImage}
            alt="cover preview"
            className="w-full h-auto object-cover"
            style={{ maxHeight: "300px" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-3 left-3 text-white text-sm font-medium">
              Cover Image Preview
            </div>
          </div>
          {/* Delete Button */}
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 shadow-lg transition-all opacity-0 group-hover:opacity-100"
            title="Remove cover image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Upload Section */
        <div className="rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors p-6 bg-gradient-to-br from-muted/30 to-muted/10">
          <div className="flex flex-col items-center gap-4">
            {/* Upload Button */}
            <label className="cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(file);
                }}
                className="sr-only"
              />
              <div className="flex flex-col items-center gap-2 px-6 py-4 bg-primary/10 hover:bg-primary/20 rounded-xl border border-primary/30 transition-all group-hover:scale-105">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-sm font-medium text-primary">
                  Upload Image
                </span>
                <span className="text-xs text-muted-foreground">
                  or drag and drop
                </span>
              </div>
            </label>

            {/* Divider */}
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs text-muted-foreground font-medium">
                OR
              </span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            {/* URL Input */}
            <div className="w-full">
              <input
                type="text"
                placeholder="Paste image URL here..."
                className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onBlur={handleUrlBlur}
              />
            </div>
          </div>

          {/* Upload Status */}
          {uploadStatus && (
            <div className="mt-3 text-xs text-center text-muted-foreground bg-muted/50 rounded-lg py-2 px-3">
              {uploadStatus}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
