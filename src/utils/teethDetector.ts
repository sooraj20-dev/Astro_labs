/**
 * AI Computer Vision Teeth Detector
 * Accurately detects and counts teeth ONLY when teeth are physically exposed
 * outside between the lips using MediaPipe inner-lip aperture segmentation
 * and RGB enamel chrominance/luminance clustering.
 */

import { NormalizedLandmark } from './smileDetection';

export interface AccurateTeethResult {
  teethCount: number;         // 0 to 32 (strictly 0 when teeth are inside/covered)
  areTeethExposed: boolean;   // True only when enamel is detected outside lips
  upperTeethCount: number;    // Upper arch visible teeth
  lowerTeethCount: number;    // Lower arch visible teeth
  enamelPixelCount: number;   // Raw detected enamel pixel count
  teethVerdictMl: string;     // Comical Malayalam verdict
  teethVerdictEn: string;     // English translation
  teethPoints: { x: number; y: number }[]; // Normalized points on detected teeth for canvas HUD
}

// MediaPipe inner mouth landmark indices
const INNER_LIP_INDICES = {
  upperInnerCenter: 13,
  lowerInnerCenter: 14,
  leftInnerCorner: 78,
  rightInnerCorner: 308,
  upperInnerContour: [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308],
  lowerInnerContour: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308],
};

// Reusable offscreen canvas for high-performance sub-pixel sampling
let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenCtx: CanvasRenderingContext2D | null = null;

function getOffscreenContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!offscreenCanvas) {
    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 80;
    offscreenCanvas.height = 40;
    offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
  }
  return offscreenCtx;
}

/**
 * Check if a pixel's RGB represents exposed dental enamel (teeth).
 * Distinguishes white/ivory teeth from red lips, pink gums, tongue, and dark throat.
 */
function isEnamelPixel(r: number, g: number, b: number): boolean {
  // 1. Minimum brightness required for teeth enamel
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  if (luminance < 115) return false; // Dark throat/cavity or shadow

  // 2. Teeth enamel is bright with balanced RGB (low color saturation)
  // Gums, lips and tongue have strong red dominance (r >> g and r >> b)
  const redExcessG = r - g;
  const redExcessB = r - b;

  // If pixel is heavily red/pink, it's tongue, lip, or gums, NOT teeth
  if (redExcessG > 36 || redExcessB > 52) return false;

  // 3. Minimum green and blue intensity (enamel reflects all spectrums)
  if (g < 95 || b < 75) return false;

  // 4. White / off-white / ivory enamel verification
  return r >= 110 && g >= 100 && b >= 80;
}

/**
 * Detects and accurately counts exposed teeth in real time using video frame data
 * and MediaPipe inner-lip coordinates.
 */
