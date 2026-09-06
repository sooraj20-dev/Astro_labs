/**
 * Advanced Facial Expression & Smile Type Classifier
 * Combines MediaPipe 52 Face Blendshapes neural model with 468 landmark geometry.
 *
 * Accurately classifies:
 * 1. കള്ളച്ചിരി (Sneaky / Asymmetric Smirk)
 * 2. പൊട്ടിച്ചിരി (Full Burst of Laughter)
 * 3. ചമ്മിയ ഇളി (Awkward / Nervous Grin)
 * 4. പല്ലിളിച്ചുള്ള ചിരി (Tooth Display / Dental Exhibition)
 * 5. മന്ദഹാസം / സാധാരണ ചിരി (Polite / Gentle Smile)
 * 6. ദേഷ്യം (Angry / Scowl)
 * 7. കരച്ചിൽ / സങ്കടം (Crying / Sad)
 * 8. പേടി / ഞെട്ടൽ (Fear / Shock)
 * 9. സംശയം (Curious / Inquisitive)
 */

import { NormalizedLandmark, calculate2DDistance } from './smileDetection';
import {
  noSmileAngry,
  noSmileCry,
  noSmileCurious4,
  noSmileSmileMock,
  smileJoker,
  smileMockLaugh1,
  smileSmile,
  wierdLaughExpression,
  wierdLaughFear,
  wierdLaughLaughing,
  wierdLaughMockLaugh,
  wierdLaughSuspicious,
  mockBeardVideo,
} from '@/data/videoAssets';

export type SmileType =
  | 'kallachiri'     // കള്ളച്ചിരി (Sneaky / Asymmetric Smirk)
  | 'pottichiri'     // പൊട്ടിച്ചിരി (Burst of Laughter)
  | 'ili'            // ചമ്മിയ ഇളി (Awkward / Embarrassed Grin)
  | 'pallilichathu'  // പല്ലിളിച്ചുള്ള ചിരി (Tooth Exhibition)
  | 'mandahasam'     // സാധാരണ ചിരി (Gentle Polite Smile)
  | 'none';          // ചിരിയില്ല (No Smile)

export type FacialExpression =
  | 'smile'
  | 'laughing'
  | 'suspicious'
  | 'joker'
  | 'beard'
  | 'angry'
  | 'cry'
  | 'fear'
  | 'curious'
  | 'expression'
  | 'neutral';

export interface DetailedExpressionResult {
  expression: FacialExpression;
  smileType: SmileType;
  smileTypeMl: string;
  smileTypeDescription: string;
  videoUrl: string;
  confidence: number;
  metrics: {
    smileScore: number;
    teethCount: number;
    mouthAsymmetry: number;
    mouthWidthRatio: number;
    mouthApertureHeight: number;
    cornerElevation: number;
    browSeparation: number;
    browElevationAvg: number;
    eyeApertureAvg: number;
    sneakinessScore: number;
    symmetryScore: number;
  };
}

export const SMILE_TYPE_INFO: Record<
  SmileType,
  { labelMl: string; descriptionMl: string; videoUrl: string; color: string }
> = {
  kallachiri: {
    labelMl: 'കള്ളച്ചിരി',
    descriptionMl: 'ഒരു വശത്തേക്ക് മാത്രമുള്ള വളഞ്ഞ ചിരി (Sneaky Smirk)',
    videoUrl: wierdLaughSuspicious,
    color: '#FFE500',
  },
  pottichiri: {
    labelMl: 'പൊട്ടിച്ചിരി',
    descriptionMl: 'വായ തുറന്നുള്ള അട്ടഹാസം (Burst of Laughter)',
    videoUrl: wierdLaughLaughing,
    color: '#FF1E1E',
  },
  ili: {
    labelMl: 'ചമ്മിയ ഇളി',
    descriptionMl: 'ചമ്മൽ മറയ്ക്കാനുള്ള വലിഞ്ഞു മുറുകിയ ചിരി (Awkward Ili)',
    videoUrl: wierdLaughMockLaugh,
    color: '#FF9900',
  },
  pallilichathu: {
    labelMl: 'പല്ലിളിച്ചുള്ള ചിരി',
    descriptionMl: 'മുഴുവൻ പല്ലും കാട്ടിയുള്ള പ്രദർശനം (Tooth Exhibition)',
    videoUrl: smileMockLaugh1,
    color: '#FF3030',
  },
  mandahasam: {
    labelMl: 'മന്ദഹാസം',
    descriptionMl: 'മനോഹരമായ സാധാരണ ചിരി (Polite Smile)',
    videoUrl: smileSmile,
    color: '#00E676',
  },
  none: {
    labelMl: 'ചിരിയില്ല',
    descriptionMl: 'ഗൗരവമുള്ള മുഖഭാവം (Serious / Neutral)',
    videoUrl: '',
    color: '#FFFFFF',
  },
};

