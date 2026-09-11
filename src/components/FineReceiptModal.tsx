import React, { useRef } from 'react';
import { useSmileStore } from '@/store/useSmileStore';
import { X, Download } from 'lucide-react';

export const FineReceiptModal: React.FC = () => {
  const {
    fineReceiptOpen,
    toggleFineReceipt,
    smileScore,
    teethCount,
    smileTypeMl,
    sneakinessScore,
    symmetryScore,
    currentMockLine,
  } = useSmileStore();

  const receiptRef = useRef<HTMLDivElement | null>(null);

  if (!fineReceiptOpen) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB');
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const receiptId = `CHIRI-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleDownloadReceipt = () => {
    if (!receiptRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 450;
    canvas.height = 580;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw Brutalist Receipt on Canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 450, 580);

    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 438, 568);

    // Header Banner
    ctx.fillStyle = '#000000';
    ctx.fillRect(10, 10, 430, 70);

    ctx.fillStyle = '#FFE500';
    ctx.font = '900 18px "Noto Sans Malayalam", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('കേരള ചിരി നിയന്ത്രണ ബോർഡ്', 225, 40);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('OFFICIAL SMILE FINE NOTICE // PENALTY SLIP', 225, 62);

    // Body
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`RECEIPT NO: ${receiptId}`, 25, 115);
    ctx.fillText(`DATE & TIME: ${dateStr} - ${timeStr}`, 25, 135);

    // Divider
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(25, 150);
    ctx.lineTo(425, 150);
    ctx.stroke();

    // Violation items
    ctx.font = 'bold 13px monospace';
    ctx.fillText('കുറ്റം (OFFENSE):', 25, 180);
    ctx.fillStyle = '#FF1E1E';
    ctx.font = '900 15px "Noto Sans Malayalam", sans-serif';
    ctx.fillText('ചിരിച്ച കുറ്റത്തിന് (Illegal Smiling)', 180, 180);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('ചിരി തരം (TYPE):', 25, 215);
    ctx.fillStyle = '#000000';
    ctx.font = '900 15px "Noto Sans Malayalam", sans-serif';
    ctx.fillText(smileTypeMl || 'കള്ളച്ചിരി', 180, 215);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('ചിരി ലെവൽ (SMILE):', 25, 250);
    ctx.fillText(`${Math.round(smileScore)}%`, 180, 250);

    ctx.fillText('പല്ലിന്റെ എണ്ണം (TEETH):', 25, 285);
    ctx.fillText(`${teethCount} / 32 പല്ല്`, 180, 285);

    ctx.fillText('കള്ളത്തരം (SNEAKY):', 25, 320);
    ctx.fillText(`${sneakinessScore}%`, 180, 320);

    ctx.fillText('സിമെട്രി (SYMMETRY):', 25, 355);
    ctx.fillText(`${symmetryScore}%`, 180, 355);

    // Fine Amount Banner
    ctx.fillStyle = '#FFE500';
    ctx.fillRect(25, 380, 400, 55);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(25, 380, 400, 55);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('TOTAL FINE / പിഴ തുക:', 40, 402);
    ctx.font = '900 16px "Noto Sans Malayalam", sans-serif';
    ctx.fillText('₹500 അല്ലെങ്കിൽ 1 കിലോ ഉള്ളി', 40, 424);

    // Quote
    if (currentMockLine?.malayalam) {
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px "Noto Sans Malayalam", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`"${currentMockLine.malayalam}"`, 225, 475);
    }

    // Official Stamp
    ctx.strokeStyle = '#FF1E1E';
    ctx.lineWidth = 4;
    ctx.strokeRect(130, 500, 190, 45);
    ctx.fillStyle = '#FF1E1E';
    ctx.font = '900 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★ BUSTED / കുറ്റക്കാരൻ ★', 225, 528);

    // Trigger download
    const link = document.createElement('a');
    link.download = `chiri-fine-receipt-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        ref={receiptRef}
        className="w-full max-w-sm bg-white border-4 border-black shadow-brutal p-4 flex flex-col relative animate-in zoom-in-95 duration-150"
      >
        {/* Close button */}
        <button
          onClick={toggleFineReceipt}
          className="absolute top-2 right-2 w-7 h-7 bg-black text-white hover:bg-chiri-red flex items-center justify-center border-2 border-black cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Seal */}
        <div className="bg-black text-chiri-yellow p-2.5 text-center border-2 border-black mb-3">
          <div className="font-ml font-black text-base md:text-lg leading-tight">
            കേരള ചിരി നിയന്ത്രണ ബോർഡ്
          </div>
          <div className="font-mono text-[10px] font-bold text-white uppercase tracking-wider">
            OFFICIAL SMILE PENALTY NOTICE
          </div>
        </div>

        {/* Receipt Details */}
        <div className="border-2 border-black p-2.5 font-mono text-xs space-y-1.5 bg-chiri-bg mb-3">
          <div className="flex justify-between border-b border-black/20 pb-1 text-[11px]">
            <span className="font-bold">RECEIPT NO:</span>
            <span className="font-black">{receiptId}</span>
          </div>

          <div className="flex justify-between text-[11px]">
            <span className="font-bold text-black/70">കുറ്റം (OFFENSE):</span>
            <span className="font-black text-chiri-red">ചിരിച്ച കുറ്റത്തിന്</span>
          </div>

          <div className="flex justify-between text-[11px]">
            <span className="font-bold text-black/70">ചിരി തരം (TYPE):</span>
            <span className="font-ml font-black">{smileTypeMl}</span>
          </div>

          <div className="flex justify-between text-[11px]">
            <span className="font-bold text-black/70">പല്ല് (TEETH):</span>
            <span className="font-black">{teethCount} / 32 പല്ല്</span>
          </div>

          <div className="flex justify-between text-[11px]">
            <span className="font-bold text-black/70">കള്ളത്തരം (SNEAKY):</span>
            <span className="font-black">{sneakinessScore}%</span>
          </div>

          <div className="flex justify-between text-[11px]">
            <span className="font-bold text-black/70">സിമെട്രി (SYMMETRY):</span>
            <span className="font-black">{symmetryScore}%</span>
          </div>

          {/* Fine amount */}
          <div className="bg-chiri-yellow border-2 border-black p-2 mt-2 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase text-black/70">TOTAL FINE / പിഴ തുക:</span>
            <span className="font-ml font-black text-sm text-black">
              ₹500 അല്ലെങ്കിൽ 1 കിലോ ഉള്ളി
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadReceipt}
            className="flex-1 py-2 bg-chiri-yellow hover:bg-white text-black border-2 border-black font-black uppercase text-xs shadow-brutal-sm flex items-center justify-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <Download className="w-3.5 h-3.5" />
            രസീത് സേവ് ചെയ്യുക
          </button>
          <button
            onClick={toggleFineReceipt}
            className="px-3 py-2 bg-black text-white hover:bg-chiri-red border-2 border-black font-bold uppercase text-xs cursor-pointer"
          >
            ക്ലോസ്
          </button>
        </div>
      </div>
    </div>
  );
};
