import { useEffect, useState } from 'react';
import type { FractalState } from '../types';

// Hook to sync fractal state with URL parameters for shareable views
export function useUrlState(state: FractalState, setState: (state: Partial<FractalState>) => void) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Load state from URL on mount
  useEffect(() => {
    if (isInitialized) return;

    const params = new URLSearchParams(window.location.search);
    const updates: Partial<FractalState> = {};

    const cx = params.get('cx');
    const cy = params.get('cy');
    const zoom = params.get('z');
    const iter = params.get('i');
    const palette = params.get('p');
    const julia = params.get('j');
    const jx = params.get('jx');
    const jy = params.get('jy');

    if (cx !== null && cy !== null) {
      updates.center = { x: parseFloat(cx), y: parseFloat(cy) };
    }
    if (zoom !== null) {
      updates.zoom = parseFloat(zoom);
    }
    if (iter !== null) {
      updates.maxIterations = parseInt(iter, 10);
    }
    if (palette !== null) {
      updates.colorPalette = parseInt(palette, 10);
    }
    if (julia !== null) {
      updates.isJulia = julia === '1';
    }
    if (jx !== null && jy !== null) {
      updates.juliaC = { x: parseFloat(jx), y: parseFloat(jy) };
    }

    if (Object.keys(updates).length > 0) {
      setState(updates);
    }

    setIsInitialized(true);
  }, [isInitialized, setState]);

  // Update URL when state changes
  useEffect(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams();
    params.set('cx', state.center.x.toFixed(10));
    params.set('cy', state.center.y.toFixed(10));
    params.set('z', state.zoom.toFixed(6));
    params.set('i', state.maxIterations.toString());
    params.set('p', state.colorPalette.toString());
    
    if (state.isJulia) {
      params.set('j', '1');
      params.set('jx', state.juliaC.x.toFixed(10));
      params.set('jy', state.juliaC.y.toFixed(10));
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [state, isInitialized]);

  return isInitialized;
}
