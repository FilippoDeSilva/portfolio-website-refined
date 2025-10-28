import { supabase } from "@/lib/supabaseClient";
import { makeSafeStoragePath } from "@/lib/blog-utils";

export class BlogUploadService {
  static async uploadCoverImage(
    file: File,
    existingCoverImage?: string,
    onStatusChange?: (status: string | null) => void
  ): Promise<string | null> {
    onStatusChange?.(`Uploading cover: ${file.name} ...`);
    
    try {
      // Delete existing cover if present
      if (existingCoverImage) {
        try {
          await fetch("/api/admin/delete-blog-files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cover_image: existingCoverImage,
              attachments: [],
            }),
          });
          console.log("[Cover Upload] previous cover deleted");
        } catch (delErr) {
          console.warn("[Cover Upload] could not delete previous cover:", delErr);
        }
      }

      const path = makeSafeStoragePath("cover-images", file.name);
      console.log("[Cover Upload] start", { fileName: file.name, path });
      
      const { data, error } = await supabase.storage
        .from("blog-attachments")
        .upload(path, file);
        
      if (error) {
        console.error("Cover image upload error:", error);
        alert("Cover image upload failed: " + error.message);
        return null;
      }
      
      if (data) {
        const url = supabase.storage
          .from("blog-attachments")
          .getPublicUrl(path).data.publicUrl;
        console.log("[Cover Upload] success", { url });
        return url;
      }
    } catch (err: any) {
      console.error("[Cover Upload] unexpected error", err);
      alert("Cover image upload failed unexpectedly.");
    } finally {
      onStatusChange?.(null);
    }
    
    return null;
  }

  static async uploadAttachments(
    files: FileList | null,
    onStatusChange?: (status: string | null) => void
  ): Promise<any[]> {
    if (!files) return [];
    
    const uploaded: any[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".")?.pop();
        const path = makeSafeStoragePath("attachments", file.name);
        
        onStatusChange?.(`Uploading ${i + 1}/${files.length}: ${file.name}`);
        console.log("[Attachment Upload] start", { index: i, fileName: file.name, path });
        
        const { data, error } = await supabase.storage
          .from("blog-attachments")
          .upload(path, file);
          
        if (error) {
          console.error(`Attachment upload error for ${file.name}:`, error);
          alert(`Attachment upload failed for ${file.name}: ` + error.message);
          continue;
        }
        
        if (data) {
          const url = supabase.storage
            .from("blog-attachments")
            .getPublicUrl(path).data.publicUrl;
          console.log("[Attachment Upload] success", { index: i, url });

          let attachmentData = { url, name: file.name, type: file.type, ext };

          // Try to extract thumbnail for audio files
          if (file.type.startsWith("audio/")) {
            try {
              onStatusChange?.(`Extracting thumbnail for: ${file.name}`);
              await fetch("/api/extract-music-thumbnail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  audioUrl: url,
                  audioName: file.name,
                }),
              });
            } catch (thumbnailError) {
              console.warn(
                "[Thumbnail Extraction] failed for",
                file.name,
                ":",
                thumbnailError
              );
            }
          }

          uploaded.push(attachmentData);
        }
      }
    } catch (err: any) {
      console.error("[Attachment Upload] unexpected error", err);
      alert("Attachment upload failed unexpectedly.");
    } finally {
      onStatusChange?.(null);
    }
    
    return uploaded;
  }
}
