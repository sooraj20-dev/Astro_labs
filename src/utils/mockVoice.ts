/**
 * Fluent Malayalam Voice & Audio Engine
 * Uses high-definition native Malayalam neural audio stream for 100% natural,
 * fluent Malayalam pronunciation, with intelligent fallback to Web Speech API.
 */

let audioCtx: AudioContext | null = null;
let isAudioUnlocked = false;
let activeAudioElement: HTMLAudioElement | null = null;

// Global reference to prevent V8 garbage collection during fallback speech
let activeUtterance: SpeechSynthesisUtterance | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

// Preload voices immediately for fallback
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Prime and unlock audio on mobile & desktop browsers during user click/touch.
 */
export function unlockMobileAudio(): void {
  if (isAudioUnlocked) return;

  // 1. Unlock Web Audio Context
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      if (!audioCtx) {
        audioCtx = new AudioContextClass();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }
  } catch {
    // Ignore
  }

  // 2. Unlock HTML5 Audio
  try {
    const silentAudio = new Audio();
    silentAudio.volume = 0.01;
    silentAudio.play().catch(() => {});
  } catch {
    // Ignore
  }

  // 3. Unlock SpeechSynthesis
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
      cachedVoices = window.speechSynthesis.getVoices();
      const primer = new SpeechSynthesisUtterance('');
      primer.volume = 0;
      window.speechSynthesis.speak(primer);
    }
  } catch {
    // Ignore
  }

  isAudioUnlocked = true;
}

/**
 * Play a comic alert sound tone via Web Audio API.
 */
export function playMockAlertSound(intensity: 'mild' | 'medium' | 'extreme' = 'mild'): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (intensity === 'extreme') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (intensity === 'medium') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.12);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);
      osc.start(now);
      osc.stop(now + 0.24);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (err) {
    console.warn('[MOCK VOICE] Web Audio tone error:', err);
  }
}

/**
 * Fallback Web Speech API when offline
 */
function fallbackSpeechSynthesis(
  malayalam: string,
  transliteration?: string,
  onStart?: () => void,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.resume();

    const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    const mlVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('ml') ||
        v.name.toLowerCase().includes('malayalam')
    );

    const inVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === 'en-in' ||
        v.lang.toLowerCase().includes('in') ||
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('heera') ||
        v.name.toLowerCase().includes('ravi')
    );

    const defaultVoice = inVoice || voices.find((v) => v.lang.startsWith('en')) || voices[0];

    const textToSpeak = mlVoice ? malayalam : (transliteration || malayalam);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    activeUtterance = utterance;

    if (mlVoice) {
      utterance.voice = mlVoice;
      utterance.lang = mlVoice.lang;
    } else if (defaultVoice) {
      utterance.voice = defaultVoice;
      utterance.lang = defaultVoice.lang;
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      activeUtterance = null;
      onEnd?.();
    };

    utterance.onerror = () => {
      activeUtterance = null;
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch {
    onEnd?.();
  }
}

/**
 * Speak dialogue as astrologer Unni Namboothiri in natural, fluent Malayalam.
 */
