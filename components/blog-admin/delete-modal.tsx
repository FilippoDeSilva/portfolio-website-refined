import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteModal({
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div 
        className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative border border-slate-700 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center pt-8 pb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-red-500/10 to-red-600/10 p-4 rounded-full border-2 border-red-500/30">
              <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-500" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-6 text-center">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Delete Post?
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This action cannot be undone. This will permanently delete your blog post and remove all associated data.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
