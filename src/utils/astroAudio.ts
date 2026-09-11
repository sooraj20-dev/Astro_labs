import introAstroUrl from '@/assets/Astro/intro.mp3';
import kumbidiAstroUrl from '@/assets/Astro/kumbidi.mp3';
import yeshuAstroUrl from '@/assets/Astro/yeshu.mp3';

let activeAudioEl: HTMLAudioElement | null = null;

const AUDIO_MAP: Record<string, string> = {
  intro: introAstroUrl,
  unni: introAstroUrl,
  kumbidi: kumbidiAstroUrl,
  aayushman: kumbidiAstroUrl,
  yeshu: yeshuAstroUrl,
  jamba: yeshuAstroUrl,
};

/**
 * Play astrologer audio track (intro, aayushman, jamba, etc.)
 */
export function playAstrologerAudio(audioKey: string = 'intro', onEnded?: () => void): HTMLAudioElement {
  stopAstroIntroAudio();

  try {
    const audioSrc = AUDIO_MAP[audioKey] || introAstroUrl;
    const audio = new Audio(audioSrc);
    activeAudioEl = audio;
    audio.volume = 1.0;

    if (onEnded) {
      audio.onended = () => {
        onEnded();
      };
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn(`[ASTRO AUDIO] Autoplay notice (${audioKey}):`, err);
      });
    }

    return audio;
  } catch (err) {
    console.warn(`[ASTRO AUDIO] Error creating audio (${audioKey}):`, err);
    return new Audio();
  }
}

/**
 * Backwards compatibility helper for existing calls.
 */
export function playAstroIntroAudio(onEnded?: () => void): HTMLAudioElement {
  return playAstrologerAudio('intro', onEnded);
}

/**
 * Stop any active astrologer audio playback.
 */
export function stopAstroIntroAudio(): void {
  if (activeAudioEl) {
    try {
      activeAudioEl.pause();
      activeAudioEl.currentTime = 0;
    } catch {
      // Ignore
    }
    activeAudioEl = null;
  }
}