export interface ExpressionMeta {
  url: string;
  videos: string[];
  label: string;
  labelMl: string;
  color: string;
  character: string;
  mockLines: string[];
}

export const EXPRESSION_METADATA: Record<
  Exclude<FacialExpression, 'neutral'>,
  ExpressionMeta
> = {
  laughing: {
    url: wierdLaughLaughing,
    videos: [
      wierdLaughLaughing,
      wierdLaughMockLaugh,
      smileMockLaugh1,
      smileJoker,
      noSmileAngry,
    ],
    label: 'LAUGHING',
    labelMl: 'പൊട്ടിച്ചിരി',
    color: '#FF1E1E',
    character: 'സലീം കുമാർ / പപ്പു / ജഗതി',
    mockLines: [
      'പൊട്ടിച്ചിരിക്കാൻ ഇവിടെ ആരും തമാശ പറഞ്ഞില്ല!',
      'അയ്യോ കൺട്രോൾ പോയി! വാ മൂട് മനുഷ്യാ!',
      '32 പല്ലും വെളിയിൽ കാട്ടി ചിരിക്കാൻ നാണമില്ലേ?!',
      'ഇവൻ എന്തോ കാര്യമായി ഒപ്പിച്ചിട്ടുണ്ട്!',
      'അടിയന്തര സാഹചര്യം! ഇവിടെ ചിരി സുനാമി വരുന്നു!',
    ],
  },
  smile: {
    url: smileSmile,
    videos: [
      smileSmile,
      smileMockLaugh1,
      noSmileSmileMock,
      noSmileCurious4,
      wierdLaughExpression,
      wierdLaughMockLaugh,
    ],
    label: 'SMILING',
    labelMl: 'കള്ളച്ചിരി',
    color: '#FFE500',
    character: 'ഇന്നസെന്റ് / ജഗതി / മോഹൻലാൽ',
    mockLines: [
      'എന്താ ചുണ്ടിലൊരു കള്ളച്ചിരി? ഒതുക്കിപ്പിടിച്ചോ!',
      'മെല്ലെ ചിരിച്ചാൽ മതി, പല്ല് കൊഴിഞ്ഞു പോകും!',
      'ആ ചുണ്ടിന്റെ കോണിലെ കളി ഞങ്ങൾ കണ്ടു!',
      'കാര്യം പറ, എന്താ മനസ്സിൽ കുസൃതി?',
      'ഈ ചിരി അത്ര പന്തിയല്ലല്ലോ മോനേ!',
    ],
  },
  suspicious: {
    url: wierdLaughSuspicious,
    videos: [
      wierdLaughSuspicious,
      noSmileCurious4,
      mockBeardVideo,
      wierdLaughExpression,
    ],
    label: 'SUSPICIOUS',
    labelMl: 'സംശയം / കള്ളലക്ഷണം',
    color: '#00E676',
    character: 'സിഐഡി മൂസ / തിലകൻ',
    mockLines: [
      'ഇവന്റെ മുഖത്ത് എന്തോ കള്ളലക്ഷണം ഉണ്ടല്ലോ!',
      'ആ കണ്ണിലെ നോട്ടം ശരിയല്ല... എന്തോ ഒളിക്കുന്നുണ്ട്!',
      'പോലീസ് വാച്ച് ചെയ്യുന്നുണ്ട്, ഒതുക്കിപ്പിടിച്ചോ!',
      'ഇത്രക്ക് സംശയത്തോടെ നോക്കാൻ ഞാൻ ആരാ കള്ളനോ?',
    ],
  },
  joker: {
    url: smileJoker,
    videos: [
      smileJoker,
      wierdLaughMockLaugh,
      smileMockLaugh1,
      wierdLaughLaughing,
    ],
    label: 'JOKER',
    labelMl: 'കോമാളി / ജോക്കർ',
    color: '#FF9900',
    character: 'ജഗതി / ഇന്നസെന്റ്',
    mockLines: [
      'ഇത് കോമാളി കളിക്കാൻ പറ്റിയ സ്ഥലമല്ല!',
      'നിന്റെ ഈ കോമാളിത്തരം വേറെ എവിടെയെങ്കിലും കാണിക്ക്!',
      'മുഖം കണ്ടാൽ തോന്നും സർക്കസിൽ നിന്ന് ചാടിപ്പോന്നതാണെന്ന്!',
      'അയ്യോ തമാശക്കാരൻ! വലിയ കോമഡി ആയിപ്പോയി!',
    ],
  },
  beard: {
    url: mockBeardVideo,
    videos: [
      mockBeardVideo,
      wierdLaughExpression,
      noSmileAngry,
      wierdLaughSuspicious,
    ],
    label: 'ROWDY / BEARD',
    labelMl: 'താടി / ഗൗരവം',
    color: '#FF3300',
    character: 'സ്ഫടികം ചാക്കോ മാഷ് / ഭദ്രൻ',
    mockLines: [
      'താടിയും തടവി വലിയ ഗൗരവക്കാരനാണെന്ന ഭാവം!',
      'ഈ ഗൗരവമൊക്കെ നമ്മൾ ഒരുപാട് കണ്ടിട്ടുള്ളതാ!',
      'മീശ പിരിച്ചാൽ വലിയ ഗുണ്ടയാണെന്ന് കരുതിയോ?',
      'ഗൗരവം വിട് മനുഷ്യാ, ചിരി വരുന്നത് കാണുന്നുണ്ട്!',
    ],
  },
  angry: {
    url: noSmileAngry,
    videos: [
      noSmileAngry,
      mockBeardVideo,
      smileJoker,
      wierdLaughMockLaugh,
    ],
    label: 'ANGRY',
    labelMl: 'ദേഷ്യം',
    color: '#FF3300',
    character: 'തിലകൻ / കൊച്ചിൻ ഹനീഫ',
    mockLines: [
      'ദേഷ്യപ്പെടാൻ മാത്രം ഇവിടെ എന്തുണ്ടായി? കൂളാവ് മനുഷ്യാ!',
      'കണ്ണുരുട്ടി പേടിപ്പിക്കല്ലേ... ഞങ്ങൾ പണ്ടേ പേടിച്ചതാ!',
      'അയ്യോ സിഐഡി മൂസയിലെ ദേഷ്യം! ആരെ ഇടിക്കാനാ ഭാവം?',
      'മുഖം കണ്ടാൽ തോന്നും ലോകം മുഴുവൻ കടം വാങ്ങിയെന്ന്!',
    ],
  },
  cry: {
    url: noSmileCry,
    videos: [
      noSmileCry,
      wierdLaughFear,
      wierdLaughSuspicious,
    ],
    label: 'CRYING',
    labelMl: 'സങ്കടം / കരച്ചിൽ',
    color: '#3388FF',
    character: 'ശ്രീനിവാസൻ / സലിം കുമാർ',
    mockLines: [
      'കരഞ്ഞു മെഴുകല്ലേ പൊന്നേ, ടിഷ്യൂ എടുത്തു തരട്ടേ?',
      'സങ്കടം കണ്ടിട്ട് സഹിക്കാൻ പറ്റുന്നില്ലല്ലോ ദൈവമേ!',
      'സീരിയൽ നായികമാരെ തോൽപ്പിക്കുന്ന കരച്ചിലാണല്ലോ!',
      'എന്താ പറ്റിയേ? ബിരിയാണി കിട്ടിയില്ലേ?',
    ],
  },
  fear: {
    url: wierdLaughFear,
    videos: [
      wierdLaughFear,
      noSmileCry,
      noSmileCurious4,
    ],
    label: 'FEAR',
    labelMl: 'ഞെട്ടൽ / പേടി',
    color: '#AA00FF',
    character: 'മുകേഷ് / ജഗദീഷ്',
    mockLines: [
      'ഇത്രക്ക് പേടിക്കാൻ ഞാൻ ആരാ ഭൂതമോ? ധൈര്യമായിട്ടിരിക്ക്!',
      'അയ്യോ പേടിച്ചു പോയി! ബിപി ചെക്ക് ചെയ്യണോ?',
      'ഞെട്ടിത്തരിച്ചു നിൽക്കാതെ വല്ലതും പറ മനുഷ്യാ!',
    ],
  },
  curious: {
    url: noSmileCurious4,
    videos: [
      noSmileCurious4,
      wierdLaughSuspicious,
      noSmileSmileMock,
      smileSmile,
    ],
    label: 'CURIOUS',
    labelMl: 'സംശയം / കൗതുകം',
    color: '#00E676',
    character: 'ജഗതി ശ്രീകുമാർ',
    mockLines: [
      'എന്താ ഒരു ഗവേഷണ ബുദ്ധി? കണ്ണും തള്ളി നോക്കുന്നത് എന്തിനാ?',
      'സംശയം തോന്നാൻ ഞാൻ വല്ല കള്ളനുമാണോ?',
      'അങ്ങനെ സൂക്ഷിച്ചു നോക്കല്ലേ, എനിക്ക് നാണം വരുന്നു!',
    ],
  },
  expression: {
    url: wierdLaughExpression,
    videos: [
      wierdLaughExpression,
      mockBeardVideo,
      noSmileSmileMock,
      smileSmile,
    ],
    label: 'EXPRESSION',
    labelMl: 'മനോഹര ഭാവം',
    color: '#FFE500',
    character: 'മോഹൻലാൽ / മണിയൻപിള്ള രാജു',
    mockLines: [
      'മുഖഭാവങ്ങൾ കണ്ടാൽ ഓസ്കാർ അവാർഡ് ഉടൻ തരേണ്ടി വരും!',
      'ഭാവങ്ങൾ കൊള്ളാം, പക്ഷേ കാര്യം പറ!',
    ],
  },
};

