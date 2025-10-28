import { useState } from "react";

interface BlogFormState {
  title: string;
  cover_image: string;
  media_url: string | undefined;
  media_type: string | undefined;
  attachments: any[];
}

const initialFormState: BlogFormState = {
  title: "",
  cover_image: "",
  media_url: undefined,
  media_type: undefined,
  attachments: [],
};

export function useBlogForm() {
  const [form, setForm] = useState<BlogFormState>(initialFormState);
  const [coverImageUrlInput, setCoverImageUrlInput] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [attachmentUrlInput, setAttachmentUrlInput] = useState("");
  const [coverUploadStatus, setCoverUploadStatus] = useState<string | null>(null);
  const [attachmentUploadStatus, setAttachmentUploadStatus] = useState<string | null>(null);

  function resetForm() {
    setForm(initialFormState);
    setCoverImageUrlInput("");
    setCoverImageFile(null);
    setAttachmentUrlInput("");
  }

  return {
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
  };
}
