"use client";

import ImageViewer from "@/components/ui/image-viewer";
import NativeVideoPlayer from "@/components/ui/native-video-player";
import NativeAudioPlayer from "@/components/ui/native-audio-player";

interface MediaLightboxProps {
  lightbox: {
    open: boolean;
    src: string;
    name?: string;
    type?: string;
    thumb?: string;
  } | null;
  isPIPActive: boolean;
  onClose: () => void;
  onPIPChange: (isActive: boolean) => void;
}

export function MediaLightbox({
  lightbox,
  isPIPActive,
  onClose,
  onPIPChange,
}: MediaLightboxProps) {
  if (!lightbox?.open || !lightbox?.src) return null;

  return (
    <div
      className={`fixed inset-0 z-50 grid place-items-center p-2 sm:p-4 transition-opacity duration-200 ${
        lightbox.type?.startsWith("video")
          ? isPIPActive
            ? "bg-transparent opacity-0 pointer-events-none"
            : "bg-background/30 dark:bg-black/30 backdrop-blur-sm opacity-100"
          : "bg-background/30 dark:bg-black/30 backdrop-blur-sm opacity-100"
      }`}
    >
      <div className="relative w-full max-w-5xl">
        {lightbox.type?.startsWith("video") ? (
          <NativeVideoPlayer
            src={lightbox.src}
            name={lightbox.name}
            className={
              isPIPActive
                ? "absolute -left-[9999px] w-[1px] h-[1px] opacity-0 pointer-events-none"
                : "w-full h-[50vh] sm:h-[60vh] md:h-[70vh] rounded-xl overflow-hidden"
            }
            onClose={() => {
              onClose();
              onPIPChange(false);
            }}
            onPIPChange={onPIPChange}
          />
        ) : lightbox.type?.startsWith("audio") ? (
          <div className="relative w-full max-w-2xl mx-auto px-2 sm:px-0">
            <NativeAudioPlayer
              src={lightbox.src}
              name={lightbox.name}
              className="w-full"
              thumbnail={lightbox.thumb}
              onClose={onClose}
            />
          </div>
        ) : (
          <ImageViewer
            src={lightbox.src}
            alt={lightbox.name}
            className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh] rounded-xl overflow-hidden"
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
