import React from 'react';
import { AstrologerId, getAstrologerById } from '@/data/jyothishamData';

export type UnniExpression = 'idle' | 'scanning' | 'verdict' | 'shocked';

interface UnniAvatarProps {
  expression?: UnniExpression;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isSpeaking?: boolean;
  astrologerId?: AstrologerId;
}

export const UnniAvatar: React.FC<UnniAvatarProps> = ({
  expression = 'idle',
  className = '',
  size = 'md',
  isSpeaking = false,
  astrologerId = 'unni',
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16 sm:w-20 sm:h-20',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
    xl: 'w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32',
  };

  const dimension = sizeMap[size] || sizeMap.md;
  const astrologer = getAstrologerById(astrologerId);

  // If character uses an authentic movie image (Kumbidi, Yeshu)
  if (astrologer.avatarType === 'image' && astrologer.avatarSrc) {
    return (
      <div
        className={`relative rounded-full border-3 border-black bg-[#FFE500] shadow-[3px_3px_0px_#000000] overflow-hidden shrink-0 flex items-center justify-center select-none ${dimension} ${className}`}
        title={astrologer.name}
      >
        <img
          src={astrologer.avatarSrc}
          alt={astrologer.name}
          className={`w-full h-full object-cover object-center ${
            expression === 'scanning' ? 'scale-105 contrast-110 brightness-95 transition-transform duration-300' : ''
          }`}
        />
        {/* Expression comic overlay badge for movie character */}
        {expression === 'scanning' && (
          <div className="absolute inset-0 bg-chiri-yellow/15 animate-pulse pointer-events-none" />
        )}
        {expression === 'shocked' && (
          <div className="absolute top-1 right-1 bg-chiri-red text-white text-[8px] font-bold px-1 rounded-full border border-black animate-bounce pointer-events-none">
            !
          </div>
        )}
      </div>
    );
  }

  // Otherwise, default SVG vector character for Unni Namboothiri
  return (
    <div
      className={`relative rounded-full border-3 border-black bg-[#FFE500] shadow-[3px_3px_0px_#000000] overflow-hidden shrink-0 flex items-center justify-center select-none ${dimension} ${className}`}
      title={astrologer.name}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full object-cover"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Yellow Warm Background */}
        <circle cx="50" cy="50" r="50" fill="#FFE500" />

        {/* Traditional Hair Tuft (Kuduma / കുടുമ) */}
        <path
          d="M 62 18 C 65 10, 72 10, 74 14 C 76 18, 70 24, 65 24 Z"
          fill="#000000"
        />
        <circle cx="72" cy="14" r="3.5" fill="#000000" />
        <path
          d="M 68 18 Q 78 22 75 28"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Head Outline & Skin Tone */}
        <circle
          cx="50"
          cy="48"
          r="26"
          fill="#F5D0A9"
          stroke="#000000"
          strokeWidth="2.5"
        />

        {/* Ears */}
        <path
          d="M 23 46 C 21 42, 21 54, 24 53"
          fill="#F5D0A9"
          stroke="#000000"
          strokeWidth="2"
        />
        <path
          d="M 77 46 C 79 42, 79 54, 76 53"
          fill="#F5D0A9"
          stroke="#000000"
          strokeWidth="2"
        />
        {/* Kundalam / Gold Ear Stud */}
        <circle cx="23" cy="50" r="1.5" fill="#D4AF37" stroke="#000" strokeWidth="0.8" />
        <circle cx="77" cy="50" r="1.5" fill="#D4AF37" stroke="#000" strokeWidth="0.8" />

        {/* Chandanakkuri (ചന്ദനക്കുറി — 3 white horizontal sacred ash/sandal stripes) */}
        <rect x="36" y="32" width="28" height="2.5" rx="1.2" fill="#FFFFFF" />
        <rect x="38" y="35.5" width="24" height="2.2" rx="1.1" fill="#FFFFFF" />
        <rect x="40" y="38.7" width="20" height="2" rx="1" fill="#FFFFFF" />
        {/* Red Vermilion / Sindoor Dot (കുങ്കുമപ്പൊട്ട്) */}
        <circle cx="50" cy="36.5" r="2" fill="#FF1E1E" />

        {/* Eyebrows based on Expression */}
        {expression === 'scanning' ? (
          // Deep concentrated furrowed brows
          <>
            <path d="M 33 41 Q 40 46 44 43" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 67 41 Q 60 46 56 43" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
            {/* Forehead worry lines */}
            <path d="M 46 29 Q 50 27 54 29" stroke="#000000" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          </>
        ) : expression === 'shocked' ? (
          // High arched skeptical brows
          <>
            <path d="M 33 39 Q 39 34 45 37" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 67 39 Q 61 34 55 37" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : (
          // Knowing / confident Kerala astrologer brows
          <>
            <path d="M 34 41 Q 40 37 45 40" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 66 41 Q 60 37 55 40" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}

        {/* Classic Thick Round Spectacles */}
        {/* Left Rim */}
        <circle cx="39" cy="48" r="8" fill="#FFFFFF" fillOpacity="0.4" stroke="#000000" strokeWidth="2" />
        {/* Right Rim */}
        <circle cx="61" cy="48" r="8" fill="#FFFFFF" fillOpacity="0.4" stroke="#000000" strokeWidth="2" />
        {/* Spectacles Bridge */}
        <path d="M 47 48 Q 50 46 53 48" stroke="#000000" strokeWidth="2" fill="none" />
        {/* Spectacle Arms */}
        <path d="M 31 48 L 24 47" stroke="#000000" strokeWidth="1.5" />
        <path d="M 69 48 L 76 47" stroke="#000000" strokeWidth="1.5" />

        {/* Eyes inside Spectacles */}
        {expression === 'scanning' ? (
          // Squinting focused eyes
          <>
            <path d="M 36 48 Q 39 46 42 48" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
            <path d="M 58 48 Q 61 46 64 48" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : expression === 'shocked' ? (
          // Wide staring eyes
          <>
            <circle cx="39" cy="48" r="3.5" fill="#000000" />
            <circle cx="40.5" cy="46.5" r="1" fill="#FFFFFF" />
            <circle cx="61" cy="48" r="3.5" fill="#000000" />
            <circle cx="62.5" cy="46.5" r="1" fill="#FFFFFF" />
          </>
        ) : (
          // Deadpan skeptical gaze looking slightly over or through glasses
          <>
            <ellipse cx="39" cy="48" rx="2.5" ry="2" fill="#000000" />
            <circle cx="40" cy="47" r="0.8" fill="#FFFFFF" />
            <ellipse cx="61" cy="48" rx="2.5" ry="2" fill="#000000" />
            <circle cx="62" cy="47" r="0.8" fill="#FFFFFF" />
          </>
        )}

        {/* Nose */}
        <path
          d="M 50 46 L 50 54 Q 53 56 50 58 Q 47 56 49 54"
          stroke="#000000"
          strokeWidth="1.8"
          fill="#F5D0A9"
          strokeLinejoin="round"
        />

        {/* Mustache & Mouth */}
        {isSpeaking ? (
          // Animated speaking mouth talking in Malayalam
          <g className="animate-pulse">
            <path
              d="M 39 59 Q 50 63 61 59 Q 50 58 39 59 Z"
              fill="#000000"
            />
            <ellipse cx="50" cy="63" rx="4" ry="3" fill="#8B0000" stroke="#000000" strokeWidth="1.5" />
            <path d="M 46 61.5 L 54 61.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        ) : expression === 'shocked' ? (
          // Mouth open in disbelief
          <>
            <path
              d="M 40 59 Q 50 63 60 59 Q 50 58 40 59 Z"
              fill="#000000"
            />
            <ellipse cx="50" cy="63.5" rx="3.5" ry="3" fill="#8B0000" stroke="#000000" strokeWidth="1.5" />
          </>
        ) : expression === 'verdict' ? (
          // Smug sarcastic smile
          <>
            <path
              d="M 39 59 Q 45 62 50 60 Q 55 62 61 58 Q 50 57 39 59 Z"
              fill="#000000"
            />
            <path d="M 45 64 Q 52 66 56 63" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          // Deadpan straight mustache
          <>
            <path
              d="M 40 59 Q 50 62 60 59 Q 50 57.5 40 59 Z"
              fill="#000000"
            />
            <path d="M 46 64 L 54 64" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}

        {/* Shoulders / Body & Torso */}
        <path
          d="M 18 100 C 18 78, 30 72, 50 72 C 70 72, 82 78, 82 100 Z"
          fill="#F5D0A9"
          stroke="#000000"
          strokeWidth="2.5"
        />

        {/* Kasavu Melmundu / Shawl over left shoulder (Golden border) */}
        <path
          d="M 20 80 C 24 74, 38 72, 42 100 L 18 100 Z"
          fill="#FAF8F5"
          stroke="#000000"
          strokeWidth="2"
        />
        {/* Gold border on shawl */}
        <path d="M 32 74 L 40 100" stroke="#D4AF37" strokeWidth="2.5" />

        {/* Poonool (പൂണൂൽ — sacred white thread diagonally across chest) */}
        <path
          d="M 36 73 Q 52 86 66 100"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <path
          d="M 36 73 Q 52 86 66 100"
          stroke="#000000"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />

        {/* Rudraksha Necklace */}
        <circle cx="48" cy="74" r="1.5" fill="#8B4513" stroke="#000" strokeWidth="0.5" />
        <circle cx="52" cy="74" r="1.5" fill="#8B4513" stroke="#000" strokeWidth="0.5" />
        <circle cx="56" cy="76" r="1.5" fill="#8B4513" stroke="#000" strokeWidth="0.5" />
        <circle cx="44" cy="76" r="1.5" fill="#8B4513" stroke="#000" strokeWidth="0.5" />

        {/* Animated Cowrie Shells (കവടി) during scanning */}
        {expression === 'scanning' && (
          <g className="animate-pulse">
            <ellipse cx="28" cy="88" rx="3.5" ry="2.2" fill="#FAF0E6" stroke="#000" strokeWidth="1" transform="rotate(-20 28 88)" />
            <path d="M 26 88 L 30 88" stroke="#8B4513" strokeWidth="0.8" />
            <ellipse cx="72" cy="88" rx="3.5" ry="2.2" fill="#FAF0E6" stroke="#000" strokeWidth="1" transform="rotate(25 72 88)" />
            <path d="M 70 88 L 74 88" stroke="#8B4513" strokeWidth="0.8" />
          </g>
        )}
      </svg>
    </div>
  );
};
