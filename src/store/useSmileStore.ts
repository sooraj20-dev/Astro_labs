import { create } from 'zustand';
import { MockVideo } from '@/data/mockVideos';
import { MockLine } from '@/data/mockLines';
import { SmileIntensity } from '@/config/detectionConfig';
import {
  FacialExpression,
  SmileType,
  getRandomExpressionMock,
  getRandomExpressionVideo,
} from '@/utils/expressionDetector';
import { smileSmile } from '@/data/videoAssets';

export type DetectionState =
  | 'IDLE'
  | 'SEARCHING'
  | 'SERIOUS'
  | 'SMILING'
  | 'COOLDOWN'
  | 'WAITING_RESET';

export type MockStage = 'idle' | 'text_mock' | 'video_dialogue';

export interface SmileState {
  // Camera & Device State
  cameraEnabled: boolean;
  cameraLoading: boolean;
  cameraError: string | null;
  cameraPermissionDenied: boolean;

  // MediaPipe Model State
  modelLoading: boolean;
  modelReady: boolean;
  modelError: string | null;

  // Real-time Detection State
  faceDetected: boolean;
  multipleFacesDetected: boolean;
  faceCount: number;
  rawSmileScore: number;
  smileScore: number;
  isSmiling: boolean;
  smileIntensity: SmileIntensity;
  peakSmileScore: number;
  detectionState: DetectionState;

  // Real-time Teeth Count State
  teethCount: number;
  teethVerdictMl: string;
  teethVerdictEn: string;

  // Specific Smile Type & Forensic Metrics
  smileType: SmileType;
  smileTypeMl: string;
  sneakinessScore: number;
  symmetryScore: number;

  // Facial Expression & Overlay Video State
  currentExpression: FacialExpression;
  overlayVideoUrl: string | null;
  isOverlayVideoPlaying: boolean;
  overlayVideoMuted: boolean;

  // Mock Sequence Stages (Stage 1: Mock with text -> Stage 2: Play movie dialogue)
  mockStage: MockStage;
  mockText: string;

  // Serious Challenge Mode (Staring Contest)
  isChallengeActive: boolean;
  seriousTimeSeconds: number;
  bestStreakSeconds: number;

  // Fine Receipt Modal State
  fineReceiptOpen: boolean;

  // Landing & Briefing Screen State
  landingOpen: boolean;
  setLandingOpen: (open: boolean) => void;

  // Mock Trigger & Cooldown State
  cooldownActive: boolean;
  currentMockVideo: MockVideo | null;
  currentMockLine: MockLine | null;
  isPlayingMock: boolean;
  lastIncidentTime: string | null;
  smileCount: number;
  mockDeployedCount: number;

  // Settings & Debug
  voiceEnabled: boolean;
  debugMode: boolean;

  // Actions
  setCameraEnabled: (enabled: boolean) => void;
  setCameraLoading: (loading: boolean) => void;
  setCameraError: (error: string | null, permissionDenied?: boolean) => void;
  setModelStatus: (loading: boolean, ready: boolean, error?: string | null) => void;
  startMockSequence: (options: {
    expression: FacialExpression;
    mockText?: string;
    videoUrl?: string;
    delayMs?: number;
  }) => void;
  setOverlayVideo: (url: string | null, expression?: FacialExpression, immediate?: boolean) => void;
  toggleOverlayMuted: () => void;
  finishOverlayVideo: () => void;
  toggleFineReceipt: () => void;
  toggleChallengeMode: () => void;
  setChallengeSeconds: (sec: number) => void;
  recordSmileBusted: () => void;
  updateDetectionMetrics: (data: {
    faceDetected: boolean;
    multipleFacesDetected: boolean;
    faceCount: number;
    rawSmileScore: number;
    smileScore: number;
    isSmiling: boolean;
    smileIntensity: SmileIntensity;
    detectionState: DetectionState;
    teethCount?: number;
    teethVerdictMl?: string;
    teethVerdictEn?: string;
    smileType?: SmileType;
    smileTypeMl?: string;
    sneakinessScore?: number;
    symmetryScore?: number;
  }) => void;
  triggerMockEvent: (video: MockVideo, line: MockLine | null) => void;
  setCooldownActive: (active: boolean) => void;
  setDetectionState: (state: DetectionState) => void;
  finishMockPlayback: () => void;
  toggleVoice: () => void;
  toggleDebug: () => void;
  resetStats: () => void;
}

let pendingMockTimer: ReturnType<typeof setTimeout> | null = null;

