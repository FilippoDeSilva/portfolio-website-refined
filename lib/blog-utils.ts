// Utility functions for blog admin

export function slugifyFilename(name: string) {
  const normalized = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-zA-Z0-9._-]/g, "-") // replace spaces and invalid chars
    .replace(/-+/g, "-") // collapse dashes
    .replace(/^[-.]+|[-.]+$/g, ""); // trim leading/trailing separators
  return normalized || "file";
}

export function makeSafeStoragePath(prefix: string, originalName: string) {
  const safeName = slugifyFilename(originalName);
  return `${prefix}/${Date.now()}-${safeName}`;
}

export function getFileTypeFromExtension(ext: string): string {
  if (ext === "pdf") return "application/pdf";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"].includes(ext))
    return `image/${ext}`;
  if (["mp4", "webm", "ogg", "mov", "mkv"].includes(ext))
    return `video/${ext}`;
  if (["mp3", "wav", "m4a", "aac", "flac", "ogg"].includes(ext))
    return `audio/${ext}`;
  if (["zip", "rar", "7z", "tar", "gz", "bz2", "xz"].includes(ext))
    return "archive";
  return "attachment";
}
