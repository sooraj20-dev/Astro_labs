import React, { useRef } from 'react';
import { useSmileStore } from '@/store/useSmileStore';
import { X, Download, Copy, Check } from 'lucide-react';
import { UNNI_PROFILE } from '@/data/jyothishamData';

export const ShareCardModal: React.FC = () => {
  const { isShareCardOpen, setShareCardOpen, currentJathakam } = useSmileStore();
  const [copied, setCopied] = React.useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  if (!isShareCardOpen || !currentJathakam) return null;

  const {
    archetype,
    career,
    money,
    luck,
    future,
    confidence,
    unniSpeech,
    unniDosham,
    unniRemedy,
    unniDakshina,
    astrologerName = UNNI_PROFILE.name,
    astrologerTitle = UNNI_PROFILE.movieTitle,
  } = currentJathakam;

  const handleDownload = () => {
    // Client-side HTML5 canvas snapshot
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 760;

    // Background
    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer Brutalist Border & Shadow
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Header Banner
    ctx.fillStyle = '#FFE500';
    ctx.fillRect(24, 24, canvas.width - 48, 86);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, canvas.width - 48, 86);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px "Noto Sans Malayalam", sans-serif';
    ctx.fillText(astrologerName, 44, 62);

    ctx.font = 'bold 12px monospace';
    ctx.fillText('ASTRO LAB // OFFICIAL ASTROLOGICAL VERDICT', 44, 84);

    ctx.font = 'bold 12px "Noto Sans Malayalam", sans-serif';
    ctx.fillText(astrologerTitle, 44, 102);

    // Archetype & Astrologer Roast Section
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(40, 130, canvas.width - 80, 120);
    ctx.strokeRect(40, 130, canvas.width - 80, 120);

    ctx.fillStyle = '#555555';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`FACE ARCHETYPE • LUCK: ${luck}%`, 56, 154);

    ctx.fillStyle = '#000000';
    ctx.font = '900 20px sans-serif';
    ctx.fillText(archetype.name, 56, 180);

    ctx.font = 'bold 12px "Noto Sans Malayalam", sans-serif';
    ctx.fillStyle = '#C00000';
    ctx.fillText(`${astrologerName}: "${unniSpeech.slice(0, 48)}..."`, 56, 208);

    ctx.fillStyle = '#000000';
    ctx.font = '11px "Noto Sans Malayalam", sans-serif';
    ctx.fillText(`ദോഷം: ${unniDosham.slice(0, 45)}`, 56, 232);

    // Prediction Details Grid
    const details = [
      { label: 'CAREER (തൊഴിൽ)', value: career },
      { label: 'MONEY (ധനസ്ഥിതി)', value: money },
      { label: 'FUTURE (ഭാവി)', value: `"${future}"` },
      { label: 'REMEDY (പരിഹാരം)', value: `"${unniRemedy}"` },
    ];

    let startY = 270;
    details.forEach((item) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(40, startY, canvas.width - 80, 64);
      ctx.strokeRect(40, startY, canvas.width - 80, 64);

      ctx.fillStyle = '#555555';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(item.label, 56, startY + 22);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 13px "Noto Sans Malayalam", sans-serif';
      ctx.fillText(item.value.slice(0, 52), 56, startY + 46);

      startY += 74;
    });

    // Remedy & Dakshina Banner
    ctx.fillStyle = '#FFE500';
    ctx.fillRect(40, startY + 5, canvas.width - 80, 36);
    ctx.strokeRect(40, startY + 5, canvas.width - 80, 36);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px "Noto Sans Malayalam", sans-serif';
    ctx.fillText(`${unniDakshina} • ഗൂഗിൾ പേ സ്വീകരിക്കും`, 56, startY + 28);

    // Footer Joke
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`CONFIDENCE: ${confidence}  •  SCIENTIFIC BASIS: NONE`, 44, 705);
    ctx.font = '11px "Noto Sans Malayalam", sans-serif';
    ctx.fillText(`${astrologerName} സാക്ഷ്യപ്പെടുത്തിയത്: ശാസ്ത്രീയമല്ല, പക്ഷേ തർക്കിക്കാൻ നിൽക്കണ്ട.`, 44, 725);

    // Download PNG
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `astro-lab-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleCopyText = () => {
    const text = `🔮 ${astrologerName} (മുഖ ജാതകം)\n${astrologerTitle}\n\n👤 ARCHETYPE: ${archetype.name} (LUCK: ${luck}%)\n🎙️ ${astrologerName}യുടെ നിരീക്ഷണം: "${unniSpeech}"\n⚠️ ദോഷം: ${unniDosham}\n\n💼 CAREER: ${career}\n💰 MONEY: ${money}\n🔮 FUTURE: "${future}"\n🌿 പരിഹാരം: "${unniRemedy}" (${unniDakshina})\n\nCONFIDENCE: ${confidence} | SCIENTIFIC BASIS: NONE\n"${astrologerName} സാക്ഷ്യപ്പെടുത്തിയത്: ശാസ്ത്രീയമല്ല, പക്ഷേ തർക്കിക്കാൻ നിൽക്കണ്ട."`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/75 flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-white border-3 border-black p-4 sm:p-5 shadow-[8px_8px_0px_#FFE500] max-w-sm w-full flex flex-col gap-3 animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <span className="font-mono text-xs font-black uppercase text-black">
            {astrologerName.toUpperCase()}'S OFFICIAL JATHAKAM CARD
          </span>
          <button
            onClick={() => setShareCardOpen(false)}
            className="p-1 hover:bg-chiri-yellow border border-black cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Share Card Preview */}
        <div
          ref={cardRef}
          className="border-2 border-black p-3 bg-[#FAF8F5] shadow-[3px_3px_0px_#000] flex flex-col gap-2"
        >
          {/* Card Astrologer Header */}
          <div className="flex items-center justify-between font-mono text-[9px] text-black/60 font-black border-b border-black/20 pb-1">
            <span className="font-ml text-black font-bold">{astrologerName}</span>
            <span>LUCK: {luck}%</span>
          </div>

          {/* Archetype & Astrologer Roast Box */}
          <div className="bg-chiri-yellow border border-black p-2">
            <span className="font-mono text-[8px] uppercase font-black text-black/60 block">
              FACE ARCHETYPE • {archetype.name}
            </span>
            <span className="font-ml text-xs font-bold text-black block mt-0.5 leading-snug">
              🎙️ {astrologerName}: "{unniSpeech}"
            </span>
          </div>

          {/* Dosham Box */}
          <div className="bg-[#FFF4F4] border border-black p-1.5 font-ml text-[11px] text-black leading-tight">
            <span className="font-bold text-chiri-red block text-[9px] font-mono uppercase">
              പ്രധാന ദോഷം:
            </span>
            <span>{unniDosham}</span>
          </div>

          {/* Predictions Grid */}
          <div className="space-y-1 font-mono text-[10px]">
            <div className="bg-white border border-black p-1">
              <span className="text-black/60 font-bold block text-[8px]">CAREER:</span>
              <span className="font-ml font-bold text-xs text-black block truncate">{career}</span>
            </div>
            <div className="bg-white border border-black p-1">
              <span className="text-black/60 font-bold block text-[8px]">MONEY:</span>
              <span className="font-ml font-bold text-xs text-black block truncate">{money}</span>
            </div>
            <div className="bg-white border border-black p-1">
              <span className="text-black/60 font-bold block text-[8px]">FUTURE:</span>
              <span className="font-ml font-bold text-xs text-black block truncate">"{future}"</span>
            </div>
            <div className="bg-chiri-yellow/30 border border-black p-1">
              <span className="text-black/70 font-bold block text-[8px]">REMEDY (പരിഹാരം):</span>
              <span className="font-ml font-bold text-xs text-black block truncate">"{unniRemedy}"</span>
            </div>
          </div>

          {/* Stamp */}
          <div className="border-t border-black/20 pt-1 font-ml text-[9px] text-black/70 text-center">
            {astrologerName} സാക്ഷ്യപ്പെടുത്തിയത്: ശാസ്ത്രീയമല്ല, പക്ഷേ തർക്കിക്കാൻ നിൽക്കണ്ട.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleDownload}
            className="py-2 px-3 bg-chiri-yellow hover:bg-black hover:text-chiri-yellow text-black border-2 border-black font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>SAVE PNG</span>
          </button>

          <button
            onClick={handleCopyText}
            className="py-2 px-3 bg-white hover:bg-chiri-yellow text-black border-2 border-black font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-black" />
                <span>COPIED!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>COPY TEXT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
