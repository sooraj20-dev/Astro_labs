import { create } from 'zustand';
import { MockVideo, selectRandomMockVideo } from '@/data/mockVideos';
import { MockLine } from '@/data/mockLines';
import { SmileIntensity } from '@/config/detectionConfig';
import {
  FacialExpression,
  SmileType,
  getRandomExpressionMock,
  getRandomExpressionVideo,
} from '@/utils/expressionDetector';
import { smileSmile } from '@/data/videoAssets';
import {
  JyothishamPrediction,
  generateFaceJyothisham,
  AstrologerId,
  getAstrologerById,
  getRandomSmileRoast,
} from '@/data/jyothishamData';
import { playAstrologerAudio, stopAstroIntroAudio } from '@/utils/astroAudio';

export type DetectionState =
  | 'IDLE'
  | 'SEARCHING'
  | 'SERIOUS'
  | 'SMILING'
  | 'COOLDOWN'
  | 'WAITING_RESET';

export type MockStage = 'idle' | 'text_mock' | 'video_dialogue';

export type AppPhase = 'LANDING' | 'WAITING_FACE' | 'SCANNING' | 'RESULT';

export type MockMode = 'ASTROLOGY' | 'MOVIE';

export interface SmileState {
  // Mode Selection: Astrology Mock vs Movie Mock
  mockMode: MockMode;
  setMockMode: (mode: MockMode) => void;

  // Selected Astrologer Character ('unni' | 'kumbidi' | 'yeshu')
  selectedAstrologerId: AstrologerId;
  isAstrologerSwitching: boolean;
  selectNextAstrologer: () => void;
  setSelectedAstrologerId: (id: AstrologerId, playAudio?: boolean) => void;

