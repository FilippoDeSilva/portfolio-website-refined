import { useState, useEffect } from "react";

interface LightboxState {
  open: boolean;
  src: string;
  name?: string;
  type?: string;
  thumb?: string;
}

export function useMediaLightbox(deleteModalOpen: boolean, aiModalOpen: boolean) {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [isPIPActive, setIsPIPActive] = useState(false);

  // Scroll lock effect for modals
  useEffect(() => {
    const isModalOpen = lightbox?.open || deleteModalOpen || aiModalOpen;

    if (isModalOpen) {
      document.body.style.overflow = "hidden";

      const preventScroll = (e: WheelEvent) => {
        const target = e.target as Element;
        const isImageViewer = target?.closest("[data-image-viewer]");
        if (!isImageViewer) {
          e.preventDefault();
        }
      };

      window.addEventListener("wheel", preventScroll, { passive: false });

      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("wheel", preventScroll);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [lightbox?.open, deleteModalOpen, aiModalOpen]);

  return {
    lightbox,
    setLightbox,
    isPIPActive,
    setIsPIPActive,
  };
}
