import { useEffect, useRef, useState, useCallback } from 'react';
import { useSmileStore } from '@/store/useSmileStore';

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  startCamera: () => Promise<boolean>;
  stopCamera: () => void;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const {
    setCameraEnabled,
    setCameraLoading,
    setCameraError,
  } = useSmileStore();

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore
        }
      });
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraEnabled(false);
    setCameraLoading(false);
  }, [stream, setCameraEnabled, setCameraLoading]);

  const startCamera = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Camera API not supported in this browser. Please ensure you are running on HTTPS or localhost.'
      );
      return false;
    }

    // Stop existing stream if any
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    setCameraLoading(true);
    setCameraError(null);

    try {
      // Use broad constraints compatible with all Windows/external/integrated webcams
      // (avoid strict facingMode: 'user' which fails on some Windows hardware)
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('[CHIRI POLICE CAMERA] MediaStream acquired:', mediaStream.id, 'Tracks:', mediaStream.getVideoTracks().length);
      
      setStream(mediaStream);
      setCameraEnabled(true);
      setCameraLoading(false);
      setCameraError(null);
      return true;
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[CHIRI POLICE CAMERA ERROR]', error);

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraError(
          'CAMERA ACCESS DENIED. THE POLICE CANNOT INVESTIGATE WITHOUT EVIDENCE. PLEASE ALLOW WEBCAM PERMISSION.',
          true
        );
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setCameraError('NO CAMERA HARDWARE FOUND. INVESTIGATION SUSPENDED.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setCameraError('CAMERA HARDWARE IN USE BY ANOTHER APPLICATION.');
      } else {
        setCameraError(`CAMERA ERROR: ${error.message || 'Unknown error'}`);
      }
      setCameraLoading(false);
      return false;
    }
  }, [stream, setCameraEnabled, setCameraError, setCameraLoading]);

  // Clean up all tracks on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {
            // Ignore
          }
        });
      }
    };
  }, [stream]);

  return {
    videoRef,
    stream,
    startCamera,
    stopCamera,
  };
}