  // App Overall Experience Phase
  appPhase: AppPhase;
  scanProgress: number;
  scanMessage: string;
  currentJathakam: JyothishamPrediction | null;
  smileReactionToast: string | null;
  isShareCardOpen: boolean;

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
  setAppPhase: (phase: AppPhase) => void;
  startScanSequence: () => void;
  completeScan: () => void;
  resetForNewReading: () => void;
  triggerSmileReaction: (score: number) => void;
  clearSmileReactionToast: () => void;
  setShareCardOpen: (open: boolean) => void;

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
let scanIntervalTimer: ReturnType<typeof setInterval> | null = null;
let smileToastTimer: ReturnType<typeof setTimeout> | null = null;

let switchLoadingTimer: ReturnType<typeof setTimeout> | null = null;

export const useSmileStore = create<SmileState>((set, get) => ({
  // Mode Selection: Astrology Mock vs Movie Mock
  mockMode: 'ASTROLOGY',
  setMockMode: (mode) => {
    if (mode === 'ASTROLOGY') {
      get().finishMockPlayback();
      set({
        mockMode: mode,
        overlayVideoUrl: null,
        isOverlayVideoPlaying: false,
        mockStage: 'idle',
        isPlayingMock: false,
      });
    } else {
      stopAstroIntroAudio();
      set({ mockMode: mode });
    }
  },

  // Selected Astrologer Character
  selectedAstrologerId: 'unni',
  isAstrologerSwitching: false,
  selectNextAstrologer: () => {
    const currentId = get().selectedAstrologerId;
    const nextId: AstrologerId =
      currentId === 'unni' ? 'kumbidi' : currentId === 'kumbidi' ? 'yeshu' : 'unni';

    // Stop current audio if playing
    stopAstroIntroAudio();
    if (switchLoadingTimer) {
      clearTimeout(switchLoadingTimer);
      switchLoadingTimer = null;
    }

    const profile = getAstrologerById(nextId);

    // Play the audio for the new astrologer (intro, kumbidi, yeshu)
    playAstrologerAudio(profile.audioKey);

    // Enter switching loading screen
    set({
      selectedAstrologerId: nextId,
      isAstrologerSwitching: true,
      scanMessage: `${profile.name} എത്തുന്നു...`,
    });

    const loadingDuration = Math.round(profile.audioDurationSec * 1000);

    switchLoadingTimer = setTimeout(() => {
      const { currentJathakam, smileScore, symmetryScore } = get();
      if (currentJathakam) {
        const updatedPrediction = generateFaceJyothisham(smileScore, symmetryScore, nextId);
        set({
          isAstrologerSwitching: false,
          currentJathakam: updatedPrediction,
        });
      } else {
        set({
          isAstrologerSwitching: false,
          scanMessage: profile.waitingQuote,
        });
      }
      switchLoadingTimer = null;
    }, loadingDuration);
  },
  setSelectedAstrologerId: (id: AstrologerId, playAudio: boolean = false) => {
    stopAstroIntroAudio();
    if (switchLoadingTimer) {
      clearTimeout(switchLoadingTimer);
      switchLoadingTimer = null;
    }

    // If audio is not requested (e.g. background preview or silent update), only update the ID
    if (!playAudio) {
      set({ selectedAstrologerId: id });
      return;
    }

    const profile = getAstrologerById(id);
    playAstrologerAudio(profile.audioKey);

    set({
      selectedAstrologerId: id,
      isAstrologerSwitching: true,
      scanMessage: `${profile.name} എത്തുന്നു...`,
    });

    const loadingDuration = Math.round(profile.audioDurationSec * 1000);

    switchLoadingTimer = setTimeout(() => {
      const { currentJathakam, smileScore, symmetryScore } = get();
      if (currentJathakam) {
        const updatedPrediction = generateFaceJyothisham(smileScore, symmetryScore, id);
        set({ isAstrologerSwitching: false, currentJathakam: updatedPrediction });
      } else {
        set({ isAstrologerSwitching: false, scanMessage: profile.waitingQuote });
      }
      switchLoadingTimer = null;
    }, loadingDuration);
  },

  // App Overall Experience Phase
  appPhase: 'LANDING',
  scanProgress: 0,
  scanMessage: 'മുഖം തിരയുന്നു...',
  currentJathakam: null,
  smileReactionToast: null,
  isShareCardOpen: false,

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

  // Mock Sequence Stages
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

  // Phase & Jathakam Actions
  setAppPhase: (phase) => {
    set({ appPhase: phase, landingOpen: phase === 'LANDING' });
  },

  setShareCardOpen: (open) => {
    set({ isShareCardOpen: open });
  },

  startScanSequence: () => {
    if (scanIntervalTimer) clearInterval(scanIntervalTimer);

    const astrologer = getAstrologerById(get().selectedAstrologerId);
    const scanQuotes = astrologer.scanQuotes;

    set({
      appPhase: 'SCANNING',
      scanProgress: 5,
      scanMessage: scanQuotes[0] || 'മുഖം പരിശോധിക്കുന്നു...',
    });

    let currentStep = 0;
    const totalSteps = 10;
    // 300ms per step (3s total face analysis without audio)
    const intervalTime = 300;

    scanIntervalTimer = setInterval(() => {
      currentStep++;
      const progress = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      const msgIndex = Math.min(scanQuotes.length - 1, currentStep);

      set({
        scanProgress: progress,
        scanMessage: scanQuotes[msgIndex] || scanQuotes[scanQuotes.length - 1],
      });

      if (currentStep >= totalSteps) {
        if (scanIntervalTimer) {
          clearInterval(scanIntervalTimer);
          scanIntervalTimer = null;
        }
        get().completeScan();
      }
    }, intervalTime);
  },

  completeScan: () => {
    if (scanIntervalTimer) {
      clearInterval(scanIntervalTimer);
      scanIntervalTimer = null;
    }

    // Stop loading intro audio when mock is complete
    stopAstroIntroAudio();

    const { smileScore, symmetryScore, selectedAstrologerId } = get();
    const prediction = generateFaceJyothisham(smileScore, symmetryScore, selectedAstrologerId);

    set({
      appPhase: 'RESULT',
      currentJathakam: prediction,
      scanProgress: 100,
      scanMessage: 'ANALYSIS COMPLETE.',
    });
  },

  resetForNewReading: () => {
    if (scanIntervalTimer) {
      clearInterval(scanIntervalTimer);
      scanIntervalTimer = null;
    }
    if (smileToastTimer) {
      clearTimeout(smileToastTimer);
      smileToastTimer = null;
    }

    // Stop intro audio if still playing
    stopAstroIntroAudio();

    set({
      appPhase: 'WAITING_FACE',
      currentJathakam: null,
      scanProgress: 0,
      scanMessage: 'ക്യാമറയിലേക്ക് നോക്കൂ...',
      smileReactionToast: null,
      overlayVideoUrl: null,
      isOverlayVideoPlaying: false,
      mockStage: 'idle',
      isPlayingMock: false,
    });
  },

  triggerSmileReaction: (score: number) => {
    // In ASTROLOGY mode: Active astrologer character roasts the smile directly with speech/toast, NO movie videos!
    if (get().mockMode === 'ASTROLOGY') {
      const toastMsg = getRandomSmileRoast(get().selectedAstrologerId);
      if (smileToastTimer) clearTimeout(smileToastTimer);
      set({
        smileReactionToast: toastMsg,
      });
      smileToastTimer = setTimeout(() => {
        set({ smileReactionToast: null });
        smileToastTimer = null;
      }, 4000);
      return;
    }

    // In MOVIE mode: Once a reaction video plays, it MUST complete! Do not interrupt!
    if (get().isOverlayVideoPlaying) {
      return;
    }

    const rounded = Math.round(score);
    if (smileToastTimer) clearTimeout(smileToastTimer);

    const toastMsg = `SMILE DETECTED: ${rounded}% — ചിരി നിരോധിച്ചിരിക്കുന്നു!`;

    // Select matching reaction video
    const intensity = rounded >= 80 ? 'extreme' : rounded >= 50 ? 'medium' : 'mild';
    const randomVid = selectRandomMockVideo(intensity, null, rounded >= 75 ? 'wierd_laugh' : 'smile');

    set({
      smileReactionToast: toastMsg,
      overlayVideoUrl: randomVid.src,
      isOverlayVideoPlaying: true,
      currentExpression: rounded >= 80 ? 'laughing' : 'smile',
      mockStage: 'video_dialogue',
      isPlayingMock: true,
    });

    smileToastTimer = setTimeout(() => {
      set({ smileReactionToast: null });
      smileToastTimer = null;
    }, 4500);
  },

  clearSmileReactionToast: () => {
    if (smileToastTimer) {
      clearTimeout(smileToastTimer);
      smileToastTimer = null;
    }
    set({ smileReactionToast: null });
  },

  // Actions
  toggleFineReceipt: () => set((state) => ({ fineReceiptOpen: !state.fineReceiptOpen })),
  setLandingOpen: (open: boolean) => set({ landingOpen: open, appPhase: open ? 'LANDING' : 'WAITING_FACE' }),

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
    // Once a video plays, it MUST complete! Never interrupt an active video.
    if (get().isOverlayVideoPlaying) {
      return;
    }

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
      cooldownActive: false,
      detectionState: get().cameraEnabled ? 'SERIOUS' : 'IDLE',
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
      appPhase: enabled ? (get().appPhase === 'LANDING' ? 'WAITING_FACE' : get().appPhase) : 'LANDING',
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
    if (scanIntervalTimer) {
      clearInterval(scanIntervalTimer);
      scanIntervalTimer = null;
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
      currentJathakam: null,
      scanProgress: 0,
      smileReactionToast: null,
    });
  },
}));