export const useSmileStore = create<SmileState>((set, get) => ({
  // Camera Initial State
  cameraEnabled: false,
  cameraLoading: false,
  cameraError: null,
  cameraPermissionDenied: false,

  // Model Initial State
  modelLoading: true,
  modelReady: false,
  modelError: null,

  // Detection Initial State
  faceDetected: false,
  multipleFacesDetected: false,
  faceCount: 0,
  rawSmileScore: 0,
  smileScore: 0,
  isSmiling: false,
  smileIntensity: 'none',
  peakSmileScore: 0,
  detectionState: 'IDLE',

  // Teeth Count Initial State
  teethCount: 0,
  teethVerdictMl: 'പല്ല് ഒളിച്ചു വെച്ചിരിക്കുന്നു!',
  teethVerdictEn: 'Zero teeth on display',

  // Specific Smile Type & Forensic Metrics Initial State
  smileType: 'none',
  smileTypeMl: 'ചിരിയില്ല',
  sneakinessScore: 0,
  symmetryScore: 100,

  // Facial Expression & Overlay Video Initial State
  currentExpression: 'neutral',
  overlayVideoUrl: null,
  isOverlayVideoPlaying: false,
  overlayVideoMuted: false,

  // Mock Sequence Stages (Stage 1: Mock with text -> Stage 2: Play movie dialogue)
  mockStage: 'idle',
  mockText: '',

  // Serious Challenge Mode (Staring Contest)
  isChallengeActive: false,
  seriousTimeSeconds: 0,
  bestStreakSeconds: Number(typeof window !== 'undefined' ? localStorage.getItem('chiri_best_streak') || 0 : 0),

  // Fine Receipt Modal State
  fineReceiptOpen: false,

  // Landing & Briefing Screen Initial State
  landingOpen: true,

  // Mock & History
  cooldownActive: false,
  currentMockVideo: null,
  currentMockLine: null,
  isPlayingMock: false,
  lastIncidentTime: null,
  smileCount: 0,
  mockDeployedCount: 0,

  // Settings
  voiceEnabled: false,
  debugMode: false,

  // Actions
  toggleFineReceipt: () => set((state) => ({ fineReceiptOpen: !state.fineReceiptOpen })),
  setLandingOpen: (open: boolean) => set({ landingOpen: open }),

  toggleChallengeMode: () =>
    set((state) => ({
      isChallengeActive: !state.isChallengeActive,
      seriousTimeSeconds: 0,
    })),

  setChallengeSeconds: (sec: number) => set({ seriousTimeSeconds: sec }),

  recordSmileBusted: () => {
    const current = get().seriousTimeSeconds;
    const best = get().bestStreakSeconds;
    const newBest = Math.max(best, current);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('chiri_best_streak', String(newBest));
      }
    } catch {
      // Ignore
    }
    set({ bestStreakSeconds: newBest });
  },

  startMockSequence: ({
    expression,
    mockText,
    videoUrl,
    delayMs = 1800,
  }) => {
    if (pendingMockTimer) {
      clearTimeout(pendingMockTimer);
      pendingMockTimer = null;
    }

    const selectedText = mockText || getRandomExpressionMock(expression);
    const targetVideoUrl =
      videoUrl ||
      (expression !== 'neutral' ? getRandomExpressionVideo(expression) : smileSmile);

    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0];
    const isSmile = expression === 'smile' || expression === 'laughing';

    set((state) => ({
      mockStage: 'text_mock',
      mockText: selectedText,
      currentExpression: expression,
      overlayVideoUrl: null,
      isOverlayVideoPlaying: false,
      isPlayingMock: true,
      cooldownActive: true,
      detectionState: 'COOLDOWN',
      lastIncidentTime: timeString,
      mockDeployedCount: state.mockDeployedCount + 1,
      smileCount: isSmile ? state.smileCount + 1 : state.smileCount,
      currentMockLine: {
        id: `mock-${Date.now()}`,
        intensity: isSmile ? 'medium' : 'mild',
        malayalam: selectedText,
        transliteration: '',
        englishMeaning: '',
      },
    }));

    // Stage 1: Display text mock first. After delay, advance to Stage 2: Movie Dialogue Video!
    pendingMockTimer = setTimeout(() => {
      pendingMockTimer = null;
      if (targetVideoUrl) {
        set({
          mockStage: 'video_dialogue',
          overlayVideoUrl: targetVideoUrl,
          isOverlayVideoPlaying: true,
        });
      } else {
        set({
          mockStage: 'idle',
          isPlayingMock: false,
        });
      }
    }, delayMs);
  },

  setOverlayVideo: (url, expression = 'neutral', immediate = false) => {
    if (!url) {
      if (pendingMockTimer) {
        clearTimeout(pendingMockTimer);
        pendingMockTimer = null;
      }
      set({
        overlayVideoUrl: null,
        isOverlayVideoPlaying: false,
        mockStage: 'idle',
        isPlayingMock: false,
      });
      return;
    }
    if (immediate) {
      set({
        overlayVideoUrl: url,
        isOverlayVideoPlaying: true,
        currentExpression: expression,
        mockStage: 'video_dialogue',
      });
      return;
    }
    get().startMockSequence({ expression, videoUrl: url });
  },

  toggleOverlayMuted: () => {
    set((state) => ({ overlayVideoMuted: !state.overlayVideoMuted }));
  },

  finishOverlayVideo: () => {
    if (pendingMockTimer) {
      clearTimeout(pendingMockTimer);
      pendingMockTimer = null;
    }
    set({
      isOverlayVideoPlaying: false,
      overlayVideoUrl: null,
      mockStage: 'idle',
      isPlayingMock: false,
    });
  },

  setCameraEnabled: (enabled) => {
    set({
      cameraEnabled: enabled,
      detectionState: enabled ? 'SEARCHING' : 'IDLE',
      faceDetected: enabled ? get().faceDetected : false,
      isSmiling: enabled ? get().isSmiling : false,
      rawSmileScore: enabled ? get().rawSmileScore : 0,
      smileScore: enabled ? get().smileScore : 0,
    });
  },

  setCameraLoading: (loading) => set({ cameraLoading: loading }),

  setCameraError: (error, permissionDenied = false) => {
    set({
      cameraError: error,
      cameraPermissionDenied: permissionDenied,
      cameraLoading: false,
      cameraEnabled: false,
      detectionState: 'IDLE',
    });
  },

  setModelStatus: (loading, ready, error = null) => {
    set({
      modelLoading: loading,
      modelReady: ready,
      modelError: error,
    });
  },

  updateDetectionMetrics: ({
    faceDetected,
    multipleFacesDetected,
    faceCount,
    rawSmileScore,
    smileScore,
    isSmiling,
    smileIntensity,
    detectionState,
    teethCount,
    teethVerdictMl,
    teethVerdictEn,
    smileType,
    smileTypeMl,
    sneakinessScore,
    symmetryScore,
  }) => {
    const currentPeak = get().peakSmileScore;
    const newPeak = Math.max(currentPeak, Math.round(smileScore));

    set({
      faceDetected,
      multipleFacesDetected,
      faceCount,
      rawSmileScore,
      smileScore,
      isSmiling,
      smileIntensity,
      peakSmileScore: newPeak,
      detectionState,
      ...(teethCount !== undefined ? { teethCount } : {}),
      ...(teethVerdictMl !== undefined ? { teethVerdictMl } : {}),
      ...(teethVerdictEn !== undefined ? { teethVerdictEn } : {}),
      ...(smileType !== undefined ? { smileType } : {}),
      ...(smileTypeMl !== undefined ? { smileTypeMl } : {}),
      ...(sneakinessScore !== undefined ? { sneakinessScore } : {}),
      ...(symmetryScore !== undefined ? { symmetryScore } : {}),
    });
  },

  triggerMockEvent: (video, line) => {
    const currentExpr = get().currentExpression;
    const resolvedExpr = currentExpr !== 'neutral' ? currentExpr : 'smile';
    const videoUrl =
      video && video.src
        ? video.src
        : getRandomExpressionVideo(resolvedExpr);

    get().startMockSequence({
      expression: resolvedExpr,
      mockText: line ? line.malayalam : undefined,
      videoUrl,
    });
  },

  setCooldownActive: (active) => {
    set({ cooldownActive: active });
  },

  setDetectionState: (detectionState) => {
    set({ detectionState });
  },

  finishMockPlayback: () => {
    if (pendingMockTimer) {
      clearTimeout(pendingMockTimer);
      pendingMockTimer = null;
    }
    set({
      isPlayingMock: false,
      isOverlayVideoPlaying: false,
      overlayVideoUrl: null,
      mockStage: 'idle',
    });
  },

  toggleVoice: () => {
    set((state) => ({ voiceEnabled: !state.voiceEnabled }));
  },

  toggleDebug: () => {
    set((state) => ({ debugMode: !state.debugMode }));
  },

  resetStats: () => {
    if (pendingMockTimer) {
      clearTimeout(pendingMockTimer);
      pendingMockTimer = null;
    }
    set({
      smileCount: 0,
      mockDeployedCount: 0,
      peakSmileScore: 0,
      lastIncidentTime: null,
      currentMockVideo: null,
      currentMockLine: null,
      isPlayingMock: false,
      cooldownActive: false,
      mockStage: 'idle',
      mockText: '',
      overlayVideoUrl: null,
      isOverlayVideoPlaying: false,
      detectionState: get().cameraEnabled ? 'SEARCHING' : 'IDLE',
    });
  },
}));
