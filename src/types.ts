// TypeScript type definitions

export interface FractalState {
  center: { x: number; y: number };
  zoom: number;
  maxIterations: number;
  colorPalette: number;
  isJulia: boolean;
  juliaC: { x: number; y: number };
  autoZoom: boolean;
  animationSpeed: number;
}

export interface ViewState {
  center: { x: number; y: number };
  zoom: number;
  targetCenter?: { x: number; y: number };
  targetZoom?: number;
}

export interface InteractionState {
  isDragging: boolean;
  lastMousePos: { x: number; y: number } | null;
  velocity: { x: number; y: number };
  isPinching: boolean;
  lastPinchDistance: number | null;
}

export type ColorPalette = 'nebula' | 'plasma' | 'inferno' | 'arctic';

export interface ColorPaletteOption {
  name: ColorPalette;
  displayName: string;
  index: number;
  preview: string[];
}

export const COLOR_PALETTES: ColorPaletteOption[] = [
  {
    name: 'nebula',
    displayName: 'Nebula',
    index: 0,
    preview: ['#8b5cf6', '#ec4899', '#f59e0b']
  },
  {
    name: 'plasma',
    displayName: 'Plasma',
    index: 1,
    preview: ['#3b82f6', '#06b6d4', '#a855f7']
  },
  {
    name: 'inferno',
    displayName: 'Inferno',
    index: 2,
    preview: ['#dc2626', '#f59e0b', '#fbbf24']
  },
  {
    name: 'arctic',
    displayName: 'Arctic',
    index: 3,
    preview: ['#06b6d4', '#60a5fa', '#e0f2fe']
  }
];