export function speakUnniDialogue(
  malayalamText: string,
  onStart?: () => void,
  onEnd?: () => void
): void {
  if (!malayalamText || typeof window === 'undefined') {
    onEnd?.();
    return;
  }

  // Stop any previous speech or audio
  stopUnniVoice();

  // Clean the text: remove "ഉണ്ണി നമ്പൂതിരി:", quotes, emojis
  const cleanText = malayalamText
    .replace(/ഉണ്ണി\s*നമ്പൂതിരി\s*:/gi, '')
    .replace(/[🎙🔮⚠🌿💰💼❤👁✨]/gu, '')
    .replace(/["'""'']/g, '')
    .trim();

  if (!cleanText) {
    onEnd?.();
    return;
  }

  // 1. Try High-Definition Native Malayalam Audio Stream
  try {
    const ttsUrl = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=ml&q=${encodeURIComponent(cleanText)}`;
    const audio = new Audio();
    activeAudioElement = audio;
    audio.crossOrigin = 'anonymous';
    audio.src = ttsUrl;
    audio.volume = 1.0;

    audio.onplay = () => {
      onStart?.();
    };

    audio.onended = () => {
      activeAudioElement = null;
      onEnd?.();
    };

    audio.onerror = () => {
      activeAudioElement = null;
      fallbackSpeechSynthesis(cleanText, undefined, onStart, onEnd);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => onStart?.())
        .catch(() => {
          fallbackSpeechSynthesis(cleanText, undefined, onStart, onEnd);
        });
    }
  } catch {
    fallbackSpeechSynthesis(cleanText, undefined, onStart, onEnd);
  }
}

export function stopUnniVoice(): void {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch {
      // Ignore
    }
    activeAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}

/**
 * Speak the Malayalam mock dialogue out loud.
 * Prioritizes high-definition native Malayalam audio stream for 100% natural, fluent speech.
 */
export function speakMockRoast(malayalam: string, transliteration?: string): void {
  if (!malayalam || typeof window === 'undefined') return;

  // Stop any currently playing roast audio
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch {
      // Ignore
    }
    activeAudioElement = null;
  }

  // 1. Try Native Fluent Malayalam Audio Stream
  try {
    const cleanText = malayalam.trim();
    const ttsUrl = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=ml&q=${encodeURIComponent(cleanText)}`;
    
    const audio = new Audio();
    activeAudioElement = audio;
    audio.crossOrigin = 'anonymous';
    audio.src = ttsUrl;
    audio.volume = 1.0;

    audio.onended = () => {
      activeAudioElement = null;
    };

    audio.onerror = () => {
      console.warn('[MOCK VOICE] Online fluent audio unavailable, falling back to Web Speech API');
      activeAudioElement = null;
      fallbackSpeechSynthesis(malayalam, transliteration);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('[MOCK VOICE] Audio autoplay blocked or failed:', err);
        fallbackSpeechSynthesis(malayalam, transliteration);
      });
    }
  } catch (err) {
    console.warn('[MOCK VOICE] Native audio stream error:', err);
    fallbackSpeechSynthesis(malayalam, transliteration);
  }
}

/**
 * Synthesize a crisp vintage camera mechanical shutter click (Kachak!)
 */
export function playCameraShutterSound(): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = audioCtx || new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Part 1: Initial mirror slap click (high burst noise)
    const bufferSize = Math.floor(ctx.sampleRate * 0.05);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.Q.setValueAtTime(3, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);

    // Part 2: Mechanical shutter curtain closure (100ms later)
    setTimeout(() => {
      try {
        const curtainNow = ctx.currentTime;
        const curtainNoise = ctx.createBufferSource();
        curtainNoise.buffer = buffer;
        const curtainFilter = ctx.createBiquadFilter();
        curtainFilter.type = 'lowpass';
        curtainFilter.frequency.setValueAtTime(1800, curtainNow);

        const curtainGain = ctx.createGain();
        curtainGain.gain.setValueAtTime(0.8, curtainNow);
        curtainGain.gain.exponentialRampToValueAtTime(0.01, curtainNow + 0.06);

        curtainNoise.connect(curtainFilter);
        curtainFilter.connect(curtainGain);
        curtainGain.connect(ctx.destination);
        curtainNoise.start(curtainNow);
      } catch {
        // Ignore
      }
    }, 100);
  } catch {
    // Ignore
  }
}

/**
 * Dedicated sound player for the studio photo intro dialogue ("Smile... smile... ഒന്ന് ചിരിക്ക്...!")
 * Guarantees audio playback across all browsers and devices.
 */
import introSmileAudioSrc from '@/assets/videos/intro_smile.mp3';

let introAudioElement: HTMLAudioElement | null = null;

export function playIntroSmileAudio(): void {
  unlockMobileAudio();

  try {
    if (!introAudioElement) {
      introAudioElement = new Audio(introSmileAudioSrc);
      introAudioElement.preload = 'auto';
    }
    introAudioElement.currentTime = 0;
    introAudioElement.volume = 1.0;
    const p = introAudioElement.play();
    if (p !== undefined) {
      p.catch((err) => {
        console.warn('[AUDIO] playIntroSmileAudio playback note:', err);
      });
    }
  } catch (err) {
    console.warn('[AUDIO] Failed to play intro sound:', err);
  }
}

export function stopIntroSmileAudio(): void {
  if (introAudioElement) {
    try {
      introAudioElement.pause();
      introAudioElement.currentTime = 0;
    } catch {
      // Ignore
    }
  }
}


