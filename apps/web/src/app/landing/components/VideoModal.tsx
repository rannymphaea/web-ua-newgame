'use client';
import { useRef, useCallback, useEffect } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ isOpen, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {/* autoplay might be blocked */});
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  return (
    <div
      id="video-modal"
      className={`video-modal${isOpen ? ' active' : ''}`}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-label="Video Player"
    >
      <div className="video-modal-content">
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
          <video
            ref={videoRef}
            id="local-video"
            playsInline
            controls
            loop
          >
            <source src="/rizz.mp4" type="video/mp4" />
            Browser Anda tidak mendukung tag video.
          </video>
        </div>
      </div>
    </div>
  );
}
