// VideoModal — rendered inside 'use client' landing page, no separate directive needed
import { useRef, useEffect, useCallback } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  youtubeId?: string;
}

function destroyYouTubeIframe(container: HTMLDivElement | null) {
  if (!container) return;
  const iframe = container.querySelector('iframe');
  if (iframe) { iframe.src = ''; iframe.remove(); }
  container.innerHTML = '';
}

function buildYouTubeUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
}

export default function VideoModal({ isOpen, onClose, youtubeId }: VideoModalProps) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const ytContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!youtubeId) return;
    const container = ytContainer.current;
    if (!container) return;
    if (isOpen) {
      const iframe = document.createElement('iframe');
      iframe.src             = buildYouTubeUrl(youtubeId);
      iframe.allow           = 'autoplay; encrypted-media; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.cssText   = 'width:100%;height:100%;border:0;border-radius:12px;';
      iframe.title           = 'Video Player';
      container.appendChild(iframe);
    } else {
      destroyYouTubeIframe(container);
    }
    return () => { destroyYouTubeIframe(container); };
  }, [isOpen, youtubeId]);

  useEffect(() => {
    if (youtubeId) return;
    const vid = videoRef.current;
    if (!vid) return;
    if (isOpen) { vid.currentTime = 0; vid.play().catch(() => {}); }
    else { vid.pause(); vid.currentTime = 0; }
  }, [isOpen, youtubeId]);

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

  if (!isOpen) return null;

  return (
    /* Backdrop — klik/tap di luar area konten = tutup */
    <div
      id="video-modal"
      className="video-modal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Video Player"
    >
      <div
        className="video-modal-inner"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button — di dalam frame, selalu visible di Android */}
        <div className="video-modal-topbar">
          <span className="video-modal-title">NEWGAME Video</span>
          <button
            id="close-video"
            className="close-video"
            onClick={onClose}
            aria-label="Tutup video"
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="video-container">
          {youtubeId ? (
            <div ref={ytContainer} style={{ width: '100%', height: '100%' }} />
          ) : (
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
