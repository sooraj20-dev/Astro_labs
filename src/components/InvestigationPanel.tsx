import React, { useEffect, useState } from 'react';
import { useSmileStore } from '@/store/useSmileStore';
import { getInvestigationStatus } from '@/utils/smileClassifier';
import { Terminal, Shield, AlertTriangle } from 'lucide-react';

interface LogEntry {
  id: string;
  time: string;
  message: string;
  level: 'info' | 'warn' | 'violation';
}

export const InvestigationPanel: React.FC = () => {
  const {
    faceDetected,
    multipleFacesDetected,
    smileIntensity,
    isSmiling,
    isPlayingMock,
    currentMockLine,
    detectionState,
  } = useSmileStore();

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      time: new Date().toTimeString().split(' ')[0],
      message: 'SYSTEM DISPATCH INITIALIZED. SCANNING ZONE FOR ILLEGAL LEVITY.',
      level: 'info',
    },
  ]);

  const investigation = getInvestigationStatus(
    faceDetected,
    multipleFacesDetected,
    smileIntensity,
    isSmiling,
    isPlayingMock
  );

  // Append real log entries when detection state changes or mock fires
  useEffect(() => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    let newEntry: LogEntry | null = null;

    if (isPlayingMock && currentMockLine) {
      newEntry = {
        id: `mock-${Date.now()}`,
        time: timeStr,
        message: `🚨 SMILE CHARGE DEPLOYED: "${currentMockLine.transliteration}"`,
        level: 'violation',
      };
    } else if (multipleFacesDetected) {
      newEntry = {
        id: `multi-${Date.now()}`,
        time: timeStr,
        message: 'MULTIPLE SUSPECTS DETECTED. COGNITIVE OVERLOAD.',
        level: 'warn',
      };
    } else if (isSmiling) {
      newEntry = {
        id: `smile-${Date.now()}`,
        time: timeStr,
        message: `SUSPECT TRANSGRESSION: ${smileIntensity.toUpperCase()} SMILE IN PROGRESS`,
        level: 'violation',
      };
    }

    if (newEntry) {
      setLogs((prev) => [newEntry!, ...prev.slice(0, 9)]); // Keep last 10 entries
    }
  }, [isPlayingMock, currentMockLine, multipleFacesDetected, isSmiling, smileIntensity]);

  return (
    <div className="bg-white border-4 border-police-black shadow-brutal p-4 flex flex-col gap-3 font-mono">
      {/* Header */}
      <div className="border-b-4 border-police-black pb-2 flex items-center justify-between">
        <h2 className="text-sm font-heading font-black uppercase text-police-black tracking-wide flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-police-black" />
          INCIDENT DISPATCH CONSOLE // LOGS
        </h2>
        <span className="text-[10px] font-bold bg-police-black text-police-yellow px-2 py-0.5 border border-police-black">
          LIVE FEED
        </span>
      </div>

      {/* Primary Investigation Message Box */}
      <div className="border-4 border-police-black p-3 bg-police-terminal text-white">
        <div className="text-[10px] text-police-yellow font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
          <Shield className="w-3.5 h-3.5" />
          CHIEF INVESTIGATOR'S DIRECTIVE:
        </div>
        <div className="text-lg md:text-xl font-heading font-black tracking-wide text-police-yellow">
          {investigation.headline}
        </div>
        <div className="text-xs text-white/90 mt-0.5 leading-relaxed font-mono">
          {investigation.subtext}
        </div>
      </div>

      {/* Terminal Log Output */}
      <div className="border-2 border-police-black bg-police-terminal p-2.5 h-36 overflow-y-auto space-y-1.5 text-xs text-police-green">
        <div className="text-[10px] text-police-muted pb-1 border-b border-police-muted/30">
          // CHIRI_POLICE_SECURE_TTY_01 // ACTIVE SESSION
        </div>
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-2 leading-tight">
            <span className="text-police-muted shrink-0 text-[10px]">{log.time}</span>
            <span
              className={
                log.level === 'violation'
                  ? 'text-police-red font-bold'
                  : log.level === 'warn'
                  ? 'text-police-yellow font-bold'
                  : 'text-police-green'
              }
            >
              {log.message}
            </span>
          </div>
        ))}
      </div>

      {/* Subtext State Badge */}
      <div className="flex items-center justify-between text-[10px] text-police-muted uppercase border-t-2 border-police-black pt-2">
        <span>STATE MACHINE: {detectionState}</span>
        <span>STATION CODE: 104-MALABAR</span>
      </div>
    </div>
  );
};
