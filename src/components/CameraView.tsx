import React, { useRef, useEffect, useState } from 'react';
import { useSmileStore } from '@/store/useSmileStore';
import { useSmileDetection } from '@/hooks/useSmileDetection';
import {
  Camera,
  RefreshCw,
  AlertTriangle,
  Play,
  Volume2,
  VolumeX,
  Timer,
  ReceiptText,
  Camera as SnapshotIcon,
} from 'lucide-react';
import { captureMemeSnapshot } from '@/utils/memeCapture';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  onStartCamera: () => void;
  onStopCamera: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  stream,
  onStartCamera,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayVideoRef = useRef<HTMLVideoElement | null>(null);
  const [videoPaused, setVideoPaused] = useState<boolean>(false);

  // Initialize MediaPipe smile detection hook
  useSmileDetection({ videoRef, canvasRef });

  const {
    cameraEnabled,
    cameraLoading,
    cameraError,
    cameraPermissionDenied,
    faceDetected,
    isSmiling,
    currentExpression,
    overlayVideoUrl,
    isOverlayVideoPlaying,
    overlayVideoMuted,
    mockStage,
    mockText,
    smileTypeMl,
    teethCount,
    smileScore,
    currentMockLine,
    isChallengeActive,
    seriousTimeSeconds,
    bestStreakSeconds,
    setCameraEnabled,
    toggleOverlayMuted,
    finishOverlayVideo,
    toggleChallengeMode,
    toggleFineReceipt,
  } = useSmileStore();

  // True live state: whether stream has active tracks or cameraEnabled is true
  const isCameraLive = Boolean((stream && stream.active) || cameraEnabled);

  // Handle overlay video autoplay and sound
  useEffect(() => {
    const el = overlayVideoRef.current;
    if (el && overlayVideoUrl && isOverlayVideoPlaying) {
      el.currentTime = 0;
      el.muted = overlayVideoMuted;
      el.volume = 1.0;
      el.play().catch((err) => {
        console.warn('[OVERLAY VIDEO AUTO-PLAY NOTICE]', err);
      });
    }
  }, [overlayVideoUrl, isOverlayVideoPlaying, overlayVideoMuted]);

  // Synchronize store cameraEnabled with active stream
  useEffect(() => {
    if (stream && stream.active && !cameraEnabled) {
      setCameraEnabled(true);
    }
  }, [stream, cameraEnabled, setCameraEnabled]);

  // Attach stream to video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!stream) {
      video.srcObject = null;
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    const startPlayback = () => {
      video.play().then(() => {
        setVideoPaused(false);
      }).catch((err: unknown) => {
        const error = err as Error;
        if (error.name !== 'AbortError') {
          console.warn('[CAMERA VIEW] Play notice:', error.message);
          setVideoPaused(true);
        }
      });
    };

    video.onloadedmetadata = startPlayback;
    video.onloadeddata = startPlayback;
    video.onpause = () => {
      if (stream && stream.active) setVideoPaused(true);
    };
    video.onplaying = () => setVideoPaused(false);

    if (video.readyState >= 2) {
      startPlayback();
    }
  }, [stream, videoRef]);

  const handleManualVideoPlay = () => {
    const video = videoRef.current;
    if (video) {
      video.play().then(() => setVideoPaused(false)).catch(() => {});
    }
  };

  const handleMemeSnapshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    const dialogue = currentMockLine?.malayalam || 'എന്താടാ ഇത്ര സന്തോഷം? ചിരി നിരോധിച്ചിരിക്കുന്നു!';
    captureMemeSnapshot(
      videoRef.current,
      dialogue,
      smileTypeMl,
      teethCount,
      smileScore
    );
  };

  const cameraStateLabel = isSmiling
    ? 'CHIRI DETECTED'
    : faceDetected
    ? 'LOCKED'
    : 'SEARCHING';

  return (
    <div className="relative w-full h-full min-h-0 bg-black border-3 border-black shadow-brutal overflow-hidden select-none flex items-center justify-center">
      {/* Underlying Webcam Video Element (Mirrored) */}
      <video
        ref={(el) => {
          (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
          if (el && stream && el.srcObject !== stream) {
            el.srcObject = stream;
            el.muted = true;
            el.defaultMuted = true;
            el.playsInline = true;
            el.play().catch(() => {});
          }
        }}
        playsInline
        muted
        style={{ transform: 'scaleX(-1)' }}
        className="absolute inset-0 w-full h-full object-cover z-0 block bg-black"
      />

      {/* HTML5 Forensic Canvas Overlay (Standard orientation, points mirrored in code so text renders properly) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 block"
      />

      {/* Stage 1: Prominent Brutalist Mock Text Overlay on Camera */}
      {isCameraLive && mockStage === 'text_mock' && mockText && (
        <div className="absolute inset-x-2 sm:inset-x-6 top-7 sm:top-14 z-25 pointer-events-none flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
          <div className="bg-chiri-yellow text-black border-2 sm:border-3 border-black p-2 sm:p-3 md:p-4 shadow-brutal max-w-md md:max-w-lg w-full text-center flex flex-col items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[9px] sm:text-xs font-black uppercase bg-black text-white px-1.5 sm:px-2 py-0.5 shadow-brutal-sm">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-chiri-red animate-ping" />
              <span>
                {currentExpression === 'laughing' || currentExpression === 'smile'
                  ? '🚨 ചിരി കുറ്റകൃത്യം // SMILE ROAST'
                  : `🚨 ${currentExpression.toUpperCase()} ROAST`}
              </span>
            </div>
            <p className="font-ml font-black text-sm sm:text-lg md:text-2xl leading-tight text-black line-clamp-2 sm:line-clamp-none">
              "{mockText}"
            </p>
            <div className="flex items-center gap-1.5 font-mono text-[9px] sm:text-xs font-black text-black bg-white px-1.5 sm:px-2 py-0.5 border sm:border-2 border-black shadow-brutal-sm">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-chiri-red animate-pulse" />
              <span>🎬 മൂവി ഡയലോഗ് വരുന്നു...</span>
            </div>
          </div>
        </div>
      )}

      {/* Stage 2: Faded Overlapping Expression Comedy Movie Dialogue Video with Sound */}
      {isCameraLive && overlayVideoUrl && isOverlayVideoPlaying && (
        <div className="absolute inset-0 w-full h-full z-15 pointer-events-none flex items-center justify-center animate-in fade-in duration-300">
          <video
            ref={overlayVideoRef}
            src={overlayVideoUrl}
            autoPlay
            playsInline
            muted={overlayVideoMuted}
            onEnded={() => finishOverlayVideo()}
            className="w-full h-full object-cover opacity-85 mix-blend-normal transition-opacity duration-300 pointer-events-none"
          />

          {/* Brutalist Expression Tag and Sound Control on Camera */}
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 pointer-events-auto flex items-center gap-1 sm:gap-1.5 z-30 font-mono text-[9px] sm:text-[10px] md:text-xs">
            <div className="bg-black/90 text-chiri-yellow border sm:border-2 border-black px-1.5 sm:px-2 py-0.5 flex items-center gap-1 shadow-brutal-sm font-black uppercase">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-chiri-red animate-ping" />
              <span className="hidden xs:inline">🎬</span>
              <span>{currentExpression.toUpperCase()}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleOverlayMuted();
              }}
              className="bg-white hover:bg-chiri-yellow text-black border sm:border-2 border-black px-1.5 sm:px-2 py-0.5 font-bold uppercase shadow-brutal-sm cursor-pointer flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
              title={overlayVideoMuted ? 'Turn Sound On' : 'Mute Video'}
            >
              {overlayVideoMuted ? (
                <>
                  <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-chiri-red" />
                  <span>MUTED</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-black" />
                  <span>SOUND</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Top HUD: Status, Smile Type & Challenge Timer */}
      {isCameraLive && (
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-20 flex flex-wrap items-center gap-1 sm:gap-1.5 font-mono text-[9px] sm:text-[10px] md:text-xs">
          {/* Status Pill */}
          <div className="bg-black/90 text-white border sm:border-2 border-black px-1.5 sm:px-2 py-0.5 flex items-center gap-1 sm:gap-1.5 shadow-brutal-sm font-bold uppercase">
            <span
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                isSmiling ? 'bg-chiri-red animate-ping' : faceDetected ? 'bg-chiri-yellow' : 'bg-white/40'
              }`}
            />
            <span>{cameraStateLabel}</span>
          </div>

          {/* Current Smile Type Pill */}
          {smileTypeMl && smileTypeMl !== 'ചിരിയില്ല' && (
            <div className="bg-chiri-yellow text-black border sm:border-2 border-black px-1.5 sm:px-2 py-0.5 font-ml font-black shadow-brutal-sm">
              🎭 {smileTypeMl}
            </div>
          )}

          {/* Serious Challenge Stopwatch Pill */}
          {isChallengeActive && (
            <div
              className={`border sm:border-2 border-black px-1.5 sm:px-2 py-0.5 font-mono font-black shadow-brutal-sm flex items-center gap-1 ${
                isSmiling ? 'bg-chiri-red text-white animate-bounce' : 'bg-white text-black'
              }`}
            >
              <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>
                {isSmiling
                  ? `BUSTED! (${seriousTimeSeconds.toFixed(1)}s)`
                  : `${seriousTimeSeconds.toFixed(1)}s`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bottom Floating Control Bar on Camera View */}
      {isCameraLive && (
        <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2 sm:left-2 sm:right-2 z-20 flex items-center justify-between pointer-events-none">
          {/* Left: Challenge Mode Toggle */}
          <button
            onClick={toggleChallengeMode}
            className={`pointer-events-auto px-2 sm:px-2.5 py-0.5 sm:py-1 border sm:border-2 border-black font-mono text-[9px] sm:text-[10px] md:text-xs font-black uppercase shadow-brutal-sm flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
              isChallengeActive
                ? 'bg-chiri-red text-white'
                : 'bg-white hover:bg-chiri-yellow text-black'
            }`}
          >
            <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{isChallengeActive ? 'CHALLENGE: ON' : 'NO-SMILE GAME'}</span>
          </button>

          {/* Right: Meme Capture & Fine Receipt */}
          <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={handleMemeSnapshot}
              className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-chiri-yellow hover:bg-white text-black border sm:border-2 border-black font-mono text-[9px] sm:text-[10px] md:text-xs font-black uppercase shadow-brutal-sm flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              title="Capture funny meme snapshot"
            >
              <SnapshotIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>MEME</span>
            </button>

            <button
              onClick={toggleFineReceipt}
              className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-white hover:bg-chiri-yellow text-black border sm:border-2 border-black font-mono text-[9px] sm:text-[10px] md:text-xs font-black uppercase shadow-brutal-sm flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              title="Generate useless smile fine notice"
            >
              <ReceiptText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>രസീത്</span>
            </button>
          </div>
        </div>
      )}

      {/* Manual Unpause Button if browser suspended playback */}
      {isCameraLive && videoPaused && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60">
          <button
            onClick={handleManualVideoPlay}
            className="px-4 py-2 bg-chiri-yellow text-black border-3 border-black font-black uppercase text-xs shadow-brutal flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            RESUME FEED
          </button>
        </div>
      )}

      {/* 1. Camera Offline State Screen */}
      {!isCameraLive && !cameraLoading && !cameraError && (
        <div className="absolute inset-0 z-30 p-4 flex flex-col items-center justify-center text-center w-full h-full bg-chiri-bg">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-chiri-yellow border-3 border-black shadow-brutal flex items-center justify-center mb-3 text-black">
            <Camera className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight mb-1">
            CAMERA OFF
          </h2>
          <p className="text-xs font-mono text-black/70 mb-4 max-w-xs">
            ക്യാമറ ഓൺ ചെയ്യൂ. ചിരിച്ചാൽ ട്രോൾ കിട്ടും.
          </p>
          <button
            onClick={onStartCamera}
            className="px-6 py-2.5 md:py-3 bg-chiri-yellow hover:bg-white text-black border-3 border-black font-black uppercase tracking-wider text-xs md:text-sm shadow-brutal cursor-pointer transition-transform active:translate-x-1 active:translate-y-1 flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            START CAMERA
          </button>
        </div>
      )}

      {/* 2. Loading State */}
      {cameraLoading && (
        <div className="absolute inset-0 z-30 p-4 flex flex-col items-center justify-center text-center w-full h-full bg-chiri-bg">
          <RefreshCw className="w-8 h-8 text-black animate-spin mb-2" />
          <div className="bg-chiri-yellow text-black px-3 py-1 font-bold text-xs uppercase border-2 border-black shadow-brutal-sm">
            CONNECTING CAMERA...
          </div>
        </div>
      )}

      {/* 3. Error / Permission Denied Screen */}
      {cameraError && (
        <div className="absolute inset-0 z-30 p-4 flex flex-col items-center justify-center text-center w-full h-full bg-chiri-bg">
          <div className="p-4 max-w-xs bg-white border-3 border-black shadow-brutal text-black">
            <AlertTriangle className="w-8 h-8 text-chiri-red mb-1.5 mx-auto" />
            <h3 className="text-sm font-black uppercase text-chiri-red tracking-wide mb-1">
              {cameraPermissionDenied ? 'CAMERA ACCESS BLOCKED' : 'CAMERA ERROR'}
            </h3>
            <p className="text-[11px] text-black font-mono leading-relaxed mb-3">
              {cameraError}
            </p>
            <button
              onClick={onStartCamera}
              className="px-4 py-1.5 bg-chiri-yellow hover:bg-white text-black border-2 border-black font-bold uppercase tracking-wider text-xs shadow-brutal-sm cursor-pointer mx-auto block"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
