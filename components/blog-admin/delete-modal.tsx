import { Button } from "@/components/ui/button";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card dark:bg-zinc-900 rounded-lg shadow-lg max-w-sm w-full p-6 relative flex flex-col items-center border border-border">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Are you sure you want to delete this post?
        </h3>
        <div className="flex gap-4 mt-2">
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