export function getRandomExpressionVideo(expr: FacialExpression, previousUrl?: string | null): string {
  const defaultSmilePool = [
    smileSmile,
    smileMockLaugh1,
    noSmileSmileMock,
    noSmileCurious4,
    wierdLaughExpression,
  ];

  if (expr === 'neutral') {
    const unrepeated = previousUrl ? defaultSmilePool.filter((v) => v !== previousUrl) : defaultSmilePool;
    const pool = unrepeated.length > 0 ? unrepeated : defaultSmilePool;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const meta = EXPRESSION_METADATA[expr];
  if (!meta) return defaultSmilePool[Math.floor(Math.random() * defaultSmilePool.length)];

  if (meta.videos && meta.videos.length > 0) {
    const unrepeated = previousUrl ? meta.videos.filter((v) => v !== previousUrl) : meta.videos;
    const pool = unrepeated.length > 0 ? unrepeated : meta.videos;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  return meta.url || smileSmile;
}

export function getRandomExpressionMock(expr: FacialExpression): string {
  if (expr === 'neutral') return 'ഗൗരവമുള്ള മുഖഭാവം... ചിരിക്കൂ കാണട്ടെ!';
  const meta = EXPRESSION_METADATA[expr];
  if (!meta || !meta.mockLines || meta.mockLines.length === 0) {
    return 'എന്താ ചുണ്ടിലൊരു കള്ളച്ചിരി?';
  }
  return meta.mockLines[Math.floor(Math.random() * meta.mockLines.length)];
}

/**
 * Accurately classify facial expression and specific smile type
 * using both MediaPipe Blendshapes (neural) and 468 Landmark Geometry (forensic fallback).
 */
export function detectFacialExpression(
  landmarks: NormalizedLandmark[] | null,
  smileScore: number,
  teethCount: number,
  blendshapes?: Record<string, number> | null
): DetailedExpressionResult {
  const defaultResult: DetailedExpressionResult = {
    expression: 'neutral',
    smileType: 'none',
    smileTypeMl: 'ചിരിയില്ല',
    smileTypeDescription: 'ഗൗരവമുള്ള മുഖഭാവം',
    videoUrl: '',
    confidence: 1.0,
    metrics: {
      smileScore,
      teethCount,
      mouthAsymmetry: 0,
      mouthWidthRatio: 0.44,
      mouthApertureHeight: 0,
      cornerElevation: 0,
      browSeparation: 0.28,
      browElevationAvg: 0.12,
      eyeApertureAvg: 0.08,
      sneakinessScore: 0,
      symmetryScore: 100,
    },
  };

  if (!landmarks || landmarks.length < 320) {
    return defaultResult;
  }

  // 1. EXTRACT FACIAL LANDMARK GEOMETRY
  const leftEyeOuter = landmarks[33];
  const rightEyeOuter = landmarks[263];
  const eyeDist = calculate2DDistance(leftEyeOuter, rightEyeOuter);
  if (eyeDist < 0.01) return defaultResult;

  const leftInnerBrow = landmarks[107];
  const rightInnerBrow = landmarks[336];
  const leftMidBrow = landmarks[70];
  const rightMidBrow = landmarks[300];

  const leftEyeTop = landmarks[159];
  const leftEyeBottom = landmarks[145];
  const rightEyeTop = landmarks[386];
  const rightEyeBottom = landmarks[374];

  const leftCorner = landmarks[61];
  const rightCorner = landmarks[291];
  const upperLip = landmarks[0];
  const lowerLip = landmarks[17];

  const browSeparation = calculate2DDistance(leftInnerBrow, rightInnerBrow) / eyeDist;
  const leftEyeAperture = calculate2DDistance(leftEyeTop, leftEyeBottom) / eyeDist;
  const rightEyeAperture = calculate2DDistance(rightEyeTop, rightEyeBottom) / eyeDist;
  const eyeApertureAvg = (leftEyeAperture + rightEyeAperture) / 2;

  const leftBrowElev = (leftEyeTop.y - leftMidBrow.y) / eyeDist;
  const rightBrowElev = (rightEyeTop.y - rightMidBrow.y) / eyeDist;
  const browElevationAvg = (leftBrowElev + rightBrowElev) / 2;
  const browAsymmetry = Math.abs(leftBrowElev - rightBrowElev);

  const lipCenterY = (upperLip.y + lowerLip.y) / 2;
  const cornersAvgY = (leftCorner.y + rightCorner.y) / 2;
  const cornerElevation = (lipCenterY - cornersAvgY) / eyeDist;

  const leftCornerLift = (lipCenterY - leftCorner.y) / eyeDist;
  const rightCornerLift = (lipCenterY - rightCorner.y) / eyeDist;
  const mouthAsymmetry = Math.abs(leftCornerLift - rightCornerLift);

  const rawMouthWidth = calculate2DDistance(leftCorner, rightCorner);
  const mouthWidthRatio = rawMouthWidth / eyeDist;
  const mouthApertureHeight = Math.abs(lowerLip.y - upperLip.y) / eyeDist;

  // 2. EXTRACT MEDIAPIPE NEURAL BLENDSHAPES (if available)
  const bs = blendshapes || {};
  const hasBlendshapes = Object.keys(bs).length > 0;

  const bsSmileLeft = bs['mouthSmileLeft'] ?? 0;
  const bsSmileRight = bs['mouthSmileRight'] ?? 0;
  const bsSmileMax = Math.max(bsSmileLeft, bsSmileRight);
  const bsSmileAvg = (bsSmileLeft + bsSmileRight) / 2;
  const bsSmileAsym = Math.abs(bsSmileLeft - bsSmileRight);

  const bsJawOpen = bs['jawOpen'] ?? 0;
  const bsBrowDownLeft = bs['browDownLeft'] ?? 0;
  const bsBrowDownRight = bs['browDownRight'] ?? 0;
  const bsBrowDownMax = Math.max(bsBrowDownLeft, bsBrowDownRight);
  const bsBrowInnerUp = bs['browInnerUp'] ?? 0;
  const bsBrowOuterUpLeft = bs['browOuterUpLeft'] ?? 0;
  const bsBrowOuterUpRight = bs['browOuterUpRight'] ?? 0;
  const bsBrowOuterUpAsym = Math.abs(bsBrowOuterUpLeft - bsBrowOuterUpRight);
  const bsBrowOuterUpMax = Math.max(bsBrowOuterUpLeft, bsBrowOuterUpRight);

  const bsMouthFrownLeft = bs['mouthFrownLeft'] ?? 0;
  const bsMouthFrownRight = bs['mouthFrownRight'] ?? 0;
  const bsMouthFrownMax = Math.max(bsMouthFrownLeft, bsMouthFrownRight);

  const bsEyeWideLeft = bs['eyeWideLeft'] ?? 0;
  const bsEyeWideRight = bs['eyeWideRight'] ?? 0;
  const bsEyeWideMax = Math.max(bsEyeWideLeft, bsEyeWideRight);

  const bsMouthStretchLeft = bs['mouthStretchLeft'] ?? 0;
  const bsMouthStretchRight = bs['mouthStretchRight'] ?? 0;
  const bsMouthStretchMax = Math.max(bsMouthStretchLeft, bsMouthStretchRight);

  // Compute effective smile score incorporating blendshapes
  const effectiveSmileScore = hasBlendshapes
    ? Math.round(Math.max(smileScore, bsSmileAvg * 100))
    : smileScore;

  // Sneakiness & Symmetry metrics
  const effectiveAsym = hasBlendshapes ? bsSmileAsym : mouthAsymmetry * 15;
  const sneakinessScore = Math.min(
    100,
    Math.round(effectiveAsym * 120 + (teethCount <= 4 && effectiveSmileScore >= 40 ? 35 : 0))
  );
  const symmetryScore = Math.max(0, Math.min(100, Math.round(100 - effectiveAsym * 100)));

  const metrics = {
    smileScore: effectiveSmileScore,
    teethCount,
    mouthAsymmetry,
    mouthWidthRatio,
    mouthApertureHeight,
    cornerElevation,
    browSeparation,
    browElevationAvg,
    eyeApertureAvg,
    sneakinessScore,
    symmetryScore,
  };

  const isSmiling =
    effectiveSmileScore >= 40 ||
    bsSmileMax >= 0.35 ||
    cornerElevation > 0.012;

  // ---------------------------------------------------------------------------
  // A. NON-SMILE EXPRESSIONS FIRST (Angry, Fear, Cry, Curious)
  // ---------------------------------------------------------------------------
  if (!isSmiling) {
    // 1. ANGRY (ദേഷ്യം): Furrowed brows pulled down
    if (
      (hasBlendshapes && bsBrowDownMax >= 0.32 && bsSmileMax < 0.25) ||
      (!hasBlendshapes && browSeparation < 0.225 && browElevationAvg < 0.105)
    ) {
      return {
        expression: 'angry',
        smileType: 'none',
        smileTypeMl: 'ദേഷ്യം',
        smileTypeDescription: 'പുരികം ചുളിച്ചുള്ള ദേഷ്യം',
        videoUrl: EXPRESSION_METADATA.angry.url,
        confidence: 0.95,
        metrics,
      };
    }

    // 2. FEAR / SHOCK (പേടി / ഞെട്ടൽ): Wide open eyes, gasping mouth
    if (
      (hasBlendshapes && (bsEyeWideMax >= 0.32 || (bsJawOpen >= 0.40 && bsSmileMax < 0.25))) ||
      (!hasBlendshapes &&
        ((eyeApertureAvg > 0.115 && browElevationAvg > 0.14) ||
          (mouthApertureHeight > 0.075 && eyeApertureAvg > 0.095)))
    ) {
      return {
        expression: 'fear',
        smileType: 'none',
        smileTypeMl: 'ഞെട്ടൽ / പേടി',
        smileTypeDescription: 'കണ്ണ് മിഴിച്ചുള്ള പേടി',
        videoUrl: EXPRESSION_METADATA.fear.url,
        confidence: 0.93,
        metrics,
      };
    }

    // 3. CRY / SAD (സങ്കടം / കരച്ചിൽ): Downturned corners, raised inner brows
    if (
      (hasBlendshapes && (bsMouthFrownMax >= 0.25 || (bsBrowInnerUp >= 0.30 && bsSmileMax < 0.2))) ||
      (!hasBlendshapes && cornerElevation < -0.016 && mouthApertureHeight < 0.055)
    ) {
      return {
        expression: 'cry',
        smileType: 'none',
        smileTypeMl: 'സങ്കടം / കരച്ചിൽ',
        smileTypeDescription: 'വായ് കോട്ടിയുള്ള സങ്കടം',
        videoUrl: EXPRESSION_METADATA.cry.url,
        confidence: 0.91,
        metrics,
      };
    }

    // 4. CURIOUS (സംശയം / കൗതുകം): One eyebrow raised
    if (
      (hasBlendshapes && (bsBrowOuterUpAsym >= 0.22 || bsBrowOuterUpMax >= 0.35) && bsSmileMax < 0.3) ||
      (!hasBlendshapes && browAsymmetry > 0.038 && eyeApertureAvg > 0.065)
    ) {
      return {
        expression: 'curious',
        smileType: 'none',
        smileTypeMl: 'സംശയം / കൗതുകം',
        smileTypeDescription: 'ഒരു പുരികം ഉയർത്തിയുള്ള നോട്ടം',
        videoUrl: getRandomExpressionVideo('curious'),
        confidence: 0.89,
        metrics,
      };
    }

    return defaultResult;
  }

  // ---------------------------------------------------------------------------
  // B. ACCURATE SMILE TYPE CLASSIFICATION
  // ---------------------------------------------------------------------------

  // 1. കള്ളച്ചിരി (Sneaky Asymmetrical Smirk / Suspicious)
  // One side of mouth lifted higher, tight/closed lips, mischievous expression
  if (
    (hasBlendshapes && bsSmileAsym >= 0.18 && bsSmileMax >= 0.32 && teethCount <= 6) ||
    (!hasBlendshapes && mouthAsymmetry > 0.016 && (leftCornerLift > 0.015 || rightCornerLift > 0.015) && teethCount <= 6)
  ) {
    return {
      expression: 'suspicious',
      smileType: 'kallachiri',
      smileTypeMl: SMILE_TYPE_INFO.kallachiri.labelMl,
      smileTypeDescription: SMILE_TYPE_INFO.kallachiri.descriptionMl,
      videoUrl: getRandomExpressionVideo('suspicious'),
      confidence: 0.96,
      metrics,
    };
  }

  // 2. പല്ലിളിച്ചുള്ള ചിരി (Tooth Exhibition / Dental Display)
  // When teeth enamel is clearly bare outside
  if (teethCount >= 14) {
    return {
      expression: 'laughing',
      smileType: 'pallilichathu',
      smileTypeMl: SMILE_TYPE_INFO.pallilichathu.labelMl,
      smileTypeDescription: SMILE_TYPE_INFO.pallilichathu.descriptionMl,
      videoUrl: getRandomExpressionVideo('laughing'),
      confidence: 0.98,
      metrics,
    };
  }

  // 3. പൊട്ടിച്ചിരി (Burst of Laughter / Open Jaw Laugh)
  // Wide open jaw, high smile intensity, laughing mouth
  if (
    (hasBlendshapes && bsSmileMax >= 0.55 && (bsJawOpen >= 0.20 || teethCount >= 8 || bsSmileAvg >= 0.65)) ||
    (!hasBlendshapes && ((mouthApertureHeight > 0.055 && mouthWidthRatio > 0.54) || teethCount >= 8 || effectiveSmileScore >= 72))
  ) {
    return {
      expression: 'laughing',
      smileType: 'pottichiri',
      smileTypeMl: SMILE_TYPE_INFO.pottichiri.labelMl,
      smileTypeDescription: SMILE_TYPE_INFO.pottichiri.descriptionMl,
      videoUrl: getRandomExpressionVideo('laughing'),
      confidence: 0.97,
      metrics,
    };
  }

  // 4. ചമ്മിയ ഇളി (Awkward / Nervous Ili)
  // Stretched mouth horizontally without high upward corner lift
  if (
    (hasBlendshapes && bsMouthStretchMax >= 0.28 && bsSmileAvg < 0.45) ||
    (!hasBlendshapes && mouthWidthRatio > 0.51 && cornerElevation < 0.018 && mouthApertureHeight < 0.035)
  ) {
    return {
      expression: 'expression',
      smileType: 'ili',
      smileTypeMl: SMILE_TYPE_INFO.ili.labelMl,
      smileTypeDescription: SMILE_TYPE_INFO.ili.descriptionMl,
      videoUrl: getRandomExpressionVideo('expression'),
      confidence: 0.90,
      metrics,
    };
  }

  // 5. സാധാരണ ചിരി / മന്ദഹാസം (Gentle Polite Smile)
  // Balanced, pleasant symmetric smile
  return {
    expression: 'smile',
    smileType: 'mandahasam',
    smileTypeMl: SMILE_TYPE_INFO.mandahasam.labelMl,
    smileTypeDescription: SMILE_TYPE_INFO.mandahasam.descriptionMl,
    videoUrl: getRandomExpressionVideo('smile'),
    confidence: 0.94,
    metrics,
  };
}
