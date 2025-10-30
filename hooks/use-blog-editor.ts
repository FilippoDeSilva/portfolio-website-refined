import { useState } from "react";

export function useBlogEditor() {
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  return {
    content,
    setContent,
    editingId,
    setEditingId,
  };
}
