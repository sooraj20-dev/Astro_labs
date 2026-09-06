import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSmileStore } from '@/store/useSmileStore';
import {
  unlockMobileAudio,
  playCameraShutterSound,
} from '@/utils/mockVoice';
import {
  Volume2,
  VolumeX,
  Sparkles,
  X,
  ArrowRight,
} from 'lucide-react';
import introSmileAudio from '@/assets/videos/intro_smile.mp3';

interface LandingScreenProps {
  onStartCamera: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onStartCamera }) => {
  const { landingOpen, setLandingOpen, cameraEnabled } = useSmileStore();

  const [progress, setProgress] = useState<number>(0);
  const [loadingMessageMl, setLoadingMessageMl] = useState<string>('തയ്യാറെടുക്കുന്നു...');
  const [loadingMessageEn, setLoadingMessageEn] = useState<string>('Preparing challenge...');
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [waitingForTap, setWaitingForTap] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFinishedRef = useRef<boolean>(false);

  // Transition to camera when audio completes
  const handleCompleteTransition = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setLandingOpen(false);
    if (!cameraEnabled) {
      onStartCamera();
    }
  }, [cameraEnabled, onStartCamera, setLandingOpen]);

  const handleAudioFinished = useCallback(() => {
    setProgress(100);
    setLoadingMessageMl('📸 ഫ്ലാഷ്! ചിരി പരിശോധന ആരംഭിക്കുന്നു!');
    setLoadingMessageEn('FLASH! Smile detection active!');

    // Trigger flash & mechanical shutter sound
    playCameraShutterSound();
    setIsFlashing(true);

    flashTimeoutRef.current = setTimeout(() => {
      setIsFlashing(false);
      handleCompleteTransition();
    }, 550);
  }, [handleCompleteTransition]);

  // Create or retrieve audio element
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.src = introSmileAudio || '/videos/intro_smile.mp3';
      audio.preload = 'auto';
      audio.volume = 1.0;

      // Secondary fallback on error
      audio.onerror = () => {
        if (audio.src !== '/videos/intro_smile.mp3') {
          audio.src = '/videos/intro_smile.mp3';
          audio.load();
        }
      };

      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  // Play audio and synchronize progress
  const playAudio = useCallback(async () => {
    unlockMobileAudio();
    if (hasFinishedRef.current) return;

    const audio = getAudio();
    audio.currentTime = 0;
    audio.muted = isMuted;
    audio.volume = isMuted ? 0 : 1.0;

    audio.ontimeupdate = () => {
      if (audio.duration && !hasFinishedRef.current) {
        const pct = Math.min(99, Math.round((audio.currentTime / audio.duration) * 100));
        setProgress(pct);

        if (pct >= 15 && pct < 50) {
          setLoadingMessageMl("ഫോട്ടോഗ്രാഫർ: 'Smile... smile! ഒന്നു ചിരിച്ചേ!'");
          setLoadingMessageEn('Photographer: "Smile... smile! Say cheese!"');
        } else if (pct >= 50 && pct < 85) {
          setLoadingMessageMl('മൈൻഡ് കൺട്രോൾ: ചിരിക്കരുത്, ₹500 പെറ്റി വീഴും!');
          setLoadingMessageEn('Hold your face: Do NOT smile! ₹500 fine!');
        } else if (pct >= 85) {
          setLoadingMessageMl('ക്യാമറ ഫ്ലാഷ് ചാർജ് ചെയ്യുന്നു... 📸');
          setLoadingMessageEn('Charging camera strobe flash...');
        }
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      handleAudioFinished();
    };

    try {
      await audio.play();
      setWaitingForTap(false);
      setIsPlaying(true);
    } catch (err) {
      console.warn('[AUDIO] Autoplay blocked by browser, awaiting tap:', err);
      setWaitingForTap(true);
      setIsPlaying(false);
    }
  }, [getAudio, handleAudioFinished, isMuted]);

  // Auto-attempt playback on mount
  useEffect(() => {
    hasFinishedRef.current = false;
    const timer = setTimeout(() => {
      playAudio();
    }, 0);

    return () => {
      clearTimeout(timer);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [playAudio]);

  // Screen click handler ensures audio is unlocked on first user tap
  const handleScreenTap = () => {
    unlockMobileAudio();
    if (waitingForTap || !isPlaying) {
      playAudio();
    }
  };

  const handleSkip = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    unlockMobileAudio();
    handleCompleteTransition();
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
        audioRef.current.volume = next ? 0 : 1.0;
      }
      return next;
    });
  };

  if (!landingOpen) return null;

  return (
    <>
      {/* Strobe Camera Flash Transition */}
      {isFlashing && (
        <div className="fixed inset-0 z-70 pointer-events-none bg-white transition-opacity duration-300 ease-out animate-in fade-in" />
      )}

      {/* Full-Screen Landing Page (No Card Container, Edge-to-Edge Design) */}
      <div
        onClick={handleScreenTap}
        onTouchStart={handleScreenTap}
        className="fixed inset-0 z-50 bg-[#FAF8F5] text-black flex flex-col justify-between select-none overflow-y-auto overflow-x-hidden cursor-pointer selection:bg-chiri-yellow selection:text-black"
      >
        {/* Main Content Column */}
        <div className="w-full max-w-lg mx-auto flex-1 flex flex-col justify-between px-5 sm:px-8 pt-6 sm:pt-8 pb-4">
          
          {/* Top Row: Dot Matrix Grid (Left) + Orange Accent Button & Skip (Right) */}
          <div className="flex items-center justify-between">
            {/* Dot Matrix Pattern (5x5 grid from Reference) */}
            <div className="grid grid-cols-5 gap-1.5 w-fit" aria-label="Pattern Grid">
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-[1px] bg-black/85"
                />
              ))}
            </div>

            {/* Right Controls: Orange Square Sound Toggle + Skip */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={toggleSound}
                className="w-10 h-10 sm:w-11 sm:h-11 bg-[#FF5722] hover:bg-[#E64A19] text-white border-2 border-black shadow-brutal-xs flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                title={isMuted ? 'ശബ്ദം ഓണാക്കുക (Unmute)' : 'ശബ്ദം ഓഫാക്കുക (Mute)'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white stroke-[2.5]" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white stroke-[2.5]" />
                )}
              </button>

              <button
                onClick={handleSkip}
                className="w-10 h-10 sm:w-11 sm:h-11 bg-white hover:bg-black hover:text-white text-black border-2 border-black shadow-brutal-xs flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                title="നേരിട്ട് ക്യാമറയിലേക്ക് പോകുക (Skip)"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Big Typography Section */}
          <div className="pt-4 sm:pt-6 flex flex-col">
            {/* Massive Primary Title: CHIRI */}
            <h1 className="text-[68px] sm:text-[84px] font-black font-sans uppercase text-black tracking-[-0.04em] leading-[0.84] select-none">
              CHIRI
            </h1>

            {/* Subtitles: Bold Two-Line Punch */}
            <div className="mt-2.5 flex flex-col">
              <span className="text-[26px] sm:text-[32px] font-black font-sans uppercase text-black tracking-tight leading-[1.05]">
                NO SMILE.
              </span>
              <span className="text-[26px] sm:text-[32px] font-black font-sans uppercase text-black tracking-tight leading-[1.05]">
                EVERY TIME.
              </span>
            </div>

            {/* Checkered Ribbon + Yellow Badge Tag */}
            <div className="flex items-center gap-2.5 mt-3">
              {/* Checkered 2-row black & white grid strip */}
              <div
                className="w-16 h-6 border-2 border-black shrink-0"
                style={{
                  backgroundImage:
                    'conic-gradient(#000 90deg, #FAF8F5 90deg 180deg, #000 180deg 270deg, #FAF8F5 270deg)',
                  backgroundSize: '8px 8px',
                }}
              />

              {/* Yellow Pill Tag */}
              <div className="bg-chiri-yellow border-2 border-black px-3 py-1 text-xs sm:text-sm font-mono font-black uppercase tracking-wider text-black shadow-brutal-xs flex items-center gap-1">
                <span>SERIOUS. RELAX. REPEAT.</span>
              </div>
            </div>
          </div>

          {/* Centerpiece Area: Upward-Slanted Yellow Polygon + Comic Vintage Camera Animation */}
          <div className="relative w-full my-4 sm:my-6 flex items-center justify-center min-h-[220px] sm:min-h-[260px]">
            {/* Upward Slanted Yellow Polygon Background cutting across the full section */}
            <div
              className="absolute -inset-x-6 sm:-inset-x-12 h-44 sm:h-52 bg-chiri-yellow border-y-3 border-black shadow-brutal-xs"
              style={{
                clipPath: 'polygon(0% 48%, 100% 12%, 100% 88%, 0% 76%)',
              }}
            />

            {/* Comic Vintage Camera SVG & Audio-Reactive Visualizer */}
            <div className="relative z-10 w-full flex flex-col items-center">
              
              {/* Comic Speech Bubble with Dialogue */}
              <div className="transition-all duration-300 mb-1.5 z-20 opacity-100 scale-100 translate-y-0">
                <div className="bg-white border-2 border-black px-3.5 py-1.5 shadow-brutal-xs rounded-lg flex items-center gap-2 font-ml font-bold text-xs sm:text-sm text-black">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
                  <span>"Smile... smile! ഒന്നു ചിരിച്ചേ!" 📸</span>
                </div>
                {/* Speech Bubble Tail */}
                <div className="w-2.5 h-2.5 bg-white border-r-2 border-b-2 border-black rotate-45 mx-auto -mt-1.5" />
              </div>

              {/* Vintage Studio Camera SVG (Comic/Retro Styling) */}
              <div className="relative flex flex-col items-center select-none">
                <svg
                  viewBox="0 0 280 180"
                  className="w-64 sm:w-76 h-auto drop-shadow-md animate-pulse"
                >
                  {/* Ground Cast Shadow */}
                  <ellipse cx="140" cy="172" rx="75" ry="7" fill="#000000" fillOpacity="0.25" />

                  {/* Tripod Wooden Legs with Black Ink Stroke */}
                  <line x1="140" y1="130" x2="85" y2="170" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
                  <line x1="140" y1="130" x2="140" y2="172" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
                  <line x1="140" y1="130" x2="195" y2="170" stroke="#000000" strokeWidth="6" strokeLinecap="round" />

                  {/* Big Vintage Flash Reflector Dish on Top Left */}
                  <g className="animate-bounce">
                    <line x1="100" y1="50" x2="80" y2="28" stroke="#000000" strokeWidth="5" strokeLinecap="round" />
                    {/* Dish */}
                    <circle cx="70" cy="22" r="22" fill="#FAF8F5" stroke="#000000" strokeWidth="3.5" />
                    <circle cx="70" cy="22" r="14" fill="#FFE500" stroke="#000000" strokeWidth="2.5" />
                    {/* Bulb */}
                    <circle cx="70" cy="22" r="6" fill="#FF5722" stroke="#000000" strokeWidth="2" />
                    
                    {/* Sparkles / Flash Charging Rays */}
                    <line x1="40" y1="12" x2="30" y2="5" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
                    <line x1="44" y1="36" x2="32" y2="45" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
                    <line x1="70" y1="-8" x2="70" y2="-1" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
                    <line x1="96" y1="8" x2="105" y2="2" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
                  </g>

                  {/* Main Vintage Wooden Camera Box Body */}
                  <rect
                    x="90"
                    y="45"
                    width="100"
                    height="85"
                    rx="6"
                    fill="#FAF8F5"
                    stroke="#000000"
                    strokeWidth="4"
                  />

                  {/* Top Bellows / Hood Accent */}
                  <rect x="98" y="38" width="84" height="8" rx="2" fill="#FFE500" stroke="#000000" strokeWidth="3" />

                  {/* Accordion Pleat Lines on Body (Retro Bellows) */}
                  <path
                    d="M 104 60 L 114 60 L 108 75 L 118 75 L 112 90 L 122 90 L 116 105 L 126 105"
                    stroke="#000000"
                    strokeWidth="3"
                    fill="none"
                  />
                  <path
                    d="M 176 60 L 166 60 L 172 75 L 162 75 L 168 90 L 158 90 L 164 105 L 154 105"
                    stroke="#000000"
                    strokeWidth="3"
                    fill="none"
                  />

                  {/* Center Brass Lens Base & Aperture Housing */}
                  <circle cx="140" cy="85" r="28" fill="#FFE500" stroke="#000000" strokeWidth="3.5" />
                  <circle cx="140" cy="85" r="21" fill="#000000" />
                  
                  {/* Concentric Glass Lens Rings */}
                  <circle cx="140" cy="85" r="17" fill="#1A1A1A" stroke="#FF5722" strokeWidth="2" />
                  <circle cx="140" cy="85" r="10" fill="#262626" />
                  <circle cx="140" cy="85" r="5" fill="#FFE500" />

                  {/* Lens Glass Reflection Highlights */}
                  <path
                    d="M 130 73 A 14 14 0 0 1 150 73"
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="134" cy="91" r="2.5" fill="#FFFFFF" />

                  {/* Front Checkerboard Trim on Camera Body */}
                  <g>
                    <rect x="94" y="115" width="92" height="11" fill="#000000" stroke="#000000" strokeWidth="2" />
                    {Array.from({ length: 9 }).map((_, i) => (
                      <rect
                        key={i}
                        x={96 + i * 10}
                        y={i % 2 === 0 ? 116 : 121}
                        width="5"
                        height="4.5"
                        fill="#FFE500"
                      />
                    ))}
                  </g>

                  {/* Sound Wave Equalizer Bars */}
                  <g transform="translate(200, 55)">
                    <rect x="0" y="20" width="4" height="20" rx="2" fill="#000000" className="animate-pulse" />
                    <rect x="8" y="10" width="4" height="35" rx="2" fill="#000000" className="animate-bounce" />
                    <rect x="16" y="15" width="4" height="28" rx="2" fill="#000000" className="animate-pulse" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Automatic Loading & Status Section */}
          <div className="pb-3 flex flex-col gap-2.5">
            {waitingForTap ? (
              /* High-Visibility Interactive Tap Banner if Browser Blocked Autoplay */
              <div className="w-full bg-[#FFE500] border-3 border-black p-4 shadow-brutal flex items-center justify-center gap-2.5 animate-bounce cursor-pointer">
                <Volume2 className="w-5 h-5 text-black animate-pulse shrink-0" />
                <span className="font-sans font-black text-sm sm:text-base uppercase tracking-wider text-black">
                  തുടങ്ങാൻ ഇവിടെ തൊടൂ // TAP ANYWHERE TO START
                </span>
              </div>
            ) : (
              /* Brutalist Loading Progress Bar Running in Sync with Audio */
              <div className="w-full bg-white border-3 border-black p-4 shadow-brutal flex flex-col gap-2.5 animate-in fade-in">
                <div className="flex items-center justify-between font-mono text-xs sm:text-sm font-black text-black">
                  <span className="flex items-center gap-1.5 text-chiri-red truncate">
                    <Sparkles className="w-4 h-4 text-chiri-yellow fill-chiri-yellow animate-spin shrink-0" />
                    <span className="truncate">{loadingMessageMl}</span>
                  </span>
                  <span className="bg-black text-chiri-yellow px-2 py-0.5 text-xs sm:text-sm font-mono shrink-0 ml-1">
                    {progress}%
                  </span>
                </div>

                {/* Brutalist Striped Progress Bar */}
                <div className="w-full h-4 sm:h-5 bg-[#E5E5DE] border-2 border-black overflow-hidden p-0.5">
                  <div
                    className="h-full bg-chiri-yellow border border-black transition-all duration-100 ease-out"
                    style={{
                      width: `${progress}%`,
                      backgroundImage:
                        'repeating-linear-gradient(45deg, #FFE500, #FFE500 8px, #000 8px, #000 12px)',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono text-black/70">
                  <span className="truncate">{loadingMessageEn}</span>
                  <button
                    onClick={handleSkip}
                    className="underline font-bold text-black hover:text-chiri-red cursor-pointer shrink-0 ml-1 flex items-center gap-0.5"
                  >
                    <span>Skip</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Automatic Navigation Note */}
            <div className="text-center font-mono text-[10px] sm:text-[11px] font-bold text-black/60 py-0.5">
              ശബ്ദം അവസാനിക്കുമ്പോൾ നേരിട്ട് ക്യാമറ തുറക്കും • Auto-opening camera...
            </div>
          </div>
        </div>

        {/* Full-Width Bottom Hazard Caution Stripe */}
        <div className="w-full shrink-0">
          <div
            className="h-5 sm:h-6 w-full border-t-3 border-black"
            style={{
              backgroundImage:
                'repeating-linear-gradient(-45deg, #000, #000 14px, #FAF8F5 14px, #FAF8F5 28px)',
            }}
          />

          {/* Full-Width Footer */}
          <div className="bg-[#FAF8F5] py-2 px-4 text-center font-mono text-[10px] sm:text-[11px] font-black uppercase text-black/60 tracking-wider">
            KERALA CHIRI POLICE // OFFICIAL NO-SMILE ZONE
          </div>
        </div>
      </div>
    </>
  );
};
