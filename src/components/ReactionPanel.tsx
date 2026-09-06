import React from 'react';
import { useSmileStore } from '@/store/useSmileStore';
import { formatBrutalistProgressBar, getSmileStateLabel } from '@/utils/smileClassifier';
import { Sparkles, Film, ReceiptText } from 'lucide-react';
import { EXPRESSION_METADATA, getRandomExpressionVideo } from '@/utils/expressionDetector';

export const ReactionPanel: React.FC = () => {
  const {
    smileScore,
    isSmiling,
    smileIntensity,
    teethCount,
    teethVerdictMl,
    smileTypeMl,
    sneakinessScore,
    symmetryScore,
    currentExpression,
    mockStage,
    mockText,
    startMockSequence,
    currentMockVideo,
    currentMockLine,
    isPlayingMock,
    toggleFineReceipt,
  } = useSmileStore();

  const roundedScore = Math.round(smileScore);
  const progressBar = formatBrutalistProgressBar(roundedScore, 10);
  const stateLabel = getSmileStateLabel(smileIntensity, isSmiling);

  const exprMeta = currentExpression !== 'neutral' ? EXPRESSION_METADATA[currentExpression] : null;

  // Fallback Malayalam dialogue defaults based on intensity
  const defaultDialogueMl =
    teethCount >= 28
      ? '32 പല്ലും വെളിയിൽ കാട്ടി ചിരിക്കാൻ നാണമില്ലേ?!'
      : smileIntensity === 'extreme'
      ? 'ഇവൻ എന്തോ കാര്യമായി ഒപ്പിച്ചിട്ടുണ്ട്!'
      : smileIntensity === 'medium'
      ? 'എന്താടാ ഇത്ര സന്തോഷം?'
      : 'അത് ചിരിയാണോ അതോ പരിഹാസമോ?';

  const activeMalayalam =
    mockText ||
    currentMockLine?.malayalam ||
    currentMockVideo?.caption ||
    (exprMeta ? exprMeta.mockLines[0] : defaultDialogueMl);

  const character =
    exprMeta?.character || currentMockVideo?.character || 'മലയാളം റോസ്റ്റ്';
  const intensityLabel = (currentMockVideo?.intensity || smileIntensity || 'mild').toUpperCase();

  const isMockActive = isSmiling || isPlayingMock || mockStage !== 'idle';

  return (
    <div className="flex flex-col h-full w-full justify-between gap-2 md:gap-3">
      {/* 1. SMILE SCORE STRIP + SMILE TYPE + TEETH COUNTER */}
      <div className="border-3 border-black bg-white p-2.5 md:p-3 shadow-brutal flex flex-col justify-between shrink-0">
        <div className="flex items-center justify-between font-mono font-bold text-xs md:text-sm">
          <span className="uppercase text-black/70">SMILE LEVEL</span>
          <div className="flex items-center gap-1.5">
            {smileTypeMl && smileTypeMl !== 'ചിരിയില്ല' && (
              <span className="px-1.5 py-0.5 bg-black text-chiri-yellow border border-black font-ml font-bold text-[10px]">
                {smileTypeMl}
              </span>
            )}
            <span
              className={`px-1.5 py-0.5 border-2 border-black font-black text-xs uppercase ${
                isSmiling ? 'bg-chiri-yellow text-black animate-pulse' : 'bg-chiri-gray text-black'
              }`}
            >
              {stateLabel}
            </span>
          </div>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <span className="text-3xl md:text-4xl font-heading font-black tracking-tight">
            {roundedScore}%
          </span>
          <span className="font-mono text-base md:text-lg tracking-widest text-black">
            {progressBar}
          </span>
        </div>

        {/* Humorous Brutalist Teeth Counter Strip */}
        <div className="flex items-center justify-between border-t-2 border-black/15 pt-1.5 mt-1.5 font-mono text-[11px] md:text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-black">🦷 പല്ല്:</span>
            <span
              className={`font-mono font-black px-1.5 py-0.2 border border-black text-[11px] ${
                teethCount >= 28
                  ? 'bg-chiri-red text-white animate-bounce'
                  : teethCount >= 10
                  ? 'bg-chiri-yellow text-black'
                  : 'bg-chiri-gray text-black'
              }`}
            >
              {teethCount} / 32
            </span>
          </div>
          <span className="font-ml font-bold text-[11px] md:text-xs text-black/80 truncate max-w-[190px] md:max-w-[220px]">
            {teethVerdictMl}
          </span>
        </div>

        {/* Sneakiness & Symmetry Forensic Metric Strip */}
        {isSmiling && (
          <div className="flex items-center justify-between border-t border-black/10 pt-1 mt-1 font-mono text-[10px] text-black/70">
            <span>കള്ളത്തരം: <strong className="text-black">{sneakinessScore}%</strong></span>
            <span>സിമെട്രി: <strong className="text-black">{symmetryScore}%</strong></span>
          </div>
        )}
      </div>

      {/* 2. MAIN MALAYALAM TEXT MOCK / REACTION CARD */}
      <div
        className={`border-3 border-black p-3 md:p-4 shadow-brutal flex flex-col justify-between relative flex-1 min-h-0 transition-all ${
          isMockActive
            ? smileIntensity === 'extreme' || teethCount >= 28
              ? 'bg-chiri-red text-white'
              : 'bg-chiri-yellow text-black'
            : 'bg-white text-black'
        }`}
      >
        {!isMockActive ? (
          /* Standby State: Waiting for expression / smile */
          <div className="flex flex-col items-center justify-center h-full text-center my-auto">
            <span className="text-3xl md:text-4xl mb-1.5 font-mono">😐</span>
            <span className="font-ml font-black text-sm md:text-base text-black/90">
              ചിരിക്കൂ... കാണട്ടെ!
            </span>
            <span className="font-mono text-[11px] text-black/50 mt-0.5 max-w-xs mb-2.5">
              ക്യാമറയിൽ നോക്കി ചിരിച്ചാൽ ട്രോൾ റെഡി.
            </span>

            {/* Expression Comedy Video Buttons */}
            <div className="w-full border-t-2 border-black/15 pt-2">
              <div className="font-mono text-[10px] font-bold text-black/70 uppercase mb-1.5 flex items-center justify-center gap-1">
                <Film className="w-3 h-3" />
                EXPRESSION VIDEOS (OVERLAY + SOUND):
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {(
                  [
                    'smile',
                    'laughing',
                    'suspicious',
                    'joker',
                    'beard',
                    'angry',
                    'cry',
                    'fear',
                    'curious',
                  ] as const
                ).map((expr) => (
                  <button
                    key={expr}
                    onClick={(e) => {
                      e.stopPropagation();
                      startMockSequence({
                        expression: expr,
                        videoUrl: getRandomExpressionVideo(expr),
                      });
                    }}
                    className={`px-2 py-0.5 border-2 border-black font-mono text-[9px] md:text-[10px] font-black uppercase shadow-brutal-sm cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                      currentExpression === expr
                        ? 'bg-chiri-yellow text-black'
                        : 'bg-white text-black hover:bg-black hover:text-white'
                    }`}
                  >
                    {expr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Pure Malayalam Dialogue Reaction */
          <div className="flex flex-col justify-between h-full w-full animate-in fade-in duration-100">
            {/* Top Tag: Intensity / Stage, Smile Type & Character */}
            <div className="flex items-center justify-between font-mono text-[10px] md:text-xs font-bold border-b-2 border-black/30 pb-1.5 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-black text-white font-black uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-chiri-yellow" />
                  {mockStage === 'text_mock'
                    ? '1. TEXT ROAST'
                    : mockStage === 'video_dialogue'
                    ? '2. MOVIE DIALOGUE'
                    : intensityLabel}
                </span>
                {smileTypeMl && smileTypeMl !== 'ചിരിയില്ല' && (
                  <span className="px-1.5 py-0.5 bg-white text-black border border-black font-ml font-black">
                    {smileTypeMl}
                  </span>
                )}
              </div>
              <span className="font-ml font-bold uppercase tracking-wider text-xs opacity-90">
                {character}
              </span>
            </div>

            {/* Middle: Pure Punchy Malayalam Dialogue / Roast */}
            <div className="flex flex-col justify-center items-center text-center my-auto py-2">
              <div className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-ml font-black leading-tight tracking-tight text-center">
                "{activeMalayalam}"
              </div>
              {mockStage === 'text_mock' && (
                <div className="font-mono text-[10px] md:text-xs font-bold text-black bg-white/90 border border-black px-2 py-0.5 mt-2 flex items-center gap-1.5 shadow-brutal-sm animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-chiri-red animate-ping" />
                  <span>🎬 മൂവി ഡയലോഗ് വരുന്നു... (MOVIE DIALOGUE INCOMING...)</span>
                </div>
              )}
              {mockStage === 'video_dialogue' && (
                <div className="font-mono text-[10px] md:text-xs font-bold text-white bg-black px-2 py-0.5 mt-2 flex items-center gap-1.5 shadow-brutal-sm">
                  <span className="w-2 h-2 rounded-full bg-chiri-yellow animate-pulse" />
                  <span>🎬 MOVIE DIALOGUE PLAYING</span>
                </div>
              )}
            </div>

            {/* Bottom Actions: Teeth count & Fine Receipt Button */}
            <div className="flex items-center justify-between pt-1.5 border-t-2 border-black/30 text-[10px] md:text-[11px] font-mono shrink-0">
              <span className="font-bold opacity-85">
                {teethCount > 0 ? `🦷 ${teethCount} പല്ല് വെളിയിൽ` : 'പല്ല് ഒളിച്ചിരിക്കുന്നു'}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFineReceipt();
                }}
                className="px-2 py-0.5 bg-black text-chiri-yellow hover:bg-white hover:text-black border border-black font-bold uppercase shadow-brutal-sm cursor-pointer flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
              >
                <ReceiptText className="w-3 h-3" />
                <span>പിഴ രസീത്</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
