import { Eye, Download, Trash2, FileText, Image, Video, Music, File } from "lucide-react";

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

function getFileIcon(type?: string, ext?: string) {
  const fileType = type?.toLowerCase() || ext?.toLowerCase() || '';
  
  if (fileType.includes('image')) return <Image className="w-5 h-5 text-blue-500" />;
  if (fileType.includes('video')) return <Video className="w-5 h-5 text-purple-500" />;
  if (fileType.includes('audio')) return <Music className="w-5 h-5 text-green-500" />;
  if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="w-5 h-5 text-red-500" />;
  return <File className="w-5 h-5 text-gray-500" />;
}

export function AttachmentsGrid({
  attachments,
  onPreview,
  onRemove,
}: AttachmentsGridProps) {
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {attachments.map((att, idx) => {
        return (
          <div
            key={idx}
            className="group relative flex items-center gap-3 rounded-xl bg-gradient-to-br from-card to-muted/50 p-4 border border-border hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* File Icon */}
            <div className="flex-shrink-0 p-3 bg-background rounded-lg border border-border">
              {getFileIcon(att.type, att.ext)}
            </div>
            
            {/* File Info */}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground mb-1">
                {att.name}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {att.type || att.ext || "file"}
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-background border border-transparent hover:border-border transition-all"
                onClick={() => onPreview?.(att)}
                title="Preview"
              >
                <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
              <a
                href={att.url}
                download={att.name || true}
                className="p-2 rounded-lg hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all"
                title="Download"
              >
                <Download className="w-4 h-4 text-primary" />
              </a>
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="p-2 rounded-lg hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all"
                aria-label="Remove Attachment"
                title="Remove"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
