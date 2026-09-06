import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSmileStore } from '@/store/useSmileStore';
import { DETECTION_CONFIG } from '@/config/detectionConfig';
import { Volume2, VolumeX, AlertTriangle, Play, XCircle } from 'lucide-react';

export const MockDisplay: React.FC = () => {
  const {
    currentMockVideo,
    currentMockLine,
    isPlayingMock,
    smileScore,
    smileIntensity,
    voiceEnabled,
    finishMockPlayback,
  } = useSmileStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);

  // Trigger SpeechSynthesis for Malayalam mock lines if enabled
  const speakMockCaption = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      // Try finding Malayalam or Indian English voice
      const voices = window.speechSynthesis.getVoices();
      const mlVoice = voices.find((v) => v.lang.startsWith('ml') || v.lang.includes('IN'));
      if (mlVoice) {
        utterance.voice = mlVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis unavailable:', e);
    }
  }, []);

  // Handle new mock video trigger & auto-dismiss safety timer
  useEffect(() => {
    if (!isPlayingMock || !currentMockVideo) {
      setVideoError(false);
      setAutoplayBlocked(false);
      return;
    }

    setVideoError(false);
    setAutoplayBlocked(false);

    // Speak caption if voice is enabled
    if (voiceEnabled) {
      const captionText = currentMockLine?.malayalam || currentMockVideo.caption;
      speakMockCaption(captionText);
    }

    // Programmatic play
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video
        .play()
        .then(() => {
          setAutoplayBlocked(false);
        })
        .catch((err) => {
          console.warn('Autoplay blocked or awaiting interaction:', err);
          setAutoplayBlocked(true);
        });
    }

    // Auto-dismiss safety timer: Ensures mock returns to surveillance even if video file is absent
    const autoDismissTimer = setTimeout(() => {
      finishMockPlayback();
    }, DETECTION_CONFIG.mockDisplayDurationMs);

    return () => {
      clearTimeout(autoDismissTimer);
    };
  }, [isPlayingMock, currentMockVideo, currentMockLine, voiceEnabled, speakMockCaption, finishMockPlayback]);

  const handleVideoEnded = () => {
    finishMockPlayback();
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  const handleManualPlay = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.play().catch(() => {});
      setAutoplayBlocked(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // Standby State: No active mock
  if (!isPlayingMock || !currentMockVideo) {
    return (
      <div className="bg-white border-4 border-police-black shadow-brutal p-4 flex flex-col justify-between min-h-[260px]">
        <div className="border-b-4 border-police-black pb-2 flex items-center justify-between">
          <h2 className="text-sm font-heading font-black uppercase text-police-black tracking-wide">
            MOCK DISPATCH CONSOLE // RETALIATION RADAR
          </h2>
          <span className="text-[10px] font-mono font-bold bg-police-bg px-2 py-0.5 border-2 border-police-black text-police-muted uppercase">
            RADAR ACTIVE
          </span>
        </div>

        <div className="my-6 border-4 border-dashed border-police-black/30 p-8 flex flex-col items-center justify-center text-center bg-police-bg/50">
          <div className="w-12 h-12 bg-white border-2 border-police-black shadow-brutal-sm flex items-center justify-center text-police-black mb-3 font-mono font-black text-xl">
            😐
          </div>
          <h3 className="text-base font-heading font-black uppercase text-police-black tracking-wide">
            NO ACTIVE MOCK DEPLOYED
          </h3>
          <p className="text-xs text-police-muted font-mono mt-1 max-w-sm">
            SYSTEM PATROLLING FEED FOR ILLEGAL SMILES. COMMENCE SMILING TO PROVOKE RETALIATORY MOCK INTERROGATION.
          </p>
        </div>

        <div className="text-[10px] font-mono text-police-muted flex items-center justify-between border-t-2 border-police-black pt-2">
          <span>MALAYALAM ROAST DATASET: 45 ENTRIES ARMED</span>
          <span>AUTONOMOUS DISPATCH: ON</span>
        </div>
      </div>
    );
  }

  // Active Mock Incident State
  const intensityUpper = (currentMockVideo.intensity || smileIntensity).toUpperCase();
  const captionMl = currentMockLine?.malayalam || currentMockVideo.caption;
  const captionTranslit = currentMockLine?.transliteration || currentMockVideo.transliteration;
  const characterName = currentMockVideo.character || 'SPECIAL INVESTIGATOR';

  return (
    <div className="bg-white border-4 border-police-black shadow-brutal flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Red Alert Header */}
      <div className="bg-police-red text-white p-3 border-b-4 border-police-black flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 animate-bounce" />
          <span className="text-sm font-heading font-black uppercase tracking-wider">
            🚨 SMILE DETECTED // RETALIATION VIDEO DEPLOYED
          </span>
        </div>
        <button
          onClick={finishMockPlayback}
          className="bg-police-black text-white hover:bg-white hover:text-police-black border-2 border-white px-2 py-0.5 text-xs font-bold uppercase transition-colors flex items-center gap-1"
        >
          <XCircle className="w-3.5 h-3.5" />
          DISMISS
        </button>
      </div>

      {/* Video Display Area */}
      <div className="relative bg-police-terminal aspect-video w-full flex items-center justify-center overflow-hidden border-b-4 border-police-black">
        {/* Actual Video Playback */}
        {!videoError ? (
          <video
            ref={videoRef}
            src={currentMockVideo.src}
            autoPlay
            playsInline
            muted={isMuted}
            onEnded={handleVideoEnded}
            onError={handleVideoError}
            className="w-full h-full object-contain"
          />
        ) : (
          /* Animated Brutalist Mock Fallback (Displays if video file hasn't been added to /public/mocks/) */
          <div className="p-6 flex flex-col items-center justify-center text-center max-w-lg bg-police-yellow border-4 border-police-black shadow-brutal text-police-black m-4">
            <div className="bg-police-black text-white text-[10px] font-bold px-2 py-0.5 mb-2 uppercase tracking-widest">
              POLICE RECORDING TAPE #{currentMockVideo.id.toUpperCase()}
            </div>
            <div className="text-2xl md:text-3xl font-heading font-black uppercase mb-1">
              "{captionMl}"
            </div>
            <div className="text-xs font-mono font-bold text-police-black/80 italic mb-3">
              "{captionTranslit}"
            </div>
            <div className="text-[11px] font-mono bg-white border-2 border-police-black px-3 py-1 uppercase font-bold text-police-red">
              EVIDENCE FILED BY: {characterName}
            </div>
          </div>
        )}

        {/* Video Overlay Controls */}
        <div className="absolute top-2 right-2 flex items-center gap-2">
          {autoplayBlocked && (
            <button
              onClick={handleManualPlay}
              className="bg-police-yellow text-police-black border-2 border-police-black px-2 py-1 text-xs font-bold uppercase shadow-brutal-sm flex items-center gap-1 animate-pulse"
            >
              <Play className="w-3.5 h-3.5" /> UNMUTE & PLAY
            </button>
          )}
          <button
            onClick={toggleMute}
            className="bg-police-black/90 text-white hover:bg-police-yellow hover:text-police-black border border-white p-1.5 text-xs transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Scanlines overlay on video */}
        <div className="absolute inset-0 scanline-overlay pointer-events-none" />
      </div>

      {/* Caption & Malayalam Roasting Banner */}
      <div className="p-4 bg-police-yellow border-b-4 border-police-black flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-police-black">
          <span className="bg-police-black text-police-yellow px-1.5 py-0.5 border border-police-black">
            OFFICER IN CHARGE: {characterName}
          </span>
          <span className="text-police-red font-black">CATEGORY: {intensityUpper}</span>
        </div>

        {/* Malayalam Caption in Large Typography */}
        <div className="text-xl md:text-2xl font-black text-police-black tracking-tight mt-1 leading-snug">
          {captionMl}
        </div>

        {/* English Transliteration & Meaning */}
        <div className="text-xs font-mono font-bold text-police-black/80 italic">
          {captionTranslit}
        </div>
        {currentMockLine?.englishMeaning && (
          <div className="text-[11px] font-mono text-police-muted mt-0.5">
            Translation: "{currentMockLine.englishMeaning}"
          </div>
        )}
      </div>

      {/* Forensic Report Footer */}
      <div className="p-3 bg-white flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-bold">
        <div>
          <span className="text-police-muted uppercase">TRIGGER SMILE LEVEL: </span>
          <span className="text-police-red font-black text-sm">{Math.round(smileScore)}%</span>
        </div>
        <div>
          <span className="text-police-muted uppercase">CLASSIFICATION: </span>
          <span className="text-police-black uppercase font-black">{intensityUpper}</span>
        </div>
        <button
          onClick={finishMockPlayback}
          className="px-3 py-1 bg-police-black text-white hover:bg-police-yellow hover:text-police-black border-2 border-police-black uppercase font-bold text-xs shadow-brutal-sm transition-transform active:translate-x-0.5 active:translate-y-0.5"
        >
          RETURN TO SURVEILLANCE
        </button>
      </div>
    </div>
  );
};
