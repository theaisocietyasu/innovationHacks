'use client';

import { useEffect, useRef, useState } from 'react';

interface CheckInResult {
  success: boolean;
  alreadyCheckedIn?: boolean;
  name?: string;
  reason?: string;
}

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QrScannerModal({ isOpen, onClose }: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef(false);
  const processingRef = useRef(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const resultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const stopScanner = () => {
    activeRef.current = false;
    processingRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const handleClose = () => {
    stopScanner();
    setResult(null);
    setCameraError(null);
    setDevices([]);
    setSelectedDeviceId('');
    if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
    onClose();
  };

  const processToken = async (token: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    try {
      const res = await fetch(`/api/admin/checkin/${encodeURIComponent(token)}`);
      const data: CheckInResult = await res.json();
      setResult(data);
      // Auto-clear result after 4 seconds and resume scanning
      resultTimeoutRef.current = setTimeout(() => {
        setResult(null);
        processingRef.current = false;
      }, 4000);
    } catch {
      setResult({ success: false, reason: 'network_error' });
      resultTimeoutRef.current = setTimeout(() => {
        setResult(null);
        processingRef.current = false;
      }, 4000);
    }
  };

  const startScanner = async (deviceId?: string) => {
    if (!videoRef.current) return;
    activeRef.current = true;
    setCameraError(null);
    setScanning(true);

    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();

      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!activeRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      // Enumerate devices after permission is granted (labels are available now)
      if (devices.length === 0) {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
        setDevices(videoDevices);
        // Set the selected device to the active track's device
        const activeTrackId = stream.getVideoTracks()[0]?.getSettings().deviceId;
        if (activeTrackId) setSelectedDeviceId(activeTrackId);
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      reader.decodeFromStream(stream, videoRef.current, (res, err) => {
        if (!activeRef.current) return;
        if (res) {
          const text = res.getText();
          const urlMatch = text.match(/\/api\/admin\/checkin\/([^/?#]+)/);
          if (urlMatch) {
            void processToken(urlMatch[1]);
          } else {
            setResult({ success: false, reason: 'invalid_token' });
            resultTimeoutRef.current = setTimeout(() => setResult(null), 4000);
          }
        }
        void err; // suppress non-error "not found" callbacks
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setCameraError(
        msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')
          ? 'Camera permission denied. Please allow camera access and try again.'
          : `Camera error: ${msg}`,
      );
      setScanning(false);
    }
  };

  const handleDeviceChange = (newDeviceId: string) => {
    setSelectedDeviceId(newDeviceId);
    setResult(null);
    if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
    stopScanner();
    void startScanner(newDeviceId);
  };

  useEffect(() => {
    if (isOpen) {
      void startScanner();
    } else {
      stopScanner();
      setResult(null);
      setCameraError(null);
      setDevices([]);
      setSelectedDeviceId('');
    }
    return () => {
      stopScanner();
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="QR Code Scanner"
    >
      {/* Header */}
      <div className="w-full max-w-sm flex items-center justify-between px-4 py-3">
        <span className="text-white font-semibold text-base">Scan QR Code</span>
        <button
          onClick={handleClose}
          className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          aria-label="Close scanner"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Camera viewport */}
      <div className="relative w-full max-w-sm aspect-square bg-black rounded-2xl overflow-hidden border border-white/10">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          aria-hidden="true"
        />

        {/* Scanning overlay — corner brackets */}
        {scanning && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-56 h-56">
              {/* Top-left */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#E066FF] rounded-tl-md" />
              {/* Top-right */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#E066FF] rounded-tr-md" />
              {/* Bottom-left */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#E066FF] rounded-bl-md" />
              {/* Bottom-right */}
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#E066FF] rounded-br-md" />
              {/* Scan line animation */}
              <div className="absolute left-0 right-0 h-0.5 bg-[#E066FF]/60 animate-scan-line" />
            </div>
          </div>
        )}

        {/* Camera error */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center gap-4 bg-black/80">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-12 w-12 text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            <p className="text-red-400 text-sm">{cameraError}</p>
            <button
              onClick={() => void startScanner()}
              className="px-4 py-2 bg-[#E066FF]/20 border border-[#E066FF]/40 text-[#E066FF] text-sm rounded-lg hover:bg-[#E066FF]/30 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Result overlay */}
        {result && (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center px-6 text-center gap-3 ${
              result.success
                ? result.alreadyCheckedIn
                  ? 'bg-yellow-500/20'
                  : 'bg-green-500/20'
                : 'bg-red-500/20'
            }`}
          >
            {result.success ? (
              result.alreadyCheckedIn ? (
                <>
                  <div className="h-16 w-16 rounded-full bg-yellow-400/20 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-8 w-8 text-yellow-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                    </svg>
                  </div>
                  <p className="text-yellow-300 font-bold text-lg">Already Checked In</p>
                  {result.name && <p className="text-white/70 text-sm">{result.name}</p>}
                </>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-green-400/20 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-8 w-8 text-green-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-300 font-bold text-lg">Checked In!</p>
                  {result.name && <p className="text-white/70 text-sm">{result.name}</p>}
                </>
              )
            ) : (
              <>
                <div className="h-16 w-16 rounded-full bg-red-400/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-8 w-8 text-red-400">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <p className="text-red-300 font-bold text-lg">
                  {result.reason === 'not_found'
                    ? 'Token Not Found'
                    : result.reason === 'invalid_token'
                    ? 'Invalid QR Code'
                    : 'Check-In Failed'}
                </p>
                <p className="text-white/50 text-sm">
                  {result.reason === 'network_error'
                    ? 'Network error — please try again.'
                    : result.reason === 'invalid_token'
                    ? 'This QR code is not a valid check-in code.'
                    : 'This QR code is not recognized.'}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <p className="mt-4 text-white/40 text-sm">Point camera at a student&apos;s QR code</p>

      {/* Camera selector */}
      {devices.length > 1 && (
        <div className="mt-3 w-full max-w-sm px-4">
          <select
            value={selectedDeviceId}
            onChange={(e) => handleDeviceChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white/70 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#E066FF]/50 appearance-none cursor-pointer"
            aria-label="Select camera"
          >
            {devices.map((device, i) => (
              <option key={device.deviceId} value={device.deviceId} className="bg-[#0a0614]">
                {device.label || `Camera ${i + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <style jsx>{`
        @keyframes scan-line {
          0%   { transform: translateY(0); }
          50%  { transform: translateY(224px); }
          100% { transform: translateY(0); }
        }
        .animate-scan-line {
          animation: scan-line 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
