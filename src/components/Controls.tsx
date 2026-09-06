import React from 'react';
import { useSmileStore } from '@/store/useSmileStore';
import { Camera, CameraOff, Volume2, VolumeX, RotateCcw, Bug, ShieldCheck } from 'lucide-react';

interface ControlsProps {
  onStartCamera: () => void;
  onStopCamera: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  onStartCamera,
  onStopCamera,
}) => {
  const {
    cameraEnabled,
    cameraLoading,
    voiceEnabled,
    toggleVoice,
    resetStats,
    debugMode,
    toggleDebug,
    faceDetected,
    rawSmileScore,
    smileScore,
    isSmiling,
    cooldownActive,
    currentMockVideo,
    detectionState,
  } = useSmileStore();

  return (
    <div className="bg-white border-4 border-police-black shadow-brutal p-4 flex flex-col gap-4 font-mono">
      {/* Header */}
      <div className="border-b-4 border-police-black pb-2 flex items-center justify-between">
        <h2 className="text-sm font-heading font-black uppercase text-police-black tracking-wide">
          SYSTEM CONTROLS // MASTER OPERATOR BOARD
        </h2>
        <div className="flex items-center gap-1 text-[10px] font-bold text-police-black bg-police-yellow px-2 py-0.5 border border-police-black">
          <ShieldCheck className="w-3.5 h-3.5 text-police-black" />
          <span>LOCAL PROCESSING GUARANTEE</span>
        </div>
      </div>

      {/* Primary Action Buttons Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* 1. Camera Toggle Button */}
        {!cameraEnabled ? (
          <button
            onClick={onStartCamera}
            disabled={cameraLoading}
            className="px-4 py-3 bg-police-yellow hover:bg-white text-police-black border-4 border-police-black font-black uppercase tracking-wider text-xs shadow-brutal transition-all active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            {cameraLoading ? 'CONNECTING...' : 'START CAMERA'}
          </button>
        ) : (
          <button
            onClick={onStopCamera}
            className="px-4 py-3 bg-police-red hover:bg-white text-white hover:text-police-black border-4 border-police-black font-black uppercase tracking-wider text-xs shadow-brutal transition-all active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-2"
          >
            <CameraOff className="w-4 h-4" />
            STOP CAMERA
          </button>
        )}

        {/* 2. Voice Audio Toggle */}
        <button
          onClick={toggleVoice}
          className={`px-4 py-3 border-4 border-police-black font-black uppercase tracking-wider text-xs shadow-brutal transition-all active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-2 ${
            voiceEnabled
              ? 'bg-police-black text-police-yellow hover:bg-police-yellow hover:text-police-black'
              : 'bg-police-bg text-police-muted hover:bg-white'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          VOICE: {voiceEnabled ? 'ACTIVE' : 'MUTED'}
        </button>

        {/* 3. Reset Stats */}
        <button
          onClick={resetStats}
          className="px-4 py-3 bg-white hover:bg-police-yellow text-police-black border-4 border-police-black font-black uppercase tracking-wider text-xs shadow-brutal transition-all active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          RESET DOSSIER
        </button>

        {/* 4. Debug Mode Toggle */}
        <button
          onClick={toggleDebug}
          className={`px-4 py-3 border-4 border-police-black font-black uppercase tracking-wider text-xs shadow-brutal transition-all active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-2 ${
            debugMode
              ? 'bg-police-yellow text-police-black'
              : 'bg-police-bg text-police-muted hover:bg-white'
          }`}
        >
          <Bug className="w-4 h-4" />
          DEBUG: {debugMode ? 'ACTIVE' : 'OFF'}
        </button>
      </div>

      {/* Camera Privacy Notice Badge */}
      <div className="bg-police-bg border-2 border-police-black p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-police-green shrink-0" />
          <div>
            <span className="font-bold text-police-black uppercase">PRIVACY DIRECTIVE: </span>
            <span className="text-police-muted">
              CAMERA DATA PROCESSED 100% LOCALLY IN BROWSER MEMORY. NO VIDEO STORED OR TRANSMITTED.
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-police-black text-white px-2 py-0.5 whitespace-nowrap">
          ZERO SURVEILLANCE CLOUD
        </span>
      </div>

      {/* Real-time Diagnostics / Debug Section (if enabled) */}
      {debugMode && (
        <div className="border-4 border-police-black bg-police-terminal text-police-green p-3 text-xs space-y-1 animate-in fade-in duration-150">
          <div className="text-police-yellow font-black border-b border-police-green/40 pb-1 mb-2 uppercase flex items-center justify-between">
            <span>[DIAGNOSTICS CONSOLE // FORENSIC TELEMETRY]</span>
            <span className="text-[10px] text-white">ENGINE: MEDIAPIPE FACE MESH</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <span className="text-police-muted">FACE DETECTED:</span>{' '}
              <span className={faceDetected ? 'text-police-green font-bold' : 'text-police-red'}>
                {faceDetected ? 'YES' : 'NO'}
              </span>
            </div>
            <div>
              <span className="text-police-muted">RAW SMILE:</span>{' '}
              <span className="text-white font-bold">{rawSmileScore.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-police-muted">SMOOTHED:</span>{' '}
              <span className="text-police-yellow font-bold">{smileScore.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-police-muted">THRESHOLD:</span>{' '}
              <span className="text-white font-bold">45.00</span>
            </div>
            <div>
              <span className="text-police-muted">IS SMILING:</span>{' '}
              <span className={isSmiling ? 'text-police-red font-bold' : 'text-police-green'}>
                {isSmiling ? 'YES' : 'NO'}
              </span>
            </div>
            <div>
              <span className="text-police-muted">COOLDOWN:</span>{' '}
              <span className={cooldownActive ? 'text-police-red font-bold' : 'text-police-green'}>
                {cooldownActive ? 'YES (ACTIVE)' : 'NO'}
              </span>
            </div>
            <div>
              <span className="text-police-muted">STATE MACHINE:</span>{' '}
              <span className="text-police-yellow font-bold">{detectionState}</span>
            </div>
            <div>
              <span className="text-police-muted">CURRENT MOCK:</span>{' '}
              <span className="text-white font-bold">{currentMockVideo?.id || 'NONE'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
