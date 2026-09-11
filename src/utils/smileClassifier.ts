import { DETECTION_CONFIG, SmileIntensity } from '@/config/detectionConfig';

/**
 * Classify numeric smile score into intensity category.
 */
export function classifySmileIntensity(score: number): SmileIntensity {
  const { thresholds } = DETECTION_CONFIG;
  if (score >= thresholds.EXTREME_MIN) {
    return 'extreme';
  }
  if (score >= thresholds.MEDIUM_MIN) {
    return 'medium';
  }
  if (score >= thresholds.MILD_MIN) {
    return 'mild';
  }
  return 'none';
}

/**
 * Get simple brutalist smile label based on score and intensity.
 * Section 13:
 * - Not smiling: "NO SMILE"
 * - Small smile: "SMALL SMILE"
 * - Medium smile: "OKAY... SMILING"
 * - Extreme smile: "WHY SO HAPPY?"
 */
export function getSmileStateLabel(intensity: SmileIntensity, isSmiling: boolean): string {
  if (!isSmiling || intensity === 'none') {
    return 'NO SMILE';
  }
  switch (intensity) {
    case 'extreme':
      return 'WHY SO HAPPY?';
    case 'medium':
      return 'OKAY... SMILING';
    case 'mild':
      return 'SMALL SMILE';
    default:
      return 'NO SMILE';
  }
}

/**
 * Generate a clean brutalist text progress bar (e.g. ████████░░).
 */
export function formatBrutalistProgressBar(score: number, totalBlocks: number = 10): string {
  const clamped = Math.min(Math.max(score, 0), 100);
  const filledBlocks = Math.round((clamped / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
}
