
export enum GestureType {
  NONE = 'NONE',
  PUNCH = 'PUNCH',       // Fist Hold (Drag)
  OPEN = 'OPEN',        // Full Open Hand (Rotate)
  PINCH = 'PINCH',      // Pinch (Zoom)
  TWO_FINGERS = '2_FINGERS', // Victory Sign (H-Spin)
  THREE_FINGERS = '3_FINGERS' // 3 Fingers Up (V-Spin)
}

export type HolographicColor = 'blue' | 'green' | 'red' | 'purple' | 'white';

export interface AppState {
  gesture: GestureType;
  isControlsVisible: boolean;
  isHolographic: boolean;
  holographicColor: HolographicColor;
  opacity: number;
  addDepth: boolean;
  assetUrl: string | null;
  assetType: 'image' | 'model' | null;
}
