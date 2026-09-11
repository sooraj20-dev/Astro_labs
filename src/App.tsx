import React from 'react';
import { BrutalistHeader } from '@/components/BrutalistHeader';
import { CameraView } from '@/components/CameraView';
import { JathakamPanel } from '@/components/JathakamPanel';
import { ReactionPanel } from '@/components/ReactionPanel';
import { FineReceiptModal } from '@/components/FineReceiptModal';
import { ShareCardModal } from '@/components/ShareCardModal';
import { LandingScreen } from '@/components/LandingScreen';
import { useCamera } from '@/hooks/useCamera';
import { useSmileStore } from '@/store/useSmileStore';
import { Camera, CameraOff, Sparkles } from 'lucide-react';
import { unlockMobileAudio } from '@/utils/mockVoice';

export const App: React.FC = () => {
  const { videoRef, stream, startCamera, stopCamera } = useCamera();
  const {
    landingOpen,
    cameraEnabled,
    isSmiling,
    appPhase,
    mockMode,
    startScanSequence,
    resetForNewReading,
    faceDetected,
  } = useSmileStore();

  const handleStartCamera = () => {
    unlockMobileAudio();
    startCamera();
  };

  // When landing screen is open, display exclusively full-screen
  if (landingOpen) {
    return <LandingScreen onStartCamera={handleStartCamera} />;
  }

  return (
    <div
      onTouchStart={unlockMobileAudio}
      onClick={unlockMobileAudio}
      className={`h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col bg-[#F5F5EF] text-black selection:bg-chiri-yellow selection:text-black transition-all ${
        isSmiling && mockMode === 'MOVIE' ? 'ring-4 ring-inset ring-chiri-red' : ''
      }`}
    >
      {/* 1. Brutalist Header */}
      <BrutalistHeader />

      {/* 2. Main Responsive Viewport (Strict Single-Screen / No Scrolling) */}
      <main className="flex-1 min-h-0 w-full max-w-6xl mx-auto p-1.5 sm:p-2 md:p-3 flex flex-col md:flex-row gap-1.5 sm:gap-2 md:gap-3 overflow-hidden">
        {/* In MOVIE mode: visible Camera Section */}
        {mockMode === 'MOVIE' && (
          <section className="h-[32vh] xs:h-[34vh] sm:h-[38vh] md:h-full w-full md:w-1/2 lg:w-3/5 shrink-0 md:shrink md:flex-1 min-h-0 flex flex-col">
            <CameraView
              videoRef={videoRef}
              stream={stream}
              onStartCamera={handleStartCamera}
              onStopCamera={stopCamera}
            />
          </section>
        )}

        {/* In ASTROLOGY mode: CameraView runs headlessly without camera feed UI */}
        {mockMode === 'ASTROLOGY' && (
          <CameraView
            videoRef={videoRef}
            stream={stream}
            onStartCamera={handleStartCamera}
            onStopCamera={stopCamera}
          />
        )}

        {/* Right / Full-width Panel */}
        <section
          className={`flex-1 min-h-0 flex flex-col ${
            mockMode === 'ASTROLOGY'
              ? 'w-full max-w-2xl lg:max-w-3xl mx-auto h-full'
              : 'w-full md:w-1/2 lg:w-2/5'
          }`}
        >
          {mockMode === 'MOVIE' ? (
            <ReactionPanel />
          ) : (
            <JathakamPanel stream={stream} onStartCamera={handleStartCamera} />
          )}
        </section>
      </main>

      {/* 3. Bottom Brutalist Control Bar */}
      <footer className="border-t-3 border-black bg-white px-2.5 sm:px-4 py-1.5 sm:py-2 shrink-0 flex items-center justify-between gap-2">
        <span className="text-[10px] md:text-xs font-ml font-bold text-black/70 truncate hidden sm:inline">
          {mockMode === 'MOVIE'
            ? 'ചിരി നിരോധിച്ചിരിക്കുന്നു • SMILE DETECTION ACTIVE'
            : 'ജ്യോത്സ്യൻ ഉണ്ണി നമ്പൂതിരി • ശാസ്ത്രീയമല്ല, പക്ഷേ ആത്മവിശ്വാസമുണ്ട്.'}
        </span>

        {/* Center Primary Action Buttons */}
        <div className="flex items-center gap-2 mx-auto sm:mx-0 w-full sm:w-auto justify-center">
          {!cameraEnabled ? (
            <button
              onClick={handleStartCamera}
              className="w-full sm:w-auto px-5 py-1.5 sm:py-2 bg-chiri-yellow hover:bg-black hover:text-chiri-yellow text-black border-2 sm:border-3 border-black font-mono font-black uppercase text-xs sm:text-sm shadow-[3px_3px_0px_#000] cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{mockMode === 'ASTROLOGY' ? 'കവടി നിരത്തൂ (START)' : 'START CAMERA'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {mockMode === 'ASTROLOGY' && faceDetected && appPhase === 'WAITING_FACE' && (
                <button
                  onClick={startScanSequence}
                  className="flex-1 sm:flex-initial px-4 py-1.5 sm:py-2 bg-chiri-yellow hover:bg-black hover:text-chiri-yellow text-black border-2 border-black font-mono font-black uppercase text-xs shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>കവടി നിരത്തൂ</span>
                </button>
              )}

              {mockMode === 'ASTROLOGY' && appPhase === 'RESULT' && (
                <button
                  onClick={resetForNewReading}
                  className="flex-1 sm:flex-initial px-4 py-1.5 sm:py-2 bg-chiri-yellow hover:bg-black hover:text-chiri-yellow text-black border-2 border-black font-ml font-black uppercase text-xs shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>വേറെ ആളെ നോക്കാം</span>
                </button>
              )}

              <button
                onClick={stopCamera}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white hover:bg-chiri-red hover:text-white text-black border-2 border-black font-mono font-black uppercase text-xs shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-1"
              >
                <CameraOff className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">STOP</span>
              </button>
            </div>
          )}
        </div>

        <span className="text-[10px] font-mono text-black/50 uppercase hidden md:inline shrink-0">
          {mockMode === 'MOVIE' ? 'MOVIE ROAST' : 'ASTRO LAB'}
        </span>
      </footer>

      {/* Share / Save Result Modal */}
      <ShareCardModal />

      {/* Fine Notice Modal */}
      <FineReceiptModal />
    </div>
  );
};

export default App;
