
import { GestureType } from '../types';

interface Landmark {
  x: number;
  y: number;
  z: number;
}

const getDistance = (a: Landmark, b: Landmark) => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

export const detectGesture = (landmarks: Landmark[]): GestureType => {
  if (!landmarks || landmarks.length < 21) return GestureType.NONE;

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  const indexMcp = landmarks[5];
  const middleMcp = landmarks[9];
  const ringMcp = landmarks[13];
  const pinkyMcp = landmarks[17];

  // Helper: Is finger extended? (Threshold based on MCP vs Tip Y position)
  const isExtended = (tip: Landmark, mcp: Landmark) => tip.y < mcp.y - 0.02;

  const indexOpen = isExtended(indexTip, indexMcp);
  const middleOpen = isExtended(middleTip, middleMcp);
  const ringOpen = isExtended(ringTip, ringMcp);
  const pinkyOpen = isExtended(pinkyTip, pinkyMcp);

  // 1. PINCH (Thumb + Index close, others mostly closed)
  const pinchDist = getDistance(thumbTip, indexTip);
  if (pinchDist < 0.045 && !middleOpen && !ringOpen) {
    return GestureType.PINCH;
  }

  // 2. THREE FINGERS (Index, Middle, Ring open, Pinky closed)
  if (indexOpen && middleOpen && ringOpen && !pinkyOpen) {
    return GestureType.THREE_FINGERS;
  }

  // 3. TWO FINGERS / VICTORY (Index, Middle open, others closed)
  if (indexOpen && middleOpen && !ringOpen && !pinkyOpen) {
    return GestureType.TWO_FINGERS;
  }

  // 4. PUNCH / FIST (All fingers curled towards palm center)
  const palmCenter = landmarks[9];
  const tips = [indexTip, middleTip, ringTip, pinkyTip];
  const allClosed = tips.every(tip => getDistance(tip, palmCenter) < 0.12);
  if (allClosed) {
    return GestureType.PUNCH;
  }

  // 5. OPEN (At least 4 fingers extended)
  const extendedCount = [indexOpen, middleOpen, ringOpen, pinkyOpen].filter(Boolean).length;
  if (extendedCount >= 4) {
    return GestureType.OPEN;
  }

  return GestureType.NONE;
};
