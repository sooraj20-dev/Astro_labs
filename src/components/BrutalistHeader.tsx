import React from 'react';
import { useSmileStore } from '@/store/useSmileStore';

export const BrutalistHeader: React.FC = () => {
  const { cameraEnabled, setLandingOpen } = useSmileStore();

  return (
    <header className="border-b-3 border-black bg-white px-3 py-2 shrink-0 flex items-center justify-between">
      {/* Brand Title */}
      <div className="flex items-baseline gap-2">
        <h1 className="text-xl md:text-2xl font-black tracking-tighter text-black uppercase font-heading">
          CHIRI
        </h1>
        <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider text-black/60 hidden sm:inline">
          ചിരി നിരോധിച്ചിരിക്കുന്നു
        </span>
      </div>

      {/* Header Actions: Briefing button & Live Status Badge */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
        <button
          onClick={() => setLandingOpen(true)}
          className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white hover:bg-chiri-yellow text-black border-2 border-black font-mono text-[9px] sm:text-[10px] md:text-xs font-black uppercase shadow-brutal-sm cursor-pointer flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
          title="Open Photo Studio Trap Challenge"
        >
          <span>📸 ഫോട്ടോ സ്റ്റുഡിയോ</span>
        </button>

        <div
          className={`px-2 py-0.5 sm:px-2.5 sm:py-1 border-2 border-black font-mono text-[9px] sm:text-[10px] md:text-xs font-bold uppercase flex items-center gap-1.5 shadow-brutal-sm ${
            cameraEnabled ? 'bg-black text-chiri-yellow' : 'bg-chiri-gray text-black/70'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              cameraEnabled ? 'bg-chiri-yellow animate-ping' : 'bg-black/30'
            }`}
          />
          <span>{cameraEnabled ? '● LIVE' : '○ READY'}</span>
        </div>
      </div>
    </header>
  );
};
