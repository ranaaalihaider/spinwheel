import { useCallback, useEffect, useState } from 'react';

export interface FullscreenControls {
  isFullscreen: boolean;
  isSupported: boolean;
  toggleFullscreen: () => Promise<void>;
}

/**
 * Manages browser Fullscreen API for stage projector presentation mode,
 * with a graceful CSS theater-mode fallback when Fullscreen API is unavailable.
 */
export function useFullscreen(): FullscreenControls {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const isSupported =
    typeof document !== 'undefined' &&
    Boolean(
      document.fullscreenEnabled ||
        (document as unknown as { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled
    );

  useEffect(() => {
    const handleFullscreenChange = () => {
      const activeElement =
        document.fullscreenElement ||
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement;
      setIsFullscreen(Boolean(activeElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      const activeElement =
        document.fullscreenElement ||
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement;

      if (!activeElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else {
          // Graceful fallback state when browser blocks or lacks Fullscreen API
          setIsFullscreen((prev) => !prev);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else {
          setIsFullscreen(false);
        }
      }
    } catch {
      // Fallback to theater state if requestFullscreen rejects
      setIsFullscreen((prev) => !prev);
    }
  }, []);

  return {
    isFullscreen,
    isSupported,
    toggleFullscreen,
  };
}
