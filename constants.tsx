
import { HolographicColor, GestureType } from './types';

export const HOLOGRAPHIC_COLORS: Record<HolographicColor, string> = {
  blue: '#00ffff',
  green: '#00ff88',
  red: '#ff4444',
  purple: '#bb00ff',
  white: '#ffffff'
};

export const GESTURE_DESCRIPTIONS: Record<GestureType, string> = {
  PUNCH: 'Fist Hold - DRAG & REPOSITION',
  OPEN: 'Full Open Hand - MANUAL ROTATE',
  PINCH: 'Pinch - PRECISE ZOOM',
  '2_FINGERS': 'Victory Sign - HORIZONTAL SPIN',
  '3_FINGERS': '3 Fingers Up - VERTICAL SPIN',
  NONE: 'Ready - AWAITING COMMAND'
};
