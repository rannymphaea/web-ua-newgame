/**
 * G3: MediaController singleton — unified manager for all video/audio
 * Prevents multiple videos playing simultaneously, handles autoplay policy.
 *
 * Usage:
 *   import { mediaController } from '@/lib/media-controller';
 *   mediaController.playVideo(videoEl);
 *   const ctx = mediaController.getAudioContext();
 *   await mediaController.resumeAudio();
 */

class MediaController {
  private activeVideo: HTMLVideoElement | null = null;
  private audioCtx: AudioContext | null = null;

  // ── Video ────────────────────────────────────────────────────
  playVideo(el: HTMLVideoElement): Promise<void> {
    // Pause any previously active video
    if (this.activeVideo && this.activeVideo !== el) {
      this.activeVideo.pause();
    }
    this.activeVideo = el;
    return el.play().catch(err => {
      // Autoplay blocked by browser policy
      console.warn('[MediaController] Video autoplay blocked:', err);
      // Don't throw — UI should still show video, user can press play
    });
  }

  pauseVideo() {
    if (this.activeVideo) {
      this.activeVideo.pause();
      this.activeVideo = null;
    }
  }

  stopVideo() {
    if (this.activeVideo) {
      this.activeVideo.pause();
      this.activeVideo.currentTime = 0;
      this.activeVideo = null;
    }
  }

  // ── Audio Context ────────────────────────────────────────────
  getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
    }
    return this.audioCtx;
  }

  /**
   * Must be called inside a user gesture handler.
   * Returns the resumed AudioContext.
   */
  async resumeAudio(): Promise<AudioContext> {
    const ctx = this.getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    return ctx;
  }

  /** Close audio context — call on page unload if needed */
  async closeAudio(): Promise<void> {
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      await this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

// Singleton — SSR safe
export const mediaController =
  typeof window !== 'undefined' ? new MediaController() : null;
