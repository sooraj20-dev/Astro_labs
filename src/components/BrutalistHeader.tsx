import React from 'react';
import { useSmileStore } from '@/store/useSmileStore';
import { ShieldCheck } from 'lucide-react';

export const BrutalistHeader: React.FC = () => {
  const { cameraEnabled, setLandingOpen, mockMode, setMockMode } = useSmileStore();

  return (
    <header className="border-b-3 border-black bg-white px-2 sm:px-4 py-1.5 sm:py-2 shrink-0 flex items-center justify-between gap-2 select-none">
      {/* Brand Title & Subtitle */}
      <div
        onClick={() => setLandingOpen(true)}
        className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group shrink-0"
      >
        <h1 className="text-base sm:text-xl md:text-2xl font-black font-ml tracking-tight text-black group-hover:text-chiri-red transition-colors">
          {mockMode === 'MOVIE' ? 'സിനിമ റോസ്റ്റ്™' : 'മുഖം നോക്കി ഭാവി™'}
        </h1>
        <span className="font-mono text-[9px] sm:text-[10px] md:text-xs font-black uppercase bg-chiri-yellow text-black px-1.5 py-0.5 border border-black shadow-[1.5px_1.5px_0px_#000] hidden xs:inline">
          {mockMode === 'MOVIE' ? 'MOVIE MOCK' : 'ASTRO LAB'}
        </span>
      </div>

      {/* Mode Selector Toggle: Astrology vs Movie Mock */}
      <div className="flex items-center border-2 border-black bg-[#FAF8F5] p-0.5 shadow-[2px_2px_0px_#000]">
        <button
          onClick={() => setMockMode('ASTROLOGY')}
          className={`px-2 sm:px-2.5 py-0.5 sm:py-1 font-ml font-black text-[10px] sm:text-xs uppercase transition-colors flex items-center gap-1 cursor-pointer ${
            mockMode === 'ASTROLOGY'
              ? 'bg-chiri-yellow text-black border border-black shadow-[1px_1px_0px_#000]'
              : 'text-black/60 hover:text-black border border-transparent'
          }`}
          title="Face Jyothisham Astrology Mode"
        >
          <span>🔮 ഉണ്ണി നമ്പൂതിരി</span>
          <span className="hidden md:inline font-mono text-[9px]">(JYOTHISHAM)</span>
        </button>
        <button
          onClick={() => setMockMode('MOVIE')}
          className={`px-2 sm:px-2.5 py-0.5 sm:py-1 font-ml font-black text-[10px] sm:text-xs uppercase transition-colors flex items-center gap-1 cursor-pointer ${
            mockMode === 'MOVIE'
              ? 'bg-chiri-yellow text-black border border-black shadow-[1px_1px_0px_#000]'
              : 'text-black/60 hover:text-black border border-transparent'
          }`}
          title="Malayalam Movie Roasts Mode"
        >
          <span>🎬 സിനിമ റോസ്റ്റ്</span>
          <span className="hidden md:inline font-mono text-[9px]">(MOVIE)</span>
        </button>
      </div>

      {/* Privacy Guarantee & Live Status Badge */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Privacy Badge */}
        <div className="hidden lg:flex items-center gap-1 font-mono text-[10px] font-bold text-black/70 border border-black/30 px-2 py-0.5 bg-[#F5F5EF]">
          <ShieldCheck className="w-3.5 h-3.5 text-black" />
          <span>LOCAL ONLY</span>
        </div>

        {/* Live Status Pill */}
        <div
          className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 border-2 border-black font-mono text-[9px] sm:text-xs font-black uppercase flex items-center gap-1 sm:gap-1.5 shadow-[2px_2px_0px_#000] ${
            cameraEnabled ? 'bg-black text-chiri-yellow' : 'bg-[#E5E5DE] text-black'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
              cameraEnabled ? 'bg-chiri-yellow animate-ping' : 'bg-black/30'
            }`}
          />
          <span>{cameraEnabled ? '● LIVE' : '○ READY'}</span>
        </div>
      </div>
    </header>
  );
};
