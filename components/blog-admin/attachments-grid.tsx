import { Eye, Download, Trash2 } from "lucide-react";

interface AttachmentsGridProps {
  attachments: { url: string; name?: string; type?: string; ext?: string }[];
  onPreview?: (att: {
    url: string;
    name?: string;
    type?: string;
    ext?: string;
  }) => void;
  onRemove: (i: number) => void;
}

export function AttachmentsGrid({
  attachments,
  onPreview,
  onRemove,
}: AttachmentsGridProps) {
  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {attachments.map((att, idx) => {
        return (
          <div
            key={idx}
            className="flex items-center justify-between gap-3 rounded-lg bg-muted dark:bg-secondary p-2 border border-border dark:border-border shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{att.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {att.type || att.ext || "attachment"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-2 py-1 text-xs rounded bg-background border border-border hover:bg-accent"
                onClick={() => onPreview?.(att)}
              >
                <Eye className="w-5 h-5" />
              </button>
              <a
                href={att.url}
                download={att.name || true}
                className="px-2 py-1 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="w-4 h-5 " />
              </a>
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="text-gray-400 hover:text-red-500 transition-colors duration-150"
                aria-label="Remove Attachment"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
