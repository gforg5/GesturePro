
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as HandsModule from '@mediapipe/hands';
import { detectGesture } from '../services/gestureRecognition';
import { GestureType } from '../types';

// Use global constructors if available to avoid ESM overhead
const Hands = (HandsModule as any).Hands || (window as any).Hands;

// Define local Landmark interface for type safety
interface Landmark {
  x: number;
  y: number;
  z: number;
}

interface HandTrackerProps {
  onGestureDetected: (gesture: GestureType, position: { x: number; y: number }) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onGestureDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  
  // Buffering for gesture stability to avoid frequent React state updates
  const gestureBuffer = useRef<GestureType[]>([]);
  const BUFFER_SIZE = 3;

  const processResults = useCallback((results: any) => {
    if (!canvasRef.current || !results.image) return;
    const canvasCtx = canvasRef.current.getContext('2d', { alpha: false });
    if (!canvasCtx) return;

    // Fast draw of camera feed
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, 320, 240);
    canvasCtx.translate(320, 0);
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(results.image, 0, 0, 320, 240);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      // Cast landmarks to specific type to avoid "any" arithmetic issues
      const landmarks = results.multiHandLandmarks[0] as Landmark[];
      
      // Draw minimal landmarks for performance
      canvasCtx.fillStyle = "#0ef";
      for (let i = 0; i < landmarks.length; i += 4) { // Only draw key joints
        const lm = landmarks[i];
        canvasCtx.beginPath();
        // Fix: Ensure properties are numeric for arithmetic operations
        canvasCtx.arc(lm.x * 320, lm.y * 240, 2, 0, 2 * Math.PI);
        canvasCtx.fill();
      }

      const rawGesture = detectGesture(landmarks);
      const x = landmarks[9].x; 
      const y = landmarks[9].y;

      // Stability filtering: only notify if the gesture is consistent
      gestureBuffer.current.push(rawGesture);
      if (gestureBuffer.current.length > BUFFER_SIZE) {
        gestureBuffer.current.shift();
      }

      const mostFrequent = gestureBuffer.current.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Fix: Explicitly handle types in sorting to avoid arithmetic operation errors on line 61/62
      const entries = Object.entries(mostFrequent) as [string, number][];
      const sortedEntries = entries.sort((a, b) => b[1] - a[1]);
      const stableGesture = sortedEntries[0][0] as GestureType;
      
      onGestureDetected(stableGesture, { x, y });
    } else {
      onGestureDetected(GestureType.NONE, { x: 0.5, y: 0.5 });
    }
    canvasCtx.restore();
  }, [onGestureDetected]);

  useEffect(() => {
    let hands: any;
    let stream: MediaStream | null = null;
    let animationId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, frameRate: { ideal: 30 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const HandsConstructor = Hands || (window as any).Hands;
        if (!HandsConstructor) throw new Error("MediaPipe Hands not found");

        hands = new HandsConstructor({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0, // 0 is fastest, 1 is balanced
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
          selfieMode: true
        });

        hands.onResults(processResults);
        setIsModelLoaded(true);

        const loop = async () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            await hands.send({ image: videoRef.current });
          }
          animationId = requestAnimationFrame(loop);
        };
        loop();
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };

    startCamera();

    return () => {
      cancelAnimationFrame(animationId);
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (hands) hands.close();
    };
  }, [processResults]);

  return (
    <div className="fixed bottom-6 right-6 w-48 h-36 border border-white/20 rounded bg-black z-50 overflow-hidden shadow-2xl pointer-events-none will-change-transform">
      {!isModelLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-[10px] animate-pulse text-[#0ef] uppercase font-bold tracking-widest">
          SYSTEM BOOT...
        </div>
      )}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="w-full h-full object-cover grayscale opacity-60" width={320} height={240} />
      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 border border-[#0ef]/40 text-[#0ef] text-[8px] font-bold uppercase rounded">
        TRACKER_CORE
      </div>
    </div>
  );
};

export default HandTracker;
