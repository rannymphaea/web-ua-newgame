'use client';
import { useRef, useEffect, useCallback } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pass youtubeId to embed YouTube instead of local video */
  youtubeId?: string;
}

// ── YouTube iframe cleanup helper ─────────────────────────────────────────────
function destroyYouTubeIframe(container: HTMLDivElement | null) {
  if (!container) return;
  // Stop playback by blanking src before removal (prevents audio ghost)
  const iframe = container.querySelector('iframe');
  if (iframe) {
    iframe.src = '';
    iframe.remove();
  }
  container.innerHTML = '';
}

function buildYouTubeUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
}

export default function VideoModal({ isOpen, onClose, youtubeId }: VideoModalProps) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const ytContainer = useRef<HTMLDivElement>(null);

  // ── YouTube: mount/unmount iframe on open/close ───────────────────────────
  useEffect(() => {
    if (!youtubeId) return;
    const container = ytContainer.current;
    if (!container) return;

    if (isOpen) {
      const iframe = document.createElement('iframe');
      iframe.src              = buildYouTubeUrl(youtubeId);
      iframe.allow            = 'autoplay; encrypted-media; picture-in-picture';
      iframe.allowFullscreen  = true;
      iframe.style.cssText    = 'width:100%;height:100%;border:0;border-radius:12px;';
      iframe.title            = 'Video Player';
      container.appendChild(iframe);
    } else {
      // Full cleanup: blank src → remove node → clear container
      destroyYouTubeIframe(container);
    }

    return () => {
      // Cleanup on unmount too
      destroyYouTubeIframe(container);
    };
  }, [isOpen, youtubeId]);

  // ── Local video: play/stop via ref ────────────────────────────────────────
  useEffect(() => {
    if (youtubeId) return;
    const vid = videoRef.current;
    if (!vid) return;
    if (isOpen) {
      vid.currentTime = 0;
      vid.play().catch(() => { /* autoplay blocked — user can press play */ });
    } else {
      vid.pause();
      vid.currentTime = 0;
    }
  }, [isOpen, youtubeId]);

  // ── Escape + scroll lock ──────────────────────────────────────────────────
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKey]);

  // ── Unmount when closed (prevents background play) ────────────────────────
  if (!isOpen) return null;

  return (
    <div
      id="video-modal"
      className="video-modal"
      onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Video Player"
    >
      <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          id="close-video"
          className="close-video"
          onClick={onClose}
          aria-label="Tutup video"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="video-container">
          {youtubeId ? (
            /* YouTube: managed div — iframe injected/destroyed via ref */
            <div ref={ytContainer} style={{ width: '100%', height: '100%' }} />
          ) : (
            /* Local MP4 */
            <video ref={videoRef} id="local-video" playsInline controls loop>
              <source src="/rizz.mp4" type="video/mp4" />
              Browser Anda tidak mendukung tag video.
            </video>
          )}
        </div>
      </div>
    </div>
  );
}
