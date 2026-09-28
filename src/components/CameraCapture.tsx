import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle, SwitchCamera } from 'lucide-react';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);

  // Stop camera tracks helper
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Check available video devices
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!isOpen) return;
    setIsStartingCamera(true);
    setCameraError(null);
    stopStream();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      // Fallback without facingMode constraint if ideal fails
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play().catch(() => {});
        }
      } catch (fallbackErr: any) {
        setCameraError(fallbackErr.message || 'Camera access denied or camera device not found.');
      }
    } finally {
      setIsStartingCamera(false);
    }
  }, [isOpen, facingMode, stopStream]);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen, capturedImage, startCamera, stopStream]);

  // Capture frame to base64
  const takePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopStream();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-semibold text-white text-base">Capture Slip Photo</h3>
              <p className="text-xs text-slate-400">Position the handwritten slip clearly within the frame</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[360px] overflow-hidden">
          {capturedImage ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedImage}
                alt="Captured Slip"
                className="max-h-[60vh] max-w-full object-contain rounded"
              />
              <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow">
                Photo Captured ✓
              </div>
            </div>
          ) : cameraError ? (
            <div className="p-8 text-center max-w-md text-slate-300">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
              <p className="font-medium text-white mb-2">Camera Access Unavailable</p>
              <p className="text-xs text-slate-400 mb-4">{cameraError}</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Try Again
                </button>
                <p className="text-xs text-slate-500">
                  Tip: You can also upload or paste an image directly!
                </p>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain max-h-[60vh]"
              />

              {/* Document Alignment Overlay Box */}
              <div className="pointer-events-none absolute inset-6 border-2 border-dashed border-emerald-400/60 rounded-xl flex items-center justify-center">
                <div className="absolute top-2 left-3 bg-black/60 px-2 py-0.5 rounded text-[11px] text-emerald-300 font-mono">
                  Slip Alignment Frame
                </div>
              </div>

              {isStartingCamera && (
                <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-slate-300 text-sm gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                  Starting camera...
                </div>
              )}
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div>
            {!capturedImage && hasMultipleCameras && (
              <button
                type="button"
                onClick={toggleFacingMode}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
              >
                <SwitchCamera className="w-4 h-4 text-emerald-400" />
                <span>Switch Camera ({facingMode === 'environment' ? 'Back' : 'Front'})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {capturedImage ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Retake
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg flex items-center gap-1.5 transition shadow-lg shadow-emerald-900/40 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Convert to Excel
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={Boolean(cameraError) || isStartingCamera}
                onClick={takePhoto}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition active:scale-95 cursor-pointer"
              >
                <Camera className="w-5 h-5" /> Take Photo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
