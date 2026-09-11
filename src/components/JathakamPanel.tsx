import React, { useEffect } from 'react';
import { useSmileStore } from '@/store/useSmileStore';
import {
  RotateCcw,
  Share2,
  Smile,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Camera,
  Sparkles,
  Volume2,
  UserCheck,
} from 'lucide-react';
import { UnniAvatar } from '@/components/UnniAvatar';
import { getAstrologerById } from '@/data/jyothishamData';
import { stopAstroIntroAudio } from '@/utils/astroAudio';

interface JathakamPanelProps {
  onStartCamera?: () => void;
  stream?: MediaStream | null;
}

export const JathakamPanel: React.FC<JathakamPanelProps> = ({ onStartCamera, stream }) => {
  const {
    appPhase,
    cameraEnabled,
    cameraLoading,
    cameraError,
    scanProgress,
    scanMessage,
    currentJathakam,
    smileScore,
    faceDetected,
    multipleFacesDetected,
    resetForNewReading,
    startScanSequence,
    setShareCardOpen,
    smileReactionToast,
    selectedAstrologerId,
    selectNextAstrologer,
    isAstrologerSwitching,
  } = useSmileStore();

  const roundedSmile = Math.round(smileScore);
  const isSmilingNow = roundedSmile >= 45;

  const currentAstrologer = getAstrologerById(selectedAstrologerId);

  // Cleanup any active intro audio on unmount
  useEffect(() => {
    return () => {
      stopAstroIntroAudio();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // 0. ASTROLOGER SWITCHING LOADING OVERLAY / VIEW
  // ---------------------------------------------------------------------------
  if (isAstrologerSwitching) {
    return (
      <div className="border-3 border-black bg-white p-4 sm:p-6 shadow-[4px_4px_0px_#000] h-full flex flex-col items-center justify-center select-none text-center relative overflow-hidden">
        {/* Dynamic decorative backdrop badge */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-chiri-yellow/30 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
          {/* Pulsing Avatar with golden brutalist ring */}
          <div className="relative animate-bounce">
            <UnniAvatar
              astrologerId={selectedAstrologerId}
              expression="scanning"
              size="xl"
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-chiri-yellow text-[9px] font-mono font-bold px-2 py-0.5 border border-black shadow-[2px_2px_0px_#FFE500]">
              LOADING ASTROLOGER...
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-mono text-xs font-black uppercase text-black/60 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-chiri-red animate-spin" />
              <span>ജ്യോത്സ്യൻ മാറുന്നു</span>
            </div>
            <h2 className="font-ml font-black text-lg sm:text-2xl text-black">
              {currentAstrologer.name}
            </h2>
            <p className="font-ml font-bold text-xs sm:text-sm text-black/70">
              {currentAstrologer.movieTitle}
            </p>
          </div>

          {/* Tagline / Introduction Quote Box */}
          <div className="bg-[#FAF8F5] border-2 border-black p-3.5 shadow-[3px_3px_0px_#000] w-full mt-2">
            <div className="font-ml font-black text-xs text-chiri-red mb-1">
              🎙️ {currentAstrologer.name} പറയുന്നു:
            </div>
            <p className="font-ml font-bold text-xs sm:text-sm text-black leading-snug">
              "{currentAstrologer.waitingQuote}"
            </p>
          </div>

          {/* Animated Brutalist Loading Bar */}
          <div className="w-full h-3 bg-[#E5E5DE] border-2 border-black overflow-hidden p-0.5 mt-2">
            <div
              className="h-full bg-chiri-yellow border border-black w-full animate-pulse"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #FFE500, #FFE500 8px, #000 8px, #000 12px)',
              }}
            />
          </div>

          <p className="font-ml text-[11px] text-black/60 font-bold">
            ഓഡിയോ ലോഡ് ചെയ്യുന്നു... കാത്തിരിക്കൂ!
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 1. WAITING_FACE Phase (Astrologer Waiting for Client)
  // ---------------------------------------------------------------------------
  if (appPhase === 'WAITING_FACE' || (!currentJathakam && appPhase !== 'SCANNING')) {
    let characterDialogue: string;
    let statusBadgeText: string;
    let statusBadgeColor: string;

    if (!cameraEnabled) {
      statusBadgeText = 'ക്യാമറ ഓഫ് ആണ്';
      statusBadgeColor = 'bg-black text-white';
      characterDialogue =
        selectedAstrologerId === 'kumbidi'
          ? 'ആയുഷ്മാൻ ഭവ! ക്യാമറ ഓൺ ചെയ്യൂ ഭക്താ... നിന്റെ ജാതകത്തിൽ ഒരു കോസ്മിക് സംഭവം കാണുന്നുണ്ട്, പക്ഷേ മുഖം കാണാതെ നോക്കിയാൽ ഫീസ് ഇരട്ടിയാകും!'
          : selectedAstrologerId === 'yeshu'
          ? 'ക്യാമറ ഓൺ ചെയ്യടോ മനുഷ്യാ! ഗ്രഹനില ഞാൻ നോക്കി കഴിഞ്ഞു... പ്രശ്നം ഗ്രഹങ്ങൾക്കല്ല, നിന്റെ ക്യാമറയ്ക്കാണ്!'
          : 'ക്യാമറ ഓൺ ചെയ്യടോ മനുഷ്യാ... നിന്റെ മുഖം കാണാതെ ഞാൻ എങ്ങനെ സാമുദ്രിക ശാസ്ത്രം അളക്കും?!';
    } else if (cameraLoading) {
      statusBadgeText = 'ക്യാമറ ആരംഭിക്കുന്നു...';
      statusBadgeColor = 'bg-chiri-yellow text-black';
      characterDialogue = 'ക്യാമറ പരിശോധിക്കുന്നു... ഒരല്പം ക്ഷമിക്കൂ മനുഷ്യാ!';
    } else if (cameraError) {
      statusBadgeText = 'ക്യാമറ കിട്ടിയില്ല';
      statusBadgeColor = 'bg-chiri-red text-white';
      characterDialogue = 'ക്യാമറ കാണുന്നില്ലല്ലോ! എനിക്ക് നിന്റെ മുഖം കാണാതെ എങ്ങനെ ജാതകം പറയാൻ പറ്റും?!';
    } else if (multipleFacesDetected) {
      statusBadgeText = 'ഒരാൾ മാത്രം മതി!';
      statusBadgeColor = 'bg-chiri-red text-white';
      characterDialogue =
        selectedAstrologerId === 'kumbidi'
          ? 'ആയുഷ്മാൻ ഭവ! ഇവിടെ ശുക്രൻ കൺഫ്യൂസ്ഡ് ആണ്! രണ്ടുപേരെ ഒരുമിച്ച് നോക്കാൻ എന്റെ കോസ്മിക് കാൽക്കുലേറ്ററിന് ശേഷിയില്ല! ഒരാൾ മാത്രം വാ!'
          : selectedAstrologerId === 'yeshu'
          ? 'ഹേയ്! ഇത് ഗ്രൂപ്പ് ഫോട്ടോ എടുക്കലല്ല! ഒരാൾ മാത്രം മുന്നോട്ട് വാ, ബാക്കിയുള്ളവർ നിൽക്ക്!'
          : 'ഇത് സാധാരണ കാര്യമല്ല... രണ്ടുപേരുടെ തലവര ഒരുമിച്ച് കണ്ടാൽ കവടിയിൽ ഷോർട്ട് സർക്യൂട്ട് വരും! ഒരാൾ മാത്രം മുന്നോട്ട് വാ!';
    } else if (faceDetected) {
      statusBadgeText = 'മുഖം കണ്ടെത്തി • തയാർ';
      statusBadgeColor = 'bg-chiri-yellow text-black';
      characterDialogue = currentAstrologer.lookingQuote;
    } else {
      statusBadgeText = 'മുഖം തിരയുന്നു...';
      statusBadgeColor = 'bg-[#E5E5DE] text-black';
      characterDialogue = currentAstrologer.waitingQuote;
    }

    return (
      <div className="border-3 border-black bg-white p-3 sm:p-5 shadow-[4px_4px_0px_#000] h-full flex flex-col justify-between select-none">
        {/* Top Header Strip */}
        <div className="border-b-2 border-black pb-2 flex items-center justify-between font-mono text-xs font-black uppercase">
          <span className="flex items-center gap-1.5 text-black">
            <span className="w-2.5 h-2.5 bg-chiri-yellow border border-black" />
            <span className="font-ml text-xs font-black">{currentAstrologer.name}</span>
          </span>

          <div className="flex items-center gap-2">
            {/* Switch Astrologer Button */}
            <button
              onClick={selectNextAstrologer}
              className="bg-chiri-yellow hover:bg-black hover:text-chiri-yellow text-black border border-black px-2 py-0.5 shadow-[1px_1px_0px_#000] text-[10px] font-ml font-black cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1"
              title="വേറെ ജ്യോത്സ്യനെ കാണൂ"
            >
              <UserCheck className="w-3 h-3" />
              <span>അടുത്ത ജ്യോത്സ്യൻ (NEXT)</span>
            </button>

            <span className={`${statusBadgeColor} px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000] text-[10px] font-ml font-bold`}>
              {statusBadgeText}
            </span>
          </div>
        </div>

        {/* Center: Astrologer Profile on the Left + Circular Live Camera Feed next to it */}
        <div className="flex flex-col items-center justify-center text-center my-auto py-3 max-w-md mx-auto w-full">
          {/* Dual Avatars Row: Astrologer (Left) + Circular Live Camera Feed (Right) */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3">
            {/* 1. Astrologer Profile (shifted to the left) */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <UnniAvatar
                  astrologerId={selectedAstrologerId}
                  expression={
                    multipleFacesDetected
                      ? 'shocked'
                      : faceDetected
                      ? 'verdict'
                      : !cameraEnabled
                      ? 'idle'
                      : 'scanning'
                  }
                  size="lg"
                />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-chiri-yellow text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
                  ASTROLOGER
                </div>
              </div>
            </div>

            {/* VS / Divider Icon */}
            <div className="font-mono font-black text-xs text-black/40">
              ⚡
            </div>

            {/* 2. Circular Camera Feed (Same circular size as Astrologer Profile) */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="relative rounded-full border-3 border-black bg-black shadow-[3px_3px_0px_#000000] overflow-hidden shrink-0 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28">
                  {cameraEnabled && stream && stream.active ? (
                    <video
                      ref={(el) => {
                        if (el && el.srcObject !== stream) {
                          el.srcObject = stream;
                          el.muted = true;
                          el.playsInline = true;
                          el.play().catch(() => {});
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      style={{ transform: 'scaleX(-1)' }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1 text-white p-2">
                      <Camera className="w-5 h-5 text-chiri-yellow animate-pulse" />
                      <span className="font-mono text-[8px] text-center font-bold text-white/70 leading-tight">
                        {cameraLoading ? 'STARTING...' : 'CAM OFF'}
                      </span>
                    </div>
                  )}

                  {/* Face indicator ring border inside circle */}
                  {faceDetected && (
                    <div className="absolute inset-0 rounded-full border-2 border-chiri-yellow pointer-events-none animate-pulse" />
                  )}
                </div>

                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-chiri-yellow text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
                  {faceDetected ? 'FACE LOCKED' : cameraEnabled ? 'YOUR FACE' : 'CAM OFF'}
                </div>
              </div>
            </div>
          </div>

          {/* Character Identity */}
          <div className="font-ml font-black text-base sm:text-xl text-black leading-tight">
            {currentAstrologer.name}
          </div>
          <div className="font-ml text-xs text-black/70 font-bold tracking-tight mb-3">
            {currentAstrologer.movieTitle}
          </div>

          {/* Comic Speech Bubble */}
          <div className="relative bg-[#FAF8F5] border-2 border-black p-3.5 sm:p-4 shadow-[3px_3px_0px_#000] w-full text-left">
            {/* Bubble Arrow pointing to avatar */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FAF8F5] border-t-2 border-l-2 border-black rotate-45" />

            <div className="font-ml font-black text-xs text-chiri-red mb-1">
              🎙️ {currentAstrologer.name} പറയുന്നു:
            </div>
            <p className="font-ml font-bold text-xs sm:text-sm text-black leading-relaxed">
              "{characterDialogue}"
            </p>
          </div>

          {/* Action Buttons */}
          {!cameraEnabled ? (
            <button
              onClick={onStartCamera}
              className="mt-4 w-full py-2.5 sm:py-3 bg-chiri-yellow hover:bg-black hover:text-chiri-yellow text-black border-2 border-black font-ml font-black text-xs sm:text-sm uppercase shadow-[3px_3px_0px_#000] cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span>ക്യാമറ ഓൺ ചെയ്യൂ (START)</span>
            </button>
          ) : faceDetected && !multipleFacesDetected ? (
            <button
              onClick={startScanSequence}
              className="mt-4 w-full py-2.5 sm:py-3 bg-chiri-yellow hover:bg-black hover:text-chiri-yellow text-black border-2 border-black font-ml font-black text-xs sm:text-sm uppercase shadow-[3px_3px_0px_#000] cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>ജാതകം പറയൂ (CONSULT NOW)</span>
              <span className="font-mono">→</span>
            </button>
          ) : (
            <p className="mt-3 font-ml font-bold text-xs text-black/60">
              ക്യാമറയിലേക്ക് നോക്കൂ. മുഖഭാവം നോക്കി {currentAstrologer.name} ജാതകം പറയും.
            </p>
          )}
        </div>

        {/* Bottom Status Bar with Astrologer Switch Shortcut */}
        <div className="border-t-2 border-black/20 pt-2 flex items-center justify-between font-ml text-[11px] text-black/70 font-bold">
          <span>ചിരി നില: {roundedSmile}%</span>
          <button
            onClick={selectNextAstrologer}
            className="text-chiri-red hover:underline cursor-pointer font-black"
          >
            ജ്യോത്സ്യനെ മാറ്റുക 🔄
          </button>
          <span>ദക്ഷിണ: ₹101</span>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. SCANNING Phase (Astrologer Examining Face & Calculating Destiny)
  // ---------------------------------------------------------------------------
  if (appPhase === 'SCANNING') {
    return (
      <div className="border-3 border-black bg-white p-3 sm:p-5 shadow-[4px_4px_0px_#000] h-full flex flex-col justify-between select-none">
        {/* Top Header */}
        <div className="border-b-2 border-black pb-2 flex items-center justify-between font-mono text-xs font-black uppercase">
          <span className="flex items-center gap-1.5 text-chiri-red animate-pulse">
            <Volume2 className="w-4 h-4 text-chiri-red" />
            <span className="font-ml text-xs font-black">
              {currentAstrologer.name} മുഖം നോക്കുന്നു...
            </span>
          </span>
          <span className="bg-black text-chiri-yellow px-2 py-0.5 font-mono">
            {scanProgress}%
          </span>
        </div>

        {/* Center Scanning Action: Astrologer (Left) + Circular Live Camera Feed (Right) */}
        <div className="my-auto flex flex-col items-center gap-3 py-2 max-w-md mx-auto w-full">
          {/* Dual Avatars Row */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-1">
            {/* 1. Scanning Astrologer Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <UnniAvatar
                  astrologerId={selectedAstrologerId}
                  expression="scanning"
                  size="lg"
                />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-chiri-yellow text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
                  ASTROLOGER
                </div>
              </div>
            </div>

            {/* Scanning radar indicator */}
            <div className="font-mono font-black text-xs text-chiri-red animate-pulse">
              ⚡
            </div>

            {/* 2. Circular Camera Feed (Same circular size as Astrologer Profile) */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="relative rounded-full border-3 border-black bg-black shadow-[3px_3px_0px_#000000] overflow-hidden shrink-0 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28">
                  {cameraEnabled && stream && stream.active ? (
                    <video
                      ref={(el) => {
                        if (el && el.srcObject !== stream) {
                          el.srcObject = stream;
                          el.muted = true;
                          el.playsInline = true;
                          el.play().catch(() => {});
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      style={{ transform: 'scaleX(-1)' }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1 text-white p-2">
                      <Camera className="w-5 h-5 text-chiri-yellow animate-pulse" />
                      <span className="font-mono text-[8px] text-center font-bold text-white/70 leading-tight">
                        SCANNING...
                      </span>
                    </div>
                  )}

                  {/* Pulsing scanning border */}
                  <div className="absolute inset-0 rounded-full border-2 border-chiri-yellow animate-ping opacity-40 pointer-events-none" />
                </div>

                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-chiri-yellow text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
                  FACE SCAN {scanProgress}%
                </div>
              </div>
            </div>
          </div>

          {/* Live Commentary Box */}
          <div className="relative bg-[#FAF8F5] border-2 border-black p-3.5 sm:p-4 shadow-[3px_3px_0px_#000] w-full text-center">
            {/* Arrow */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FAF8F5] border-t-2 border-l-2 border-black rotate-45" />

            <div className="font-ml text-[10px] text-black/60 font-bold mb-1">
              മുഖപരിശോധന • പുരോഗതി {scanProgress}%
            </div>

            <div className="font-ml font-black text-xs sm:text-base text-black leading-snug min-h-[2.5rem] flex items-center justify-center">
              "{scanMessage}"
            </div>

            {/* Brutalist Striped Progress Bar */}
            <div className="w-full h-3.5 bg-[#E5E5DE] border-2 border-black overflow-hidden p-0.5 mt-2.5">
              <div
                className="h-full bg-chiri-yellow border border-black transition-all duration-150"
                style={{
                  width: `${scanProgress}%`,
                  backgroundImage:
                    'repeating-linear-gradient(45deg, #FFE500, #FFE500 8px, #000 8px, #000 12px)',
                }}
              />
            </div>
          </div>

          {/* Fake Astrological Biometrics Preview */}
          <div className="grid grid-cols-2 gap-1.5 font-ml text-xs text-black w-full font-bold">
            <div className="border border-black p-1.5 bg-[#FAF8F5] flex justify-between">
              <span className="text-black/60">ശനി ഗ്രഹം:</span>
              <span className="font-black text-chiri-red animate-pulse">തലയിൽ</span>
            </div>
            <div className="border border-black p-1.5 bg-[#FAF8F5] flex justify-between">
              <span className="text-black/60">ഗൗരവ നില:</span>
              <span className="font-mono">{Math.min(108, scanProgress + 8)}/108</span>
            </div>
            <div className="border border-black p-1.5 bg-[#FAF8F5] flex justify-between">
              <span className="text-black/60">മടി സൂചിക:</span>
              <span className="font-mono text-chiri-red">99.4%</span>
            </div>
            <div className="border border-black p-1.5 bg-[#FAF8F5] flex justify-between">
              <span className="text-black/60">ജാതകം:</span>
              <span>എഴുതുന്നു...</span>
            </div>
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="border-t-2 border-black/20 pt-2 font-ml text-xs text-black/60 text-center font-bold">
          അനങ്ങാതെ നിൽക്കൂ • {currentAstrologer.name} മുഖം നോക്കുന്നു
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. RESULT Phase — Full Unni Namboothiri Horoscope Chamber (Talking at Center)
  // ---------------------------------------------------------------------------
  if (!currentJathakam) return null;

  const {
    archetype,
    career,
    money,
    love,
    luck,
    future,
    unniSpeech,
    unniDosham,
    unniRemedy,
    unniDakshina,
    smileMoodMl,
    fakeMetrics,
  } = currentJathakam;

  const activeAstrologerSpeech =
    selectedAstrologerId === 'kumbidi' && archetype.kumbidiRoastMl
      ? archetype.kumbidiRoastMl
      : selectedAstrologerId === 'yeshu' && archetype.yeshuRoastMl
      ? archetype.yeshuRoastMl
      : unniSpeech;

  return (
    <div className="border-3 border-black bg-white shadow-[4px_4px_0px_#000] h-full flex flex-col justify-between overflow-hidden select-none relative">
      
      {/* Dynamic Smile Reaction Toast from Unni */}
      {smileReactionToast && (
        <div className="absolute top-2 inset-x-2 z-40 bg-chiri-yellow text-black border-2 border-black p-2.5 shadow-[4px_4px_0px_#000] animate-in zoom-in-95 duration-150 flex items-start gap-2">
          <Smile className="w-4 h-4 text-chiri-red fill-chiri-red shrink-0 mt-0.5" />
          <span className="font-ml font-bold text-xs leading-snug block">
            {smileReactionToast}
          </span>
        </div>
      )}

      {/* Header Strip: Astrologer Banner */}
      <div className="border-b-2 border-black bg-black text-white px-3 py-1.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 font-ml font-bold text-xs sm:text-sm text-chiri-yellow">
          <span>🔮</span>
          <span>{currentAstrologer.name} ഫലം</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={selectNextAstrologer}
            className="bg-chiri-yellow text-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_#FFE500] text-[10px] font-ml font-black cursor-pointer hover:bg-white active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1"
          >
            <UserCheck className="w-3 h-3" />
            <span>അടുത്ത ജ്യോത്സ്യൻ (NEXT)</span>
          </button>
          <div className="font-ml text-[10px] font-bold text-white/80 bg-white/10 px-2 py-0.5 border border-white/20">
            ഭാവം: {smileMoodMl}
          </div>
        </div>
      </div>

      {/* Main Jathakam Scrollable Container */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-3 flex flex-col gap-2">
        
        {/* 1. Center Stage: Astrologer Character Talking at the Center + Circular Camera Feed! */}
        <div className="bg-[#FAF8F5] border-2 border-black p-3 sm:p-5 shadow-[3px_3px_0px_#000] flex flex-col items-center text-center w-full max-w-xl mx-auto">
          {/* Dual Avatars Row: Astrologer (Left) + Circular Camera Feed (Right) */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
            {/* 1. Astrologer Profile (shifted a little left) */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <UnniAvatar
                  astrologerId={selectedAstrologerId}
                  expression={isSmilingNow ? 'shocked' : 'verdict'}
                  size="xl"
                />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-chiri-yellow text-[9px] font-ml font-bold px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
                  {selectedAstrologerId === 'kumbidi'
                    ? 'ആയുഷ്മാൻ ഭവ!'
                    : selectedAstrologerId === 'yeshu'
                    ? 'ജാമ്പവാന്റെ സാക്ഷ്യം'
                    : 'കവടി സാക്ഷ്യം'}
                </div>
              </div>
            </div>

            {/* VS / Divider Icon */}
            <div className="font-mono font-black text-xs text-black/40">
              ⚡
            </div>

            {/* 2. Circular Camera Feed (Same circular size as Astrologer Profile) */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="relative rounded-full border-3 border-black bg-black shadow-[3px_3px_0px_#000000] overflow-hidden shrink-0 flex items-center justify-center w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32">
                  {cameraEnabled && stream && stream.active ? (
                    <video
                      ref={(el) => {
                        if (el && el.srcObject !== stream) {
                          el.srcObject = stream;
                          el.muted = true;
                          el.playsInline = true;
                          el.play().catch(() => {});
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      style={{ transform: 'scaleX(-1)' }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1 text-white p-2">
                      <Camera className="w-5 h-5 text-chiri-yellow" />
                      <span className="font-mono text-[8px] text-center font-bold text-white/70 leading-tight">
                        YOUR FACE
                      </span>
                    </div>
                  )}

                  {/* Face indicator ring */}
                  {faceDetected && (
                    <div className="absolute inset-0 rounded-full border-2 border-chiri-yellow pointer-events-none" />
                  )}
                </div>

                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-chiri-yellow text-[9px] font-mono font-bold px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
                  {isSmilingNow ? 'SMILE DETECTED' : 'YOUR FACE'}
                </div>
              </div>
            </div>
          </div>

          {/* Centered Astrologer Identity */}
          <h2 className="font-ml font-black text-base sm:text-xl text-black leading-tight mt-1">
            {currentAstrologer.name}
          </h2>
          <p className="font-ml text-xs text-black/70 font-bold tracking-tight">
            {currentAstrologer.movieTitle}
          </p>

          {/* Archetype & Luck Badge */}
          <div className="mt-2 bg-chiri-yellow border border-black px-3 py-1 flex items-center justify-center gap-2 shadow-[1px_1px_0px_#000]">
            <span className="font-ml text-xs font-black text-black">
              മുഖലക്ഷണം: {archetype.nameMl}
            </span>
            <span className="text-black/40">•</span>
            <span className="font-mono text-xs font-black text-black">
              ഭാഗ്യം: {luck}%
            </span>
          </div>

          {/* Centered Comic Speech Bubble Emanating directly from Astrologer */}
          <div className="relative bg-white border-2 border-black p-3 sm:p-4 shadow-[2px_2px_0px_#000] w-full mt-3 text-center">
            {/* Triangular arrow pointing directly up to Avatar */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t-2 border-l-2 border-black rotate-45" />

            <div className="border-b border-black/15 pb-1.5 mb-2 font-ml font-black text-xs text-chiri-red">
              🎙️ {currentAstrologer.name} പറയുന്നു:
            </div>

            <p className="font-ml font-black text-sm sm:text-base text-black leading-relaxed">
              "{activeAstrologerSpeech}"
            </p>
          </div>
        </div>

        {/* 2. Astrological Dosham Diagnosis Warning Box */}
        <div className="border-2 border-black p-2 bg-[#FFF4F4] flex items-start gap-1.5">
          <AlertTriangle className="w-4 h-4 text-chiri-red shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="font-ml font-black text-[9px] sm:text-[10px] text-chiri-red block">
              പ്രധാന ഗ്രഹപ്പിഴ / ദോഷം:
            </span>
            <span className="font-ml font-bold text-xs sm:text-[13px] text-black leading-tight block">
              {unniDosham}
            </span>
          </div>
        </div>

        {/* 3. Core Prediction Grid (Career, Money, Love, Future) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-black font-ml">
          {/* Career */}
          <div className="border-2 border-black p-2 bg-[#FAF8F5]">
            <div className="font-bold text-[10px] sm:text-xs text-black/60">
              💼 തൊഴിൽ ഭാവി
            </div>
            <div className="font-bold text-xs sm:text-[13px] text-black leading-tight mt-0.5">
              {career}
            </div>
          </div>

          {/* Money */}
          <div className="border-2 border-black p-2 bg-[#FAF8F5]">
            <div className="font-bold text-[10px] sm:text-xs text-black/60">
              💰 ധനസ്ഥിതി
            </div>
            <div className="font-bold text-xs sm:text-[13px] text-black leading-tight mt-0.5">
              {money}
            </div>
          </div>

          {/* Love */}
          <div className="border-2 border-black p-2 bg-[#FAF8F5]">
            <div className="font-bold text-[10px] sm:text-xs text-black/60">
              ❤️ പ്രണയവും ദാമ്പത്യവും
            </div>
            <div className="font-bold text-xs sm:text-[13px] text-black leading-tight mt-0.5">
              {love}
            </div>
          </div>

          {/* Future */}
          <div className="border-2 border-black p-2 bg-[#FAF8F5]">
            <div className="font-bold text-[10px] sm:text-xs text-black/60">
              🔮 വരാനിരിക്കുന്ന വിധി
            </div>
            <div className="font-bold text-xs sm:text-[13px] text-black leading-tight mt-0.5">
              "{future}"
            </div>
          </div>
        </div>

        {/* 4. Astrologer's Emergency Remedy & Dakshina (Highlight Card) */}
        <div className="border-2 border-black p-2.5 bg-[#FFE500] shadow-[2px_2px_0px_#000] flex flex-col gap-1">
          <div className="flex items-center gap-1 font-ml text-[10px] font-black uppercase text-black">
            <Flame className="w-3 h-3 text-chiri-red" />
            <span>{currentAstrologer.name}യുടെ അടിയന്തര പരിഹാരം</span>
          </div>

          <div className="font-ml font-bold text-xs sm:text-sm text-black leading-snug">
            "{unniRemedy}"
          </div>

          <div className="border-t border-black/20 pt-1 mt-0.5 flex items-center justify-between text-[10px] font-ml font-bold">
            <span className="text-black/80">{unniDakshina}</span>
            <span className="text-black/60">പരിഹാരം: ഉടൻ ചെയ്യുക</span>
          </div>
        </div>

        {/* 5. Kavadi Biometrics */}
        <div className="border-2 border-black p-2 bg-[#FAF8F5]">
          <div className="flex items-center justify-between font-ml text-[9px] text-black/70 font-black border-b border-black/15 pb-1 mb-1">
            <span>ജ്യോതിഷ അളവുകോൽ</span>
            <span className="text-chiri-red">ശാസ്ത്രീയത: പൂജ്യം</span>
          </div>
          <div className="grid grid-cols-3 gap-1 font-ml text-[10px]">
            <div className="bg-white border border-black p-1 text-center font-bold">
              <span className="text-black/50 block text-[8px]">ഊർജ്ജം</span>
              <span className="font-mono">{fakeMetrics.faceEnergy}%</span>
            </div>
            <div className="bg-white border border-black p-1 text-center font-bold">
              <span className="text-black/50 block text-[8px]">നാടകം</span>
              <span className="font-mono">{fakeMetrics.dramaLevel}%</span>
            </div>
            <div className="bg-white border border-black p-1 text-center font-bold">
              <span className="text-black/50 block text-[8px]">മടി ലെവൽ</span>
              <span className="font-mono text-chiri-red">{fakeMetrics.procrastination}%</span>
            </div>
          </div>
        </div>

        {/* 6. Signature Stamp of (Dis)approval */}
        <div className="border border-black/30 p-1.5 bg-[#F5F5EF] text-center font-ml text-[10px] sm:text-[11px] text-black/80 font-bold leading-tight flex items-center justify-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
          <span>{currentAstrologer.disclaimer}</span>
        </div>
      </div>

      {/* Bottom Actions: Read Again, Next Astrologer & Save/Share Result */}
      <div className="border-t-3 border-black bg-white p-2 shrink-0 flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={resetForNewReading}
          className="flex-1 py-2 sm:py-2.5 bg-chiri-yellow hover:bg-black hover:text-chiri-yellow text-black border-2 border-black font-ml font-black text-xs sm:text-sm uppercase shadow-[2px_2px_0px_#000] cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[3]" />
          <span>വേറെ ആളെ നോക്കാം</span>
        </button>

        <button
          onClick={selectNextAstrologer}
          className="px-2.5 sm:px-3 py-2 sm:py-2.5 bg-[#FAF8F5] hover:bg-black hover:text-white text-black border-2 border-black font-ml font-black text-xs uppercase shadow-[2px_2px_0px_#000] cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1"
          title="അടുത്ത ജ്യോത്സ്യനിലേക്ക് മാറുക"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">അടുത്ത ജ്യോത്സ്യൻ</span>
          <span className="sm:hidden">NEXT</span>
        </button>

        <button
          onClick={() => setShareCardOpen(true)}
          className="px-3 py-2 sm:py-2.5 bg-white hover:bg-chiri-yellow text-black border-2 border-black font-ml font-black text-xs uppercase shadow-[2px_2px_0px_#000] cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1"
          title="ജാതക കാർഡ് പങ്കുവെക്കൂ"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>പങ്കുവെക്കൂ</span>
        </button>
      </div>
    </div>
  );
};
