/**
 * CHIRI POLICE - Detection & System Configuration
 * All numeric thresholds and timings centralized here to avoid magic numbers.
 */

export interface SmileThresholds {
  NOT_SMILING_MAX: number;   // 0 - 39: Not smiling (neutral face strictly stays here)
  MILD_MIN: number;          // 40 - 59: Mild / Small smile
  MILD_MAX: number;
  MEDIUM_MIN: number;        // 60 - 79: Medium smile
  MEDIUM_MAX: number;
  EXTREME_MIN: number;       // 80 - 100: Extreme / Outrageous smile
  EXTREME_MAX: number;
}

export type SmileIntensity = 'none' | 'mild' | 'medium' | 'extreme';

export interface DetectionConfig {
  thresholds: SmileThresholds;
  /**
   * Exponential Moving Average (EMA) smoothing factor alpha [0.0 - 1.0].
   */
  smoothingAlpha: number;
  /**
   * Minimum trigger threshold for registering a smile event.
   * Set to 55 to prevent neutral resting faces from triggering.
   */
  triggerThreshold: number;
  /**
   * Reset threshold: user must drop below this smile score before
   * the system re-arms for the next incident.
   */
  resetThreshold: number;
  /**
   * Cooldown duration in milliseconds after a mock is triggered.
   */
  cooldownMs: number;
  /**
   * Maximum duration a mock display stays visible before auto-dismissing
   * if the video file is missing or onended doesn't fire.
   */
  mockDisplayDurationMs: number;
  /**
   * Model file locations
   */
  modelPath: string;
  cdnModelPath: string;
  wasmPath: string;
  cdnWasmPath: string;
  /**
   * Video element dimensions for processing
   */
  videoWidth: number;
  videoHeight: number;
  /**
   * MediaPipe Face Landmark key indices
   */
  landmarks: {
    leftMouthCorner: number;   // 61
    rightMouthCorner: number;  // 291
    upperLipTop: number;       // 0 (outer philtrum top)
    upperLipInner: number;     // 13
    lowerLipInner: number;     // 14
    lowerLipBottom: number;    // 17 (outer chin bottom)
    noseTip: number;           // 1
    chin: number;              // 152
    leftEyeOuter: number;      // 33
    rightEyeOuter: number;     // 263
    leftCheek: number;         // 205
    rightCheek: number;        // 425
  };
}

export const DETECTION_CONFIG: DetectionConfig = {
  thresholds: {
    NOT_SMILING_MAX: 39,
    MILD_MIN: 40,
    MILD_MAX: 59,
    MEDIUM_MIN: 60,
    MEDIUM_MAX: 79,
    EXTREME_MIN: 80,
    EXTREME_MAX: 100,
  },
  smoothingAlpha: 0.25,
  triggerThreshold: 45,       // Transitions from < 45 to >= 45 trigger smile event
  resetThreshold: 30,         // Must fall back to <= 30 to re-arm
  cooldownMs: 4000,           // 4.0 seconds cooldown window
  mockDisplayDurationMs: 4500,// 4.5 seconds auto-dismiss for mock view
  modelPath: '/models/face_landmarker.task',
  cdnModelPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
  wasmPath: '/wasm',
  cdnWasmPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
  videoWidth: 640,
  videoHeight: 480,
  landmarks: {
    leftMouthCorner: 61,
    rightMouthCorner: 291,
    upperLipTop: 0,
    upperLipInner: 13,
    lowerLipInner: 14,
    lowerLipBottom: 17,
    noseTip: 1,
    chin: 152,
    leftEyeOuter: 33,
    rightEyeOuter: 263,
    leftCheek: 205,
    rightCheek: 425,
  },
};