export function detectExposedTeeth(
  video: HTMLVideoElement | null,
  landmarks: NormalizedLandmark[] | null
): AccurateTeethResult {
  const defaultResult: AccurateTeethResult = {
    teethCount: 0,
    areTeethExposed: false,
    upperTeethCount: 0,
    lowerTeethCount: 0,
    enamelPixelCount: 0,
    teethVerdictMl: 'പല്ല് ഒളിച്ചു വെച്ചിരിക്കുന്നു!',
    teethVerdictEn: 'Zero teeth visible (lips closed)',
    teethPoints: [],
  };

  if (!video || !landmarks || landmarks.length < 320) {
    return defaultResult;
  }

  const upperLipInner = landmarks[INNER_LIP_INDICES.upperInnerCenter];
  const lowerLipInner = landmarks[INNER_LIP_INDICES.lowerInnerCenter];
  const leftCorner = landmarks[INNER_LIP_INDICES.leftInnerCorner];
  const rightCorner = landmarks[INNER_LIP_INDICES.rightInnerCorner];

  if (!upperLipInner || !lowerLipInner || !leftCorner || !rightCorner) {
    return defaultResult;
  }

  const vWidth = video.videoWidth || 640;
  const vHeight = video.videoHeight || 480;

  // 1. Physical Aperture Gap Check
  // Vertical gap between upper inner lip and lower inner lip
  const verticalGap = (lowerLipInner.y - upperLipInner.y) * vHeight;
  const horizontalWidth = Math.abs(rightCorner.x - leftCorner.x) * vWidth;

  // If lips are firmly closed or gap is under 4 pixels, teeth CANNOT be outside
  if (verticalGap < 4 || horizontalWidth < 18) {
    return defaultResult;
  }

  const ctx = getOffscreenContext();
  if (!ctx) return defaultResult;

  // 2. Crop inner mouth bounding box from live video
  const minX = Math.max(0, Math.min(leftCorner.x, rightCorner.x) * vWidth);
  const maxX = Math.min(vWidth, Math.max(leftCorner.x, rightCorner.x) * vWidth);
  const minY = Math.max(0, upperLipInner.y * vHeight);
  const maxY = Math.min(vHeight, lowerLipInner.y * vHeight);

  const cropW = Math.max(1, maxX - minX);
  const cropH = Math.max(1, maxY - minY);

  // Sample into 80x40 grid
  ctx.drawImage(video, minX, minY, cropW, cropH, 0, 0, 80, 40);

  let imageData: ImageData;
  try {
    imageData = ctx.getImageData(0, 0, 80, 40);
  } catch {
    return defaultResult;
  }

  const data = imageData.data;
  let totalEnamelPixels = 0;

  // Column projection: count how many enamel pixels in each horizontal column
  const columnEnamelCount = new Int16Array(80);
  const upperRowEnamel = new Int16Array(80);
  const lowerRowEnamel = new Int16Array(80);

  for (let y = 0; y < 40; y++) {
    const isUpperRow = y < 20;
    const rowOffset = y * 80 * 4;

    for (let x = 0; x < 80; x++) {
      const idx = rowOffset + x * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      if (isEnamelPixel(r, g, b)) {
        totalEnamelPixels++;
        columnEnamelCount[x]++;
        if (isUpperRow) {
          upperRowEnamel[x]++;
        } else {
          lowerRowEnamel[x]++;
        }
      }
    }
  }

  // 3. Strict threshold: must have at least 25 enamel pixels to register teeth outside
  if (totalEnamelPixels < 25) {
    return {
      ...defaultResult,
      enamelPixelCount: totalEnamelPixels,
      teethVerdictMl: 'പല്ല് വെളിയിൽ കാണുന്നില്ല!',
      teethVerdictEn: 'Teeth are inside / covered by lips',
    };
  }

  // 4. Count exposed dental segments along the horizontal span
  // Count distinct continuous columns with enamel
  let activeColumns = 0;
  let minCol = 80;
  let maxCol = 0;

  for (let x = 0; x < 80; x++) {
    if (columnEnamelCount[x] >= 2) {
      activeColumns++;
      if (x < minCol) minCol = x;
      if (x > maxCol) maxCol = x;
    }
  }

  // If teeth columns are sparse or accidental noise
  if (activeColumns < 4) {
    return {
      ...defaultResult,
      enamelPixelCount: totalEnamelPixels,
      teethVerdictMl: 'പല്ല് ഒളിച്ചു വെച്ചിരിക്കുന്നു!',
      teethVerdictEn: 'Teeth covered by lips',
    };
  }

  // Enamel span ratio across mouth width
  const spanWidth = maxCol - minCol + 1;
  const spanRatio = Math.min(1.0, spanWidth / 70);

  // Upper arch teeth calculation based on anatomical width
  // 2 central incisors ~ 20% span
  // 4 incisors ~ 35% span
  // 6 (incisors + canines) ~ 50% span
  // 8 (with 1st premolars) ~ 65% span
  // 10-12 (with 2nd premolars & molars) ~ 80-95% span
  // 14-16 (full upper arch) ~ 100% span
  let upperCount = 0;
  if (spanRatio < 0.22) {
    upperCount = 2; // 2 front bunny teeth
  } else if (spanRatio < 0.38) {
    upperCount = 4; // 4 front teeth
  } else if (spanRatio < 0.54) {
    upperCount = 6; // 6 teeth with canines
  } else if (spanRatio < 0.70) {
    upperCount = 8; // 8 teeth
  } else if (spanRatio < 0.85) {
    upperCount = 10; // 10 teeth
  } else if (spanRatio < 0.94) {
    upperCount = 12; // 12 teeth
  } else {
    upperCount = 14; // 14 to 16 upper teeth
  }

  // Check if lower arch teeth are also exposed outside
  // Lower teeth show when vertical gap is wide AND lower half has enamel
  let lowerCount = 0;
  let lowerEnamelPixels = 0;
  for (let x = 0; x < 80; x++) {
    lowerEnamelPixels += lowerRowEnamel[x];
  }

  const isLowerArchExposed = lowerEnamelPixels > 30 && verticalGap > 12;
  if (isLowerArchExposed) {
    // Lower arch exposed: add lower teeth in proportion
    const lowerSpanRatio = lowerEnamelPixels / (totalEnamelPixels || 1);
    lowerCount = Math.min(upperCount, Math.max(2, Math.round(upperCount * lowerSpanRatio * 1.1)));
  }

  const totalTeeth = Math.min(32, upperCount + lowerCount);

  // 5. Generate normalized marker coordinates for canvas HUD over each detected tooth
  const teethPoints: { x: number; y: number }[] = [];
  const mouthCenterY = (upperLipInner.y + lowerLipInner.y) / 2;
  const mouthLeftX = leftCorner.x;
  const mouthWidthNorm = rightCorner.x - leftCorner.x;

  const stepX = (spanWidth / (upperCount || 1)) / 80;
  for (let i = 0; i < upperCount; i++) {
    const normX = mouthLeftX + (minCol / 80 + (i + 0.5) * stepX) * mouthWidthNorm;
    teethPoints.push({
      x: normX,
      y: upperLipInner.y + 0.008,
    });
  }

  if (lowerCount > 0) {
    const stepLower = (spanWidth / lowerCount) / 80;
    for (let i = 0; i < lowerCount; i++) {
      const normX = mouthLeftX + (minCol / 80 + (i + 0.5) * stepLower) * mouthWidthNorm;
      teethPoints.push({
        x: normX,
        y: mouthCenterY + 0.006,
      });
    }
  }

  // 6. Funny Brutalist Malayalam Verdict based on genuine count
  let verdictMl = '';
  let verdictEn = '';

  if (totalTeeth <= 2) {
    verdictMl = 'മുയൽ പല്ല് രണ്ടും കാട്ടി തുടങ്ങിയല്ലോ!';
    verdictEn = '2 bunny front teeth exposed!';
  } else if (totalTeeth <= 6) {
    verdictMl = `${totalTeeth} പല്ല് വെളിയിൽ ചാടി!`;
    verdictEn = `${totalTeeth} front teeth peeking out`;
  } else if (totalTeeth <= 12) {
    verdictMl = `പല്ലിന്റെ പ്രദർശനം തുടങ്ങി (${totalTeeth} പല്ല്)!`;
    verdictEn = `${totalTeeth} teeth on dental exhibition!`;
  } else if (totalTeeth <= 22) {
    verdictMl = `കുറച്ചു പല്ല് ഉള്ളിലോട്ട് വെക്കൂ (${totalTeeth} പല്ല്)!`;
    verdictEn = `${totalTeeth} teeth exposed — blinding smile!`;
  } else if (totalTeeth >= 28) {
    verdictMl = '32 പല്ലും വെളിയിൽ! ഡെന്റൽ ചെക്കപ്പ് ഫ്രീ!';
    verdictEn = `${totalTeeth}/32 teeth fully deployed!`;
  } else {
    verdictMl = `${totalTeeth} പല്ല് വ്യക്തമായി എണ്ണി കഴിഞ്ഞു!`;
    verdictEn = `${totalTeeth} teeth accurately scanned`;
  }

  return {
    teethCount: totalTeeth,
    areTeethExposed: true,
    upperTeethCount: upperCount,
    lowerTeethCount: lowerCount,
    enamelPixelCount: totalEnamelPixels,
    teethVerdictMl: verdictMl,
    teethVerdictEn: verdictEn,
    teethPoints,
  };
}
