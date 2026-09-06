import React from 'react';
import { useSmileStore } from '@/store/useSmileStore';
import { formatBrutalistProgressBar, getInvestigationStatus } from '@/utils/smileClassifier';
import { Smile, Frown, AlertCircle } from 'lucide-react';

export const SmileStatus: React.FC = () => {
  const {
    smileScore,
    isSmiling,
    smileIntensity,
    faceDetected,
    multipleFacesDetected,
    isPlayingMock,
    cooldownActive,
  } = useSmileStore();

  const investigation = getInvestigationStatus(
    faceDetected,
    multipleFacesDetected,
    smileIntensity,
    isSmiling,
    isPlayingMock
  );

  const roundedScore = Math.round(smileScore);
  const progressBar = formatBrutalistProgressBar(roundedScore, 14);

  // Status visual attributes
  const isDanger = isSmiling || cooldownActive;

  return (
    <div className="bg-white border-4 border-police-black shadow-brutal p-4 flex flex-col gap-4">
      {/* Panel Header */}
      <div className="border-b-4 border-police-black pb-2 flex items-center justify-between">
        <h2 className="text-sm font-heading font-black uppercase text-police-black tracking-wide flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-police-black" />
          SMILE STATUS // BIO-METER
        </h2>
        <span
          className={`text-[11px] font-mono font-bold px-2 py-0.5 border-2 border-police-black shadow-brutal-sm uppercase ${
            isDanger ? 'bg-police-red text-white animate-pulse' : 'bg-police-green text-police-black'
          }`}
        >
          {isDanger ? 'VIOLATION DETECTED' : 'COMPLIANT'}
        </span>
      </div>

      {/* Main Smile Face Indicator Box */}
      <div
        className={`border-4 border-police-black p-4 flex items-center justify-between shadow-brutal transition-colors ${
          isDanger
            ? 'bg-police-red text-white'
            : isSmiling
            ? 'bg-police-yellow text-police-black'
            : 'bg-police-bg text-police-black'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white text-police-black border-2 border-police-black shadow-brutal-sm">
            {isSmiling ? <Smile className="w-8 h-8 text-police-red" /> : <Frown className="w-8 h-8 text-police-black" />}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              FACIAL DISPOSITION
            </div>
            <div className="text-xl md:text-2xl font-heading font-black uppercase tracking-tight">
              {isSmiling ? '😁 SMILING' : '😐 NOT SMILING'}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
            CURRENT LEVEL
          </div>
          <div className="text-3xl font-heading font-black">
            {roundedScore}%
          </div>
        </div>
      </div>

      {/* ASCII / Graphical Brutalist Progress Bar */}
      <div className="bg-police-terminal text-police-green border-4 border-police-black p-3 font-mono">
        <div className="flex justify-between text-xs text-white uppercase font-bold mb-1">
          <span>SMILE LEVEL:</span>
          <span>{roundedScore}/100</span>
        </div>
        <div className="text-sm md:text-base font-bold tracking-widest overflow-hidden text-ellipsis whitespace-nowrap text-police-yellow">
          {progressBar}
        </div>
      </div>

      {/* Classification & Threat Level Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono font-bold">
        {/* Classification */}
        <div className="border-2 border-police-black bg-white p-2 shadow-brutal-sm">
          <div className="text-[10px] text-police-muted uppercase">CLASSIFICATION</div>
          <div className="text-sm font-black uppercase text-police-black mt-0.5">
            {smileIntensity === 'none' ? 'NOT SMILING' : `${smileIntensity.toUpperCase()} SMILE`}
          </div>
        </div>

        {/* Threat Level */}
        <div className="border-2 border-police-black bg-white p-2 shadow-brutal-sm">
          <div className="text-[10px] text-police-muted uppercase">THREAT LEVEL</div>
          <div className="text-sm font-black uppercase text-police-red mt-0.5">
            {investigation.threatLevel}
          </div>
        </div>
      </div>

      {/* Investigation Sub-Status Bar */}
      <div className={`border-2 p-2 text-xs font-mono font-bold uppercase ${investigation.badgeColor}`}>
        <div className="tracking-tight">{investigation.headline}</div>
        <div className="text-[10px] font-normal opacity-90 mt-0.5">{investigation.subtext}</div>
      </div>
    </div>
  );
};
