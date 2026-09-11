import React, { useState, useEffect } from 'react';
import { useSmileStore } from '@/store/useSmileStore';
import { unlockMobileAudio } from '@/utils/mockVoice';
import { ArrowRight, Film, Sparkles, Star, Zap } from 'lucide-react';
import { ASTROLOGERS, AstrologerId } from '@/data/jyothishamData';
import { UnniAvatar } from '@/components/UnniAvatar';
import { stopAstroIntroAudio } from '@/utils/astroAudio';
import zodiacWheelImg from '@/assets/Astro/zodiac_wheel.jpg';
import altarTableImg from '@/assets/Astro/altar_table.png';

interface LandingScreenProps {
  onStartCamera: () => void;
}

const ASTROLOGER_IDS: AstrologerId[] = ['unni', 'kumbidi', 'yeshu'];

// Typewriter hook for punchy Malayalam taglines
function useTypewriter(texts: string[], speed = 55, pause = 2200) {
  const [display, setDisplay] = useState('');
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIdx];
    const delay = deleting
      ? speed / 2
      : charIdx === current.length
      ? pause
      : speed;

    const timer = setTimeout(() => {
      if (!deleting) {
        if (charIdx < current.length) {
          setDisplay(current.slice(0, charIdx + 1));
          setCharIdx((c) => c + 1);
        } else {
          setDeleting(true);
        }
      } else {
        if (charIdx > 0) {
          setDisplay(current.slice(0, charIdx - 1));
          setCharIdx((c) => c - 1);
        } else {
          setDeleting(false);
          setTextIdx((i) => (i + 1) % texts.length);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [charIdx, deleting, textIdx, texts, speed, pause]);

  return display;
}

const TAGLINES_ASTROLOGY = [
  'കവടി നിരത്തി നിന്റെ ഭാവി പറയും...',
  'ഗ്രഹനില: 100% ഗ്യാരണ്ടി (ശാസ്ത്രീയ ഗ്യാരണ്ടി ഇല്ല)',
  'മുഖം കണ്ടാൽ ജ്യോതിഷം കണ്ടതുപോലെ!',
  'ശനി, രാഹു, കേതു — ഒക്കെ നിന്നെ ഉദ്ദേശിച്ചാണ്!',
];

const TAGLINES_MOVIE = [
  'ചിരിച്ചാൽ ഒരു കട്ട ഡയലോഗ് കിട്ടും!',
  'പല്ല് പുറത്ത് കാണിക്കരുത് — ഫൈൻ ആകും!',
  'ഈ ചിരി കണ്ടാൽ ഡയറക്ടർ ഫ്ലോർ ഇടും!',
];



export const LandingScreen: React.FC<LandingScreenProps> = ({ onStartCamera }) => {
  const {
    landingOpen,
    setLandingOpen,
    setAppPhase,
    cameraEnabled,
    mockMode,
    setMockMode,
    selectedAstrologerId,
    setSelectedAstrologerId,
  } = useSmileStore();

  const [showPulse, setShowPulse] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const tagline = useTypewriter(
    mockMode === 'MOVIE' ? TAGLINES_MOVIE : TAGLINES_ASTROLOGY,
    50,
    2200
  );

  // Auto-rotate astrologer selection periodically until user manually interacts (completely silent)
  useEffect(() => {
    if (!autoRotate || mockMode === 'MOVIE') return;
    const t = setInterval(() => {
      setSelectedAstrologerId(
        ASTROLOGER_IDS[(ASTROLOGER_IDS.indexOf(selectedAstrologerId) + 1) % ASTROLOGER_IDS.length],
        false
      );
    }, 3600);
    return () => clearInterval(t);
  }, [autoRotate, selectedAstrologerId, mockMode, setSelectedAstrologerId]);

  // Periodic CTA attention pulse
  useEffect(() => {
    const t = setInterval(() => {
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 600);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  if (!landingOpen) return null;

  const handleStart = () => {
    stopAstroIntroAudio();
    unlockMobileAudio();
    setLandingOpen(false);
    setAppPhase('WAITING_FACE');
    if (!cameraEnabled) onStartCamera();
  };

  const handleAstrologerClick = (id: AstrologerId) => {
    setAutoRotate(false);
    // Audio plays ONLY when the user explicitly selects an astrologer
    setSelectedAstrologerId(id, true);
  };

  const currentAstrologer =
    ASTROLOGERS.find((a) => a.id === selectedAstrologerId) || ASTROLOGERS[0];

  return (
    <>
      <style>{`
        @keyframes cosmicSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes btnWiggle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>

      {/* FULL-SCREEN ROOT CONTAINER (Warm Parchment Kerala Astrologer Chamber) */}
      <div
        onClick={unlockMobileAudio}
        onTouchStart={unlockMobileAudio}
        className="fixed inset-0 z-50 flex flex-col justify-between bg-[#D8C7AD] text-black overflow-x-hidden overflow-y-auto md:overflow-hidden select-none w-full max-w-full"
        style={{
          backgroundImage:
            'radial-gradient(circle at 40% 40%, rgba(246, 238, 225, 0.45) 0%, rgba(216, 199, 173, 0.9) 60%, rgba(200, 180, 150, 0.95) 100%)',
        }}
      >
        {/* Subtle Sacred Malayalam Script & Yantram Watermarks in Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.07] select-none font-ml text-4xl sm:text-6xl font-black text-black">
          <span className="absolute top-[12%] left-[6%]">ത</span>
          <span className="absolute top-[28%] left-[14%]">ശ</span>
          <span className="absolute top-[45%] left-[5%]">ര</span>
          <span className="absolute top-[18%] left-[24%]">മ</span>
          <span className="absolute top-[65%] left-[12%]">ന</span>
          <span className="absolute top-[82%] left-[4%]">യ</span>
          <span className="absolute top-[15%] right-[28%]">ക</span>
          <span className="absolute top-[35%] right-[10%]">പ</span>
          <span className="absolute top-[70%] right-[18%]">ഗ</span>
          <span className="absolute top-[85%] right-[32%]">ഭ</span>
          {/* Subtle Yantram Diamond line art behind left altar */}
          <div className="absolute top-[22%] left-[18%] w-48 h-48 border border-black/40 rotate-45" />
          <div className="absolute top-[26%] left-[20%] w-36 h-36 border border-black/30 rotate-45" />
        </div>

        {/* 1. TOP GLOBAL HEADER STRIP (Matches Mockup) */}
        <header className="relative z-30 w-full max-w-full border-b-2 border-black bg-[#EFE8D8] px-2 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.15)] shrink-0 h-10 sm:h-11">
          {/* Brand Tag & Live Status */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="bg-black text-chiri-yellow font-mono font-black text-[10px] sm:text-sm px-1.5 sm:px-2.5 py-0.5 border border-black shadow-[1.5px_1.5px_0px_#FFE500]">
              ASTRO LAB
            </div>
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] font-black uppercase text-black">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-ping" />
              <span>LIVE AI ENGINE • v2.5</span>
            </div>
          </div>

          {/* Center Mode Switcher Tabs */}
          <div className="flex bg-[#E6DEC8] border-2 border-black p-0.5 shadow-[1.5px_1.5px_0px_#000]">
            <button
              onClick={() => {
                setMockMode('ASTROLOGY');
                setAutoRotate(true);
              }}
              className={`px-2 sm:px-3 py-0.5 sm:py-1 font-ml font-black text-[10px] sm:text-xs uppercase flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-all ${
                mockMode === 'ASTROLOGY'
                  ? 'bg-chiri-yellow text-black border border-black shadow-[1px_1px_0px_#000]'
                  : 'text-black/70 hover:text-black border border-transparent'
              }`}
            >
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
              <span>ജ്യോതിഷം</span>
            </button>
            <button
              onClick={() => setMockMode('MOVIE')}
              className={`px-2 sm:px-3 py-0.5 sm:py-1 font-ml font-black text-[10px] sm:text-xs uppercase flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-all ${
                mockMode === 'MOVIE'
                  ? 'bg-chiri-yellow text-black border border-black shadow-[1px_1px_0px_#000]'
                  : 'text-black/70 hover:text-black border border-transparent'
              }`}
            >
              <Film className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
              <span>സിനിമ റോസ്റ്റ്</span>
            </button>
          </div>

          {/* Right Status / Trust Indicator */}
          <div className="hidden md:flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] font-bold text-black/90 bg-[#FAF8F2] border-2 border-black px-3 py-0.5 shadow-[1.5px_1.5px_0px_#000]">
            <Star className="w-3.5 h-3.5 fill-chiri-yellow text-black" />
            <span>AI MODEL: TRUST ME BRO</span>
          </div>
        </header>

        {/* 2. MAIN TWO-COLUMN STAGE (Altar touching screen left and bottom, Stage on Right) */}
        <main className="relative z-10 flex-1 w-full max-w-full min-w-0 h-[calc(100dvh-40px)] sm:h-[calc(100dvh-44px)] flex flex-col md:flex-row items-stretch justify-between overflow-y-auto md:overflow-hidden">
          
          {/* LEFT COLUMN: Antique Carved Pooja Table Altar with Hanging Lamp & Nilavilakkus */}
          <div className="hidden md:flex w-[46%] lg:w-[47%] h-full shrink-0 relative items-end justify-start overflow-hidden pointer-events-none select-none">
            <img
              src={altarTableImg}
              alt="Kerala Astrologer Altar Table with Nilavilakku and Hanging Deepam"
              className="h-full w-full object-cover object-left-top"
            />
          </div>

          {/* RIGHT COLUMN: Interactive Astrologer Horoscope Stage */}
          <div className="relative flex-1 w-full max-w-full md:max-w-xl min-w-0 h-full flex flex-col items-center justify-center text-center px-2.5 sm:px-6 md:px-8 z-10 mx-auto py-2">
            
            {/* Spinning Astrology Zodiac Circle centered behind this right section */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[520px] sm:h-[520px] lg:w-[600px] lg:h-[600px] pointer-events-none select-none -z-10 flex items-center justify-center overflow-hidden">
              <img
                src={zodiacWheelImg}
                alt="Astrology Zodiac Wheel"
                className="w-full h-full object-cover rounded-full mix-blend-multiply opacity-[0.24] sm:opacity-[0.28] contrast-125 pointer-events-none"
                style={{
                  animation: 'cosmicSpin 85s linear infinite',
                }}
              />
            </div>

            {/* Top Pill / Badge */}
            <div className="inline-flex items-center justify-center gap-1.5 bg-chiri-yellow text-black font-mono font-black text-[9px] sm:text-xs uppercase tracking-wider px-2 sm:px-3.5 py-0.5 sm:py-1 border-2 border-black shadow-[2px_2px_0px_#000] mb-1.5 sm:mb-2.5 max-w-[92%] overflow-hidden">
              <span className="shrink-0">🔮</span>
              <span className="truncate">ASTRO LAB CHAMBER • {currentAstrologer.name}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-ml tracking-tight text-black leading-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] w-full text-center">
              {mockMode === 'MOVIE' ? 'സിനിമ റോസ്റ്റ്™' : 'മുഖം നോക്കി ഭാവി™'}
            </h1>

            {/* Subtitle description */}
            <p className="font-ml font-bold text-[11px] sm:text-sm md:text-base text-black/85 w-full max-w-lg mx-auto leading-snug mt-1 mb-2.5 sm:mb-4 px-2 text-center break-words">
              {mockMode === 'MOVIE'
                ? 'ക്യാമറയിലേക്ക് നോക്കൂ... പല്ല് കാണിച്ച് ചിരിച്ചാൽ സിനിമയിലെ കട്ട റോസ്റ്റ് ഡയലോഗ് വരും!'
                : 'നിന്റെ മുഖഭാവം നോക്കി സാമുദ്രിക ശാസ്ത്രവും കവടിയും നിരത്തി പച്ചയായ ഭാവി പ്രവചിക്കുന്നു!'}
            </p>

            {/* 3 Astrologer Cards Row (Exact replica of mockup cards) */}
            {mockMode === 'ASTROLOGY' && (
              <div className="w-full max-w-full mb-2 sm:mb-3">
                <div className="grid grid-cols-3 gap-1.5 sm:gap-3.5 w-full">
                  {ASTROLOGERS.map((a) => {
                    const isSelected = selectedAstrologerId === a.id;
                    return (
                      <button
                        key={a.id}
                        onClick={() => handleAstrologerClick(a.id as AstrologerId)}
                        className={`group relative p-1 sm:p-2.5 min-w-0 w-full text-center flex flex-col items-stretch justify-between cursor-pointer transition-all duration-200 select-none min-h-[108px] sm:min-h-[140px] ${
                          isSelected
                            ? 'bg-[#FAF9F5] border-2 border-black shadow-[3px_3px_0px_#000] -translate-y-0.5 z-10'
                            : 'bg-[#F0E9DC] border border-black/40 shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.15)] hover:bg-[#FAF8F2] opacity-90 hover:opacity-100'
                        }`}
                      >
                        {/* Selected Tag on Top Edge */}
                        {isSelected && (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-chiri-yellow text-black border border-black font-mono text-[6.5px] sm:text-[8px] font-black uppercase px-1 sm:px-2 py-0.5 shadow-[1px_1px_0px_#000] whitespace-nowrap">
                            SELECTED ASTROLOGER
                          </div>
                        )}

                        {/* Circular Avatar */}
                        <div className="relative my-0.5 flex-1 flex items-center justify-center mx-auto">
                          <div
                            className={`rounded-full border-2 border-black overflow-hidden flex items-center justify-center transition-transform duration-200 ${
                              isSelected
                                ? 'w-11 h-11 sm:w-16 sm:h-16 ring-2 ring-chiri-yellow'
                                : 'w-9 h-9 sm:w-14 sm:h-14'
                            }`}
                            style={{
                              background: isSelected ? '#FFE500' : '#E6DEC8',
                            }}
                          >
                            <UnniAvatar
                              astrologerId={a.id as AstrologerId}
                              expression={isSelected ? 'verdict' : 'idle'}
                              size="lg"
                              className="!w-full !h-full !shadow-none !border-0 !rounded-none"
                            />
                          </div>
                        </div>

                        {/* Character Name & Subtitle matching Mockup Text */}
                        <div className="w-full min-w-0 overflow-hidden px-0.5 text-center">
                          {a.id === 'unni' ? (
                            <div className="font-ml font-black text-[10px] sm:text-xs text-black leading-tight mt-1 text-center truncate">
                              ജ്യോത്സ്യൻ ഉണ്ണി
                            </div>
                          ) : (
                            <div className="font-ml font-black text-[10px] sm:text-xs text-black leading-tight mt-1 text-center truncate">
                              {a.name}
                            </div>
                          )}
                          <div className="font-ml text-[7.5px] sm:text-[9.5px] text-black/60 font-bold truncate mt-0.5 text-center">
                            {a.id === 'unni'
                              ? 'കവടി നിരത്തൽ & കോസ്മി...'
                              : a.id === 'kumbidi'
                              ? 'ലോക്കൽ മായാവി & സ്പിരിറ്റ്...'
                              : 'സാമുദ്രിക ശാസ്ത്രം &...'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Parchment Quote Box (Deckle-edge paper style from mockup) */}
            <div
              className="w-full max-w-full bg-[#FAF7EE] border border-black/35 shadow-[0_2px_6px_rgba(0,0,0,0.12)] p-2 sm:p-3 text-left relative mb-2"
              style={{
                clipPath:
                  'polygon(0% 2px, 3% 0px, 7% 3px, 12% 1px, 18% 3px, 24% 0px, 30% 2px, 36% 1px, 42% 3px, 48% 0px, 54% 2px, 60% 1px, 66% 3px, 72% 0px, 78% 2px, 84% 1px, 90% 3px, 96% 0px, 100% 2px, 100% calc(100% - 2px), 97% 100%, 92% calc(100% - 3px), 86% calc(100% - 1px), 80% calc(100% - 3px), 74% 100%, 68% calc(100% - 2px), 62% calc(100% - 1px), 56% calc(100% - 3px), 50% 100%, 44% calc(100% - 2px), 38% calc(100% - 3px), 32% calc(100% - 1px), 26% calc(100% - 3px), 20% 100%, 14% calc(100% - 2px), 8% calc(100% - 1px), 3% calc(100% - 3px), 0% 100%, 1px 90%, 3px 80%, 0px 70%, 2px 60%, 1px 50%, 3px 40%, 0px 30%, 2px 20%, 1px 10%)',
              }}
            >
              <div className="flex items-start gap-2 sm:gap-2.5">
                <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border border-black overflow-hidden shrink-0 bg-[#FFE500] mt-0.5">
                  <UnniAvatar
                    astrologerId={currentAstrologer.id as AstrologerId}
                    expression="idle"
                    className="!w-full !h-full !shadow-none !border-0 !rounded-none"
                  />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="font-ml text-[9.5px] sm:text-[11px] text-black/75 font-bold truncate">
                    {currentAstrologer.name} പറയുന്നു:
                  </div>
                  <p className="font-ml font-bold text-[11px] sm:text-sm text-black leading-snug mt-0.5 line-clamp-2 break-words">
                    "{currentAstrologer.tagline}"
                  </p>
                </div>
              </div>
            </div>

            {/* Typewriter Dynamic Tagline Box (Clean White Box from Mockup) */}
            <div className="w-full max-w-full bg-white border-2 border-black shadow-[2px_2px_0px_#000] py-1.5 sm:py-2 px-2 sm:px-3 flex items-center justify-center min-h-[34px] sm:min-h-[38px] mb-2 sm:mb-3">
              <p className="font-ml font-black text-[11px] sm:text-sm text-black leading-snug text-center truncate">
                "{tagline}
                <span className="inline-block w-0.5 h-3.5 bg-black ml-0.5 animate-pulse" />
                "
              </p>
            </div>

            {/* HERO CTA BUTTON (Big Yellow Brutalist Button from Mockup) */}
            <div className="w-full max-w-full">
              <button
                onClick={handleStart}
                className="w-full py-2.5 sm:py-3.5 px-4 sm:px-6 bg-chiri-yellow hover:bg-black hover:text-chiri-yellow text-black border-3 border-black font-black font-ml text-xs sm:text-base md:text-lg tracking-wide uppercase cursor-pointer flex items-center justify-center gap-2 shadow-[4px_4px_0px_#000] active:translate-x-1 active:translate-y-1 transition-all"
                style={{
                  animation: showPulse ? 'btnWiggle 0.5s ease' : 'none',
                }}
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3] fill-current shrink-0" />
                <span className="truncate">
                  {mockMode === 'MOVIE'
                    ? 'തുടങ്ങാം (START ROAST)'
                    : `തുടങ്ങാം (${currentAstrologer.name.split(' ')[0]}യുടെ ജാതകം)`}
                </span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3] shrink-0" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

