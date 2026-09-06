import React from 'react';
import { BrutalistHeader } from '@/components/BrutalistHeader';
import { CameraView } from '@/components/CameraView';
import { ReactionPanel } from '@/components/ReactionPanel';
import { FineReceiptModal } from '@/components/FineReceiptModal';
import { LandingScreen } from '@/components/LandingScreen';
import { useCamera } from '@/hooks/useCamera';
import { useSmileStore } from '@/store/useSmileStore';
import { Camera, CameraOff } from 'lucide-react';
import { unlockMobileAudio } from '@/utils/mockVoice';

export const App: React.FC = () => {
  const { videoRef, stream, startCamera, stopCamera } = useCamera();
  const { cameraEnabled, isSmiling } = useSmileStore();

  const handleStartCamera = () => {
    unlockMobileAudio();
    startCamera();
  };

  return (
    <div
      onTouchStart={unlockMobileAudio}
      onClick={unlockMobileAudio}
      className={`h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col bg-chiri-bg text-black selection:bg-chiri-yellow selection:text-black transition-all ${
        isSmiling ? 'ring-4 ring-inset ring-chiri-red' : ''
      }`}
    >
      {/* 1. Compact Header */}
      <BrutalistHeader />

      {/* 2. Main One-Screen Content Area (No-Scroll Viewport) */}
      <main className="flex-1 min-h-0 w-full max-w-6xl mx-auto p-1.5 sm:p-2 md:p-4 flex flex-col md:flex-row gap-1.5 sm:gap-2 md:gap-4 overflow-hidden">
        {/* Left / Top: Main Camera (Decreased on mobile to fit easily, expanded on desktop) */}
        <section className="h-[30vh] xs:h-[33vh] sm:h-[38vh] md:h-full w-full md:w-3/5 lg:w-2/3 shrink-0 md:shrink md:flex-1 min-h-0 flex flex-col">
          <CameraView
            videoRef={videoRef}
            stream={stream}
            onStartCamera={handleStartCamera}
            onStopCamera={stopCamera}
          />
        </section>

        {/* Right / Bottom: Reaction Panel (Takes remaining vertical space on mobile) */}
        <section className="flex-1 min-h-0 w-full md:w-2/5 lg:w-1/3 flex flex-col">
          <ReactionPanel />
        </section>
      </main>

      {/* 3. Bottom Compact Control Bar */}
      <footer className="border-t-3 border-black bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 shrink-0 flex items-center justify-between gap-2 sm:gap-3">
        <span className="text-[10px] md:text-xs font-mono font-bold text-black/50 uppercase tracking-widest hidden sm:inline">
          PURPOSE: NONE. MADE FOR NO REASON.
        </span>

        <div className="flex items-center gap-2 mx-auto sm:mx-0 w-full sm:w-auto">
          {!cameraEnabled ? (
            <button
              onClick={handleStartCamera}
              className="w-full sm:w-auto px-6 py-2 bg-chiri-yellow hover:bg-white text-black border-3 border-black font-black uppercase text-xs md:text-sm tracking-wider shadow-brutal cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              START CAMERA
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="w-full sm:w-auto px-6 py-2 bg-white hover:bg-chiri-red hover:text-white text-black border-3 border-black font-black uppercase text-xs md:text-sm tracking-wider shadow-brutal cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
            >
              <CameraOff className="w-4 h-4" />
              STOP CAMERA
            </button>
          )}
        </div>

        <span className="text-[10px] font-mono text-black/50 uppercase hidden md:inline">
          CHIRI v1.0
        </span>
      </footer>

      {/* Official Brutalist Fine Receipt Modal */}
      <FineReceiptModal />

      {/* Official Landing & Loading Briefing Screen with smileintro Voice */}
      <LandingScreen onStartCamera={handleStartCamera} />
    </div>
  );
};

export default App;
