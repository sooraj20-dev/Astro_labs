import { DETECTION_CONFIG } from '@/config/detectionConfig';

export interface NormalizedLandmark {
  x: number;
  y: number;
  z?: number;
}

export interface TeethCountResult {
  teethCount: number;         // 0 to 32
  teethAperture: number;      // raw normalized height
  teethVerdictMl: string;     // Comical Malayalam verdict
  teethVerdictEn: string;     // English translation
  dentalCategory: 'STEALTH' | 'BUNNY' | 'EXHIBITION' | 'FULL_32' | 'SUPERHUMAN';
}

export interface SmileScoreResult {
  rawScore: number;
  normalizedWidth: number;
  cornerElevation: number;
  interOcularDistance: number;
  mouthHeight: number;
  teeth: TeethCountResult;
}

/**
 * Euclidean distance between two 2D points.
 */
export function calculate2DDistance(
  p1: NormalizedLandmark,
  p2: NormalizedLandmark
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Clamp a number between min and max bounds.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate visible teeth count and humorous Malayalam dental verdict
 * using MediaPipe inner-lip aperture normalized by inter-ocular distance.
 */
export function calculateVisibleTeeth(
  landmarks: NormalizedLandmark[],
  interOcularDist: number
): TeethCountResult {
  const upperInnerIdx = DETECTION_CONFIG.landmarks.upperLipInner || 13;
  const lowerInnerIdx = DETECTION_CONFIG.landmarks.lowerLipInner || 14;

  if (
    !landmarks ||
    landmarks.length <= Math.max(upperInnerIdx, lowerInnerIdx) ||
    interOcularDist < 0.01
  ) {
    return {
      teethCount: 0,
      teethAperture: 0,
      teethVerdictMl: 'പല്ല് ഒളിച്ചു വെച്ചിരിക്കുന്നു!',
      teethVerdictEn: 'Zero teeth visible (stealth grin)',
      dentalCategory: 'STEALTH',
    };
  }

  const upperInner = landmarks[upperInnerIdx];
  const lowerInner = landmarks[lowerInnerIdx];

  // Aperture height (vertical gap between inner lip borders)
  const aperture = Math.abs(lowerInner.y - upperInner.y) / interOcularDist;

  // 1. Closed lips / stealth grin (< 0.016)
  if (aperture < 0.016) {
    return {
      teethCount: 0,
      teethAperture: aperture,
      teethVerdictMl: 'പല്ല് കാണിക്കാതെയുള്ള കള്ളച്ചിരി!',
      teethVerdictEn: '0 Teeth (Sneaky closed-lip smirk)',
      dentalCategory: 'STEALTH',
    };
  }

  // 2. Bunny front teeth peeking (0.016 to 0.035)
  if (aperture < 0.035) {
    const count = Math.min(8, Math.max(2, Math.round(2 + ((aperture - 0.016) / 0.019) * 6)));
    return {
      teethCount: count,
      teethAperture: aperture,
      teethVerdictMl: 'മുയൽ പല്ല് രണ്ടും കാട്ടി തുടങ്ങിയല്ലോ!',
      teethVerdictEn: `${count} Teeth (Bunny teeth spotted)`,
      dentalCategory: 'BUNNY',
    };
  }

  // 3. Medium teeth smile (0.035 to 0.075)
  if (aperture < 0.075) {
    const count = Math.min(22, Math.max(10, Math.round(10 + ((aperture - 0.035) / 0.04) * 12)));
    return {
      teethCount: count,
      teethAperture: aperture,
      teethVerdictMl: 'പല്ലിന്റെ പ്രദർശനം തുടങ്ങി! ടിക്കറ്റ് എവിടെ?',
      teethVerdictEn: `${count} Teeth (Dental exhibition underway)`,
      dentalCategory: 'EXHIBITION',
    };
  }

  // 4. Full 32 teeth smile (0.075 to 0.12)
  if (aperture < 0.12) {
    const count = Math.min(32, Math.max(24, Math.round(24 + ((aperture - 0.075) / 0.045) * 8)));
    return {
      teethCount: count,
      teethAperture: aperture,
      teethVerdictMl: '32 പല്ലും വെളിയിൽ! ഡെന്റൽ ചെക്കപ്പ് ഫ്രീ!',
      teethVerdictEn: `${count} Teeth (All 32 teeth on display!)`,
      dentalCategory: 'FULL_32',
    };
  }

  // 5. Extreme wide open mouth (> 0.12)
  return {
    teethCount: 32,
    teethAperture: aperture,
    teethVerdictMl: '32-ൽ കൂടുതൽ പല്ല് ഉണ്ടോ ഇതിൽ?!',
    teethVerdictEn: '32+ Teeth (Maximum jaw opening!)',
    dentalCategory: 'SUPERHUMAN',
  };
}

/**
 * Calculate real normalized smile score from MediaPipe Face Landmarks.
 */
export function calculateSmileScore(
  landmarks: NormalizedLandmark[]
): SmileScoreResult {
  const {
    leftMouthCorner: lmcIdx,
    rightMouthCorner: rmcIdx,
    upperLipTop: ultIdx,
    lowerLipBottom: llbIdx,
    leftEyeOuter: leoIdx,
    rightEyeOuter: reoIdx,
  } = DETECTION_CONFIG.landmarks;

  const defaultTeeth: TeethCountResult = {
    teethCount: 0,
    teethAperture: 0,
    teethVerdictMl: 'പല്ല് ഒളിച്ചു വെച്ചിരിക്കുന്നു!',
    teethVerdictEn: 'Zero teeth visible',
    dentalCategory: 'STEALTH',
  };

  // Validate indices exist
  if (
    !landmarks ||
    landmarks.length <= Math.max(lmcIdx, rmcIdx, ultIdx, llbIdx, leoIdx, reoIdx)
  ) {
    return {
      rawScore: 0,
      normalizedWidth: 0,
      cornerElevation: 0,
      interOcularDistance: 0,
      mouthHeight: 0,
      teeth: defaultTeeth,
    };
  }

  const leftCorner = landmarks[lmcIdx];
  const rightCorner = landmarks[rmcIdx];
  const upperLip = landmarks[ultIdx];
  const lowerLip = landmarks[llbIdx];
  const leftEye = landmarks[leoIdx];
  const rightEye = landmarks[reoIdx];

  // 1. Stable face scale: outer eye distance
  const eyeDist = calculate2DDistance(leftEye, rightEye);
  if (eyeDist < 0.01) {
    return {
      rawScore: 0,
      normalizedWidth: 0,
      cornerElevation: 0,
      interOcularDistance: 0,
      mouthHeight: 0,
      teeth: defaultTeeth,
    };
  }

  // 2. Normalized Mouth Width
  const rawMouthWidth = calculate2DDistance(leftCorner, rightCorner);
  const widthRatio = rawMouthWidth / eyeDist;

  // 3. Mouth Corner Elevation relative to lip center
  const lipCenterY = (upperLip.y + lowerLip.y) / 2;
  const cornersAvgY = (leftCorner.y + rightCorner.y) / 2;
  const cornerElevation = (lipCenterY - cornersAvgY) / eyeDist;

  // 4. Inner Mouth Opening
  const mouthHeight = Math.abs(lowerLip.y - upperLip.y) / eyeDist;

  // 5. Calculate visible teeth & comedic verdict
  const teeth = calculateVisibleTeeth(landmarks, eyeDist);

  // 6. Smooth continuous normalized scoring:
  const widthFactor = clamp((widthRatio - 0.42) / 0.20, 0, 1);
  const liftFactor = clamp((cornerElevation - (-0.01)) / 0.055, 0, 1);
  const openBonus = widthFactor > 0.35 ? clamp((mouthHeight - 0.04) / 0.15, 0, 0.15) : 0;

  const composite = clamp(widthFactor * 0.52 + liftFactor * 0.43 + openBonus * 0.05, 0, 1);
  const rawScore = Math.round(composite * 1000) / 10;

  return {
    rawScore,
    normalizedWidth: widthRatio,
    cornerElevation,
    interOcularDistance: eyeDist,
    mouthHeight,
    teeth,
  };
}

/**
 * Apply Exponential Moving Average (EMA) smoothing to avoid frame jitter.
 */
export function smoothSmileScore(
  currentScore: number,
  previousSmoothed: number,
  alpha: number = DETECTION_CONFIG.smoothingAlpha
): number {
  if (previousSmoothed === 0) return currentScore;
  const smoothed = alpha * currentScore + (1 - alpha) * previousSmoothed;
  return Math.round(smoothed * 10) / 10;
}
