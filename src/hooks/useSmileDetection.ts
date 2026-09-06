import { useEffect, useRef, useCallback } from 'react';
import { FilesetResolver, FaceLandmarker, FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { useSmileStore, DetectionState } from '@/store/useSmileStore';
import { DETECTION_CONFIG, SmileIntensity } from '@/config/detectionConfig';
import { calculateSmileScore, smoothSmileScore, NormalizedLandmark } from '@/utils/smileDetection';
import { detectExposedTeeth } from '@/utils/teethDetector';
import { detectFacialExpression, FacialExpression, EXPRESSION_METADATA, getRandomExpressionVideo } from '@/utils/expressionDetector';
import { classifySmileIntensity } from '@/utils/smileClassifier';
import { selectRandomMockVideo, MOCK_VIDEOS } from '@/data/mockVideos';
import { MOCK_LINES, MockLine } from '@/data/mockLines';
import { SmileType } from '@/utils/expressionDetector';

export interface FaceDetectionData {
  faceIndex: number;
  landmarks: NormalizedLandmark[];
  rawScore: number;
  smileScore: number;
  isSmiling: boolean;
  intensity: SmileIntensity;
  teethCount: number;
  teethPoints: { x: number; y: number }[];
  teethVerdictMl: string;
  teethVerdictEn: string;
  expression: FacialExpression;
  smileType: SmileType;
  smileTypeMl: string;
  sneakinessScore: number;
  symmetryScore: number;
}

interface UseSmileDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function useSmileDetection({ videoRef, canvasRef }: UseSmileDetectionProps) {
  // Store selectors and actions
  const cameraEnabled = useSmileStore((s) => s.cameraEnabled);
  const setModelStatus = useSmileStore((s) => s.setModelStatus);
  const updateDetectionMetrics = useSmileStore((s) => s.updateDetectionMetrics);
  const startMockSequence = useSmileStore((s) => s.startMockSequence);
  const setCooldownActive = useSmileStore((s) => s.setCooldownActive);
  const setDetectionState = useSmileStore((s) => s.setDetectionState);
  const finishMockPlayback = useSmileStore((s) => s.finishMockPlayback);
  const isChallengeActive = useSmileStore((s) => s.isChallengeActive);
  const setChallengeSeconds = useSmileStore((s) => s.setChallengeSeconds);
  const recordSmileBusted = useSmileStore((s) => s.recordSmileBusted);

  // References for loop and state machine
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastDetectionTimestampRef = useRef<number>(0);
  const lastUiUpdateRef = useRef<number>(0);

  // Internal state machine tracking (avoids stale closures inside requestAnimationFrame)
  const isSmilingRef = useRef<boolean>(false);
  const smoothedScoreRef = useRef<number>(0);
  const cooldownRef = useRef<boolean>(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef<DetectionState>('IDLE');
  const lastVideoIdRef = useRef<string | null>(null);
  const lastLineIdRef = useRef<string | null>(null);
  const lastExpressionRef = useRef<FacialExpression | null>(null);
  const expressionCooldownRef = useRef<boolean>(false);
  const challengeStartRef = useRef<number>(0);

  // ---------------------------------------------------------------------------
  // 1. ROBUST MEDIAPIPE INITIALIZATION (GPU with automatic CPU Fallback)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isCancelled = false;

    async function initFaceLandmarker() {
      try {
        setModelStatus(true, false, null);

        // Initialize FilesetResolver with local WASM binaries, fallback to CDN
        let vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>> | null = null;
        try {
          vision = await FilesetResolver.forVisionTasks(DETECTION_CONFIG.wasmPath);
        } catch (wasmErr) {
          console.warn('[CHIRI POLICE] Local wasm failed, trying CDN wasm:', wasmErr);
          vision = await FilesetResolver.forVisionTasks(DETECTION_CONFIG.cdnWasmPath);
        }

        if (isCancelled || !vision) return;

        let faceLandmarker: FaceLandmarker | null = null;
        const candidates = [DETECTION_CONFIG.modelPath, DETECTION_CONFIG.cdnModelPath];

        for (const modelPath of candidates) {
          if (faceLandmarker) break;

          // Try CPU delegate first for 100% stability across all GPUs and drivers, fallback to GPU
          for (const delegate of ['CPU', 'GPU'] as const) {
            try {
              console.log(`[CHIRI POLICE] Attempting FaceLandmarker init (${modelPath}, delegate: ${delegate})...`);
              faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                  modelAssetPath: modelPath,
                  delegate,
                },
                runningMode: 'VIDEO',
                numFaces: 4,
                minFaceDetectionConfidence: 0.35,
                minFacePresenceConfidence: 0.35,
                minTrackingConfidence: 0.35,
                outputFaceBlendshapes: true,
              });
              console.log(`[CHIRI POLICE] FaceLandmarker successfully initialized (${modelPath}, delegate: ${delegate})`);
              break;
            } catch (err) {
              console.warn(`[CHIRI POLICE] Init failed for ${modelPath} on ${delegate}:`, err);
            }
          }
        }

        if (isCancelled) {
          faceLandmarker?.close();
          return;
        }

        if (!faceLandmarker) {
          throw new Error('Unable to initialize Face Landmarker with local or CDN models');
        }

        landmarkerRef.current = faceLandmarker;
        setModelStatus(false, true, null);
      } catch (err: unknown) {
        const error = err as Error;
        console.error('[MEDIAPIPE FATAL INIT ERROR]', error);
        if (!isCancelled) {
          setModelStatus(false, false, error.message || 'Failed to initialize Face Landmarker');
        }
      }
    }

    initFaceLandmarker();

    return () => {
      isCancelled = true;
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch {
          // Ignore
        }
        landmarkerRef.current = null;
      }
    };
  }, [setModelStatus]);

  // ---------------------------------------------------------------------------
  // 2. MOCK TRIGGER & COOLDOWN DISPATCH (First mock with text, then movie dialogue)
  // ---------------------------------------------------------------------------
  const fireMockTrigger = useCallback(
    (intensity: SmileIntensity, expression: FacialExpression = 'smile') => {
      if (intensity === 'none') return;

      const matchingLines = MOCK_LINES.filter((line) => line.intensity === intensity);
      const unrepeated = matchingLines.filter((l) => l.id !== lastLineIdRef.current);
      const pool = unrepeated.length > 0 ? unrepeated : matchingLines;
      const randomLine: MockLine = pool[Math.floor(Math.random() * pool.length)] || MOCK_LINES[0];
      lastLineIdRef.current = randomLine.id;

      const resolvedExpr =
        expression !== 'neutral' ? expression : intensity === 'extreme' ? 'laughing' : 'smile';

      let videoUrl: string;
      if (
        resolvedExpr !== 'smile' &&
        resolvedExpr !== 'laughing' &&
        EXPRESSION_METADATA[resolvedExpr]?.videos?.length
      ) {
        // Specific facial expression video pool (using assets from no_smile, wierd_laugh, etc.)
        videoUrl = getRandomExpressionVideo(resolvedExpr, lastVideoIdRef.current);
      } else {
        // Map smile / laughing to appropriate asset folder category:
        // - 'wierd_laugh' for intense bursts / laughing
        // - 'smile' for standard smiles
        const categoryPref = resolvedExpr === 'laughing' ? 'wierd_laugh' : 'smile';
        const mockVideo = selectRandomMockVideo(intensity, lastVideoIdRef.current, categoryPref);
        videoUrl = mockVideo.src;
      }

      // Safeguard: avoid consecutive identical videos
      if (videoUrl === lastVideoIdRef.current) {
        const altPool = MOCK_VIDEOS.filter((v) => v.src !== lastVideoIdRef.current);
        if (altPool.length > 0) {
          videoUrl = altPool[Math.floor(Math.random() * altPool.length)].src;
        }
      }
      lastVideoIdRef.current = videoUrl;

      // Stage 1: Display text mock first. After delay, Stage 2: Play movie dialogue!
      startMockSequence({
        expression: resolvedExpr,
        mockText: randomLine.malayalam,
        videoUrl,
        delayMs: 1400,
      });

      cooldownRef.current = true;
      stateRef.current = 'COOLDOWN';
      setCooldownActive(true);
      setDetectionState('COOLDOWN');

      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }

      cooldownTimerRef.current = setTimeout(() => {
        cooldownRef.current = false;
        setCooldownActive(false);

        finishMockPlayback();

        if (smoothedScoreRef.current >= DETECTION_CONFIG.resetThreshold) {
          stateRef.current = 'WAITING_RESET';
          setDetectionState('WAITING_RESET');
        } else {
          stateRef.current = 'SERIOUS';
          setDetectionState('SERIOUS');
          isSmilingRef.current = false;
        }
      }, 6000); // 1.4s text mock + ~4s movie dialogue
    },
    [startMockSequence, setCooldownActive, setDetectionState, finishMockPlayback]
  );

  // ---------------------------------------------------------------------------
  // 3. CANVAS FORENSIC DRAWING ROUTINE (MULTI-FACE SUPPORT)
  // ---------------------------------------------------------------------------
  const drawForensicOverlay = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      faces: FaceDetectionData[],
      state: DetectionState,
      multipleFaces: boolean
    ) => {
      ctx.clearRect(0, 0, width, height);

      if (faces.length === 0) {
        ctx.strokeStyle = '#FFE500';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(width * 0.2, height * 0.15, width * 0.6, height * 0.7);
        ctx.setLineDash([]);

        ctx.fillStyle = '#FFE500';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillText('[ SCANNING FOR FACES // മുഖം തിരയുന്നു ]', width * 0.2 + 8, height * 0.15 - 8);
        return;
      }

      // Top Multi-Face Police Radar Banner
      if (multipleFaces && faces.length > 1) {
        const topBanner = `👥 MULTI-FACE MODE: ${faces.length} SUSPECTS MONITORED`;
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        const tbWidth = ctx.measureText(topBanner).width;
        ctx.fillStyle = '#000000';
        ctx.fillRect(width / 2 - tbWidth / 2 - 12, 10, tbWidth + 24, 24);
        ctx.strokeStyle = '#FFE500';
        ctx.lineWidth = 2;
        ctx.strokeRect(width / 2 - tbWidth / 2 - 12, 10, tbWidth + 24, 24);
        ctx.fillStyle = '#FFE500';
        ctx.fillText(topBanner, width / 2 - tbWidth / 2, 26);
      }

      // Render forensic box for EACH detected face
      faces.forEach((f) => {
        let minX = 1,
          maxX = 0,
          minY = 1,
          maxY = 0;
        for (const p of f.landmarks) {
          // Mirrored horizontal position to match mirrored selfie video
          const mx = 1 - p.x;
          if (mx < minX) minX = mx;
          if (mx > maxX) maxX = mx;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        }

        const boxX = minX * width;
        const boxY = minY * height;
        const boxW = (maxX - minX) * width;
        const boxH = (maxY - minY) * height;

        // Individual face alert color: Red if THIS specific person is smiling!
        const isFaceAlert =
          f.isSmiling ||
          (state === 'SMILING' && f.isSmiling) ||
          (state === 'COOLDOWN' && f.isSmiling);
        const boxColor = isFaceAlert
          ? '#FF1E1E'
          : state === 'WAITING_RESET'
          ? '#FFE500'
          : '#00E676';

        // 1. Brutalist Corner brackets
        const cornerLen = Math.min(24, boxW * 0.25);
        ctx.strokeStyle = boxColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + cornerLen);
        ctx.lineTo(boxX, boxY);
        ctx.lineTo(boxX + cornerLen, boxY);
        ctx.moveTo(boxX + boxW - cornerLen, boxY);
        ctx.lineTo(boxX + boxW, boxY);
        ctx.lineTo(boxX + boxW, boxY + cornerLen);
        ctx.moveTo(boxX + boxW, boxY + boxH - cornerLen);
        ctx.lineTo(boxX + boxW, boxY + boxH);
        ctx.lineTo(boxX + boxW - cornerLen, boxY + boxH);
        ctx.moveTo(boxX + cornerLen, boxY + boxH);
        ctx.lineTo(boxX, boxY + boxH);
        ctx.lineTo(boxX, boxY + boxH - cornerLen);
        ctx.stroke();

        // 2. Highlight key mouth landmarks (mirrored horizontally)
        const mouthIndices = [
          DETECTION_CONFIG.landmarks.leftMouthCorner,
          DETECTION_CONFIG.landmarks.rightMouthCorner,
          DETECTION_CONFIG.landmarks.upperLipTop,
          DETECTION_CONFIG.landmarks.lowerLipBottom,
        ];

        ctx.fillStyle = boxColor;
        mouthIndices.forEach((idx) => {
          const pt = f.landmarks[idx];
          if (pt) {
            const px = (1 - pt.x) * width;
            const py = pt.y * height;
            ctx.fillRect(px - 3, py - 3, 6, 6);
          }
        });

        // 3. Minimal HUD Tag above face box (Individual suspect tracking)
        ctx.fillStyle = '#000000';
        const labelText = multipleFaces
          ? `SUSPECT #${f.faceIndex + 1}: ${isFaceAlert ? 'BUSTED! ' + Math.round(f.smileScore) + '%' : Math.round(f.smileScore) + '%'}`
          : isFaceAlert
          ? `SMILE ${Math.round(f.smileScore) + '%'}`
          : `FACE ✓`;
        const textWidth = ctx.measureText(labelText).width;
        ctx.fillRect(boxX, Math.max(0, boxY - 22), textWidth + 14, 20);
        ctx.fillStyle = isFaceAlert ? '#FFE500' : '#FFFFFF';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillText(labelText, boxX + 6, Math.max(14, boxY - 7));

        // 3b. Malayalam Smile Type Tag
        if (isFaceAlert && f.smileTypeMl && f.smileTypeMl !== 'ചിരിയില്ല') {
          const typeText = `🎭 ${f.smileTypeMl}`;
          const tWidth = ctx.measureText(typeText).width;
          const tX = boxX + textWidth + 20;
          ctx.fillStyle = '#FFE500';
          ctx.fillRect(tX, Math.max(0, boxY - 22), tWidth + 14, 20);
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 11px "Noto Sans Malayalam", monospace';
          ctx.fillText(typeText, tX + 6, Math.max(14, boxY - 7));
        }

        // 4. Comical Dental Scanner HUD: ONLY when teeth are physically exposed outside
        const lowerLip = f.landmarks[DETECTION_CONFIG.landmarks.lowerLipBottom];
        if (lowerLip && f.teethCount > 0) {
          ctx.fillStyle = '#FFE500';
          f.teethPoints.forEach((pt: { x: number; y: number }) => {
            const px = (1 - pt.x) * width;
            const py = pt.y * height;
            ctx.fillRect(px - 2, py - 2, 4, 4);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(px - 2, py - 2, 4, 4);
          });

          const dentalText = `🦷 TEETH: ${f.teethCount}/32`;
          const dWidth = ctx.measureText(dentalText).width;
          const dX = (1 - lowerLip.x) * width - dWidth / 2;
          const dY = lowerLip.y * height + 12;

          ctx.fillStyle = '#000000';
          ctx.fillRect(dX - 4, dY, dWidth + 8, 18);
          ctx.fillStyle = f.teethCount >= 28 ? '#FF1E1E' : f.teethCount >= 10 ? '#FFE500' : '#FFFFFF';
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.fillText(dentalText, dX, dY + 13);
        }
      });
    },
    []
  );

  // ---------------------------------------------------------------------------
  // 4. MAIN DETECTION LOOP (requestAnimationFrame)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const isCameraActive = Boolean(cameraEnabled || videoRef.current?.srcObject);

    if (!isCameraActive) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      stateRef.current = 'IDLE';
      isSmilingRef.current = false;
      smoothedScoreRef.current = 0;

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      return;
    }

    let isSubscribed = true;

    function detectFrame(timestamp: number) {
      if (!isSubscribed) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;

      // Ensure video is actively playing as soon as stream is attached
      if (video && video.paused && video.srcObject) {
        video.play().catch(() => {});
      }

      if (video && landmarker) {
        const hasDimensions = video.videoWidth > 0 && video.videoHeight > 0;

        if (hasDimensions) {
          // Align canvas dimensions to match actual video frame
          if (canvas) {
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
            }
          }

          // Throttle detection to ~30fps with strictly monotonic integer timestamps
          const nowMs = Math.round(performance.now());
          if (nowMs > lastDetectionTimestampRef.current && nowMs - lastDetectionTimestampRef.current >= 30) {
            lastDetectionTimestampRef.current = nowMs;

            let result: FaceLandmarkerResult | null = null;
            try {
              result = landmarker.detectForVideo(video, nowMs);
            } catch (detectErr) {
              console.warn('[CHIRI POLICE DETECT ERROR]', detectErr);
            }

            const faceCount = result?.faceLandmarks?.length || 0;
            const multipleFaces = faceCount > 1;

            if (faceCount === 0) {
              if (stateRef.current !== 'IDLE' && stateRef.current !== 'SEARCHING') {
                stateRef.current = 'SEARCHING';
              }
              smoothedScoreRef.current = 0;
              isSmilingRef.current = false;

              if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  drawForensicOverlay(ctx, canvas.width, canvas.height, [], 'SEARCHING', false);
                }
              }

              if (timestamp - lastUiUpdateRef.current > 120) {
                lastUiUpdateRef.current = timestamp;
                updateDetectionMetrics({
                  faceDetected: false,
                  multipleFacesDetected: false,
                  faceCount: 0,
                  rawSmileScore: 0,
                  smileScore: 0,
                  isSmiling: false,
                  smileIntensity: 'none',
                  detectionState: 'SEARCHING',
                });
              }
            } else {
              // Analyze ALL faces in frame simultaneously
              const analyzedFaces: FaceDetectionData[] = [];

              for (let i = 0; i < faceCount; i++) {
                const landmarks = result!.faceLandmarks[i] as NormalizedLandmark[];
                const rawBlendshapes =
                  (result as { faceBlendshapes?: { categories: { categoryName: string; score: number }[] }[] })
                    .faceBlendshapes?.[i]?.categories || [];
                const blendshapeMap: Record<string, number> = {};
                for (const b of rawBlendshapes) {
                  blendshapeMap[b.categoryName] = b.score;
                }

                const { rawScore: geomScore } = calculateSmileScore(landmarks);
                const bsSmileLeft = blendshapeMap['mouthSmileLeft'] ?? 0;
                const bsSmileRight = blendshapeMap['mouthSmileRight'] ?? 0;
                const bsSmileScore = Math.round(((bsSmileLeft + bsSmileRight) / 2) * 100);

                const faceRawScore = Math.max(geomScore, bsSmileScore);
                const teethResult = detectExposedTeeth(videoRef.current, landmarks);
                const expressionResult = detectFacialExpression(
                  landmarks,
                  faceRawScore,
                  teethResult.teethCount,
                  blendshapeMap
                );
                const intensity = classifySmileIntensity(faceRawScore);
                const isFaceSmiling =
                  faceRawScore >= DETECTION_CONFIG.triggerThreshold ||
                  expressionResult.expression === 'laughing' ||
                  (expressionResult.expression === 'smile' && faceRawScore >= 38);

                analyzedFaces.push({
                  faceIndex: i,
                  landmarks,
                  rawScore: faceRawScore,
                  smileScore: faceRawScore,
                  isSmiling: isFaceSmiling,
                  intensity,
                  teethCount: teethResult.teethCount,
                  teethPoints: teethResult.teethPoints,
                  teethVerdictMl: teethResult.teethVerdictMl,
                  teethVerdictEn: teethResult.teethVerdictEn,
                  expression: expressionResult.expression,
                  smileType: expressionResult.smileType,
                  smileTypeMl: expressionResult.smileTypeMl,
                  sneakinessScore: expressionResult.metrics.sneakinessScore,
                  symmetryScore: expressionResult.metrics.symmetryScore,
                });
              }

              // Identify primary face (culprit with highest smile score)
              const sorted = [...analyzedFaces].sort((a, b) => b.rawScore - a.rawScore);
              const primaryFace = sorted[0];

              const smoothed = smoothSmileScore(primaryFace.rawScore, smoothedScoreRef.current);
              smoothedScoreRef.current = smoothed;

              const isCurrentlySmiling = analyzedFaces.some((f) => f.isSmiling);
              const isBelowReset = smoothed <= DETECTION_CONFIG.resetThreshold;

              // Track facial expression
              if (primaryFace.expression !== 'neutral') {
                lastExpressionRef.current = primaryFace.expression;
              } else {
                lastExpressionRef.current = null;
              }

              // State Machine Transitions
              if (cooldownRef.current) {
                stateRef.current = 'COOLDOWN';
                if (isBelowReset) {
                  isSmilingRef.current = false;
                }
              } else if (stateRef.current === 'WAITING_RESET' || stateRef.current === 'SMILING') {
                if (isBelowReset) {
                  stateRef.current = 'SERIOUS';
                  isSmilingRef.current = false;
                  setDetectionState('SERIOUS');
                }
              } else {
                // Currently in SERIOUS or IDLE
                if (isCurrentlySmiling && !isSmilingRef.current) {
                  isSmilingRef.current = true;
                  stateRef.current = 'SMILING';
                  setDetectionState('SMILING');
                  fireMockTrigger(primaryFace.intensity, primaryFace.expression);
                } else if (!isCurrentlySmiling) {
                  stateRef.current = 'SERIOUS';
                  isSmilingRef.current = false;
                }
              }

              // Serious Challenge Staring Contest Mode
              if (isChallengeActive) {
                if (!isCurrentlySmiling) {
                  if (challengeStartRef.current === 0) {
                    challengeStartRef.current = timestamp;
                  }
                  const elapsed = (timestamp - challengeStartRef.current) / 1000;
                  setChallengeSeconds(Math.round(elapsed * 10) / 10);
                } else {
                  if (challengeStartRef.current > 0) {
                    recordSmileBusted();
                    challengeStartRef.current = 0;
                  }
                }
              } else {
                challengeStartRef.current = 0;
              }

              // Draw forensic HUD overlay for ALL faces
              if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  drawForensicOverlay(
                    ctx,
                    canvas.width,
                    canvas.height,
                    analyzedFaces,
                    stateRef.current,
                    multipleFaces
                  );
                }
              }

              // Update React UI metrics at ~20fps
              if (timestamp - lastUiUpdateRef.current > 50) {
                lastUiUpdateRef.current = timestamp;
                updateDetectionMetrics({
                  faceDetected: true,
                  multipleFacesDetected: multipleFaces,
                  faceCount,
                  rawSmileScore: primaryFace.rawScore,
                  smileScore: smoothed,
                  isSmiling: isCurrentlySmiling,
                  smileIntensity: primaryFace.intensity,
                  detectionState: stateRef.current,
                  teethCount: primaryFace.teethCount,
                  teethVerdictMl: primaryFace.teethVerdictMl,
                  teethVerdictEn: primaryFace.teethVerdictEn,
                  smileType: primaryFace.smileType,
                  smileTypeMl: primaryFace.smileTypeMl,
                  sneakinessScore: primaryFace.sneakinessScore,
                  symmetryScore: primaryFace.symmetryScore,
                });
              }
            }
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(detectFrame);
    }

    animFrameIdRef.current = requestAnimationFrame(detectFrame);

    return () => {
      isSubscribed = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    };
  }, [
    cameraEnabled,
    videoRef,
    canvasRef,
    drawForensicOverlay,
    fireMockTrigger,
    updateDetectionMetrics,
  ]);
}
