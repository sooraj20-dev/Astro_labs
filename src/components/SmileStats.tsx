import React from 'react';
import { useSmileStore } from '@/store/useSmileStore';
import { FileText, RotateCcw } from 'lucide-react';

export const SmileStats: React.FC = () => {
  const {
    smileCount,
    mockDeployedCount,
    peakSmileScore,
    smileScore,
    lastIncidentTime,
    resetStats,
  } = useSmileStore();

  const formattedSmiles = String(smileCount).padStart(2, '0');
  const formattedMocks = String(mockDeployedCount).padStart(2, '0');
  const formattedMax = `${peakSmileScore}%`;
  const formattedCurrent = `${Math.round(smileScore)}%`;
  const formattedLast = lastIncidentTime || 'NONE LOGGED';

  return (
    <div className="bg-white border-4 border-police-black shadow-brutal p-4 flex flex-col gap-3 font-mono">
      {/* Header */}
      <div className="border-b-4 border-police-black pb-2 flex items-center justify-between">
        <h2 className="text-sm font-heading font-black uppercase text-police-black tracking-wide flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-police-black" />
          INVESTIGATION REPORT // CASE DOSSIER
        </h2>
        <button
          onClick={resetStats}
          title="Reset Investigation Statistics"
          className="text-[11px] font-bold px-2 py-0.5 border-2 border-police-black bg-police-yellow hover:bg-police-red hover:text-white transition-colors shadow-brutal-sm uppercase flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          RESET DOSSIER
        </button>
      </div>

      {/* Forensic Stats Table */}
      <div className="border-4 border-police-black bg-police-bg divide-y-2 divide-police-black text-xs">
        <div className="flex items-center justify-between p-2.5">
          <span className="font-bold text-police-black uppercase tracking-wider">
            SMILES DETECTED:
          </span>
          <span className="font-black text-police-red text-base bg-white border-2 border-police-black px-2 py-0.5 shadow-brutal-sm">
            {formattedSmiles}
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5">
          <span className="font-bold text-police-black uppercase tracking-wider">
            MOCKS DEPLOYED:
          </span>
          <span className="font-black text-police-black text-base bg-white border-2 border-police-black px-2 py-0.5 shadow-brutal-sm">
            {formattedMocks}
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5">
          <span className="font-bold text-police-black uppercase tracking-wider">
            MAX SMILE (PEAK VIOLATION):
          </span>
          <span className="font-black text-police-red text-base bg-white border-2 border-police-black px-2 py-0.5 shadow-brutal-sm">
            {formattedMax}
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5">
          <span className="font-bold text-police-black uppercase tracking-wider">
            CURRENT SMILE LEVEL:
          </span>
          <span className="font-black text-police-black text-base bg-white border-2 border-police-black px-2 py-0.5 shadow-brutal-sm">
            {formattedCurrent}
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5">
          <span className="font-bold text-police-black uppercase tracking-wider">
            LAST INCIDENT RECORDED:
          </span>
          <span className="font-bold text-police-muted text-xs bg-white border-2 border-police-black px-2 py-0.5 shadow-brutal-sm font-mono">
            {formattedLast}
          </span>
        </div>
      </div>

      {/* Footer Legal Disclaimer */}
      <div className="text-[10px] text-police-muted leading-tight border-t-2 border-police-black pt-2 uppercase">
        * STATISTICAL EVIDENCE GATHERED UNDER KERALA SMILE REGULATION ORDINANCE. ALL TRANSGRESSIONS WILL BE LOGGED PERMANENTLY.
      </div>
    </div>
  );
};
