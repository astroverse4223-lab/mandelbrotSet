import React from 'react';
import { motion } from 'framer-motion';
import type { FractalState } from '../types';

interface HUDProps {
  state: FractalState;
  fps?: number;
}

export const HUD: React.FC<HUDProps> = ({ state, fps = 60 }) => {
  const formatNumber = (num: number, decimals: number = 2): string => {
    if (Math.abs(num) < 0.000001) {
      return num.toExponential(decimals);
    }
    return num.toFixed(decimals);
  };

  const formatZoom = (zoom: number): string => {
    if (zoom < 1000) {
      return `${zoom.toFixed(1)}x`;
    } else if (zoom < 1000000) {
      return `${(zoom / 1000).toFixed(1)}K`;
    } else if (zoom < 1000000000) {
      return `${(zoom / 1000000).toFixed(1)}M`;
    } else {
      return `${(zoom / 1000000000).toFixed(1)}B`;
    }
  };

  const getDepthLevel = (zoom: number): string => {
    if (zoom < 10) return 'Surface';
    if (zoom < 100) return 'Shallow';
    if (zoom < 1000) return 'Deep';
    if (zoom < 10000) return 'Very Deep';
    if (zoom < 100000) return 'Extreme';
    if (zoom < 1000000) return 'Quantum';
    return 'Ultra-Deep';
  };

  const isDoublePrecision = state.zoom > 1000000;

  return (
    <>
      {/* Top Left - Title & Status */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-6 left-6 z-10 pointer-events-none"
      >
        <div className="glass rounded-2xl px-6 py-4 space-y-2">
          <h1 className="text-2xl font-display font-bold glow-text">
            {state.isJulia ? 'Julia Set' : 'Mandelbrot Set'}
          </h1>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow"></span>
              {fps} FPS
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-purple-300 font-medium">
              {getDepthLevel(state.zoom)}
            </span>
            {isDoublePrecision && (
              <>
                <span className="text-gray-500">•</span>
                <span className="flex items-center gap-1 text-cyan-400 font-medium text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  2x Precision
                </span>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Top Right - Coordinates & Zoom */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="fixed top-6 right-6 z-10 pointer-events-none"
      >
        <div className="glass rounded-2xl px-6 py-4 space-y-2 font-mono text-sm">
          <div className="flex justify-between gap-8">
            <span className="text-gray-400">Real:</span>
            <span className="text-cyan-300 font-medium">
              {formatNumber(state.center.x, 8)}
            </span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-gray-400">Imag:</span>
            <span className="text-cyan-300 font-medium">
              {formatNumber(state.center.y, 8)}
            </span>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
          <div className="flex justify-between gap-8">
            <span className="text-gray-400">Zoom:</span>
            <span className="text-purple-300 font-bold text-base">
              {formatZoom(state.zoom)}
            </span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-gray-400">Iter:</span>
            <span className="text-orange-300 font-medium">
              {state.maxIterations}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Bottom Center - Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
      >
        <div className="glass-light rounded-full px-6 py-3">
          <div className="flex items-center gap-6 text-xs text-gray-300">
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono">
                Scroll
              </kbd>
              Zoom
            </span>
            <span className="text-gray-600">•</span>
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono">
                Drag
              </kbd>
              Pan
            </span>
            <span className="text-gray-600">•</span>
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono">
                Pinch
              </kbd>
              Mobile
            </span>
          </div>
        </div>
      </motion.div>

      {/* Auto-zoom indicator */}
      {state.autoZoom && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
        >
          <div className="glass rounded-2xl px-8 py-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse-glow"></div>
            <span className="text-purple-200 font-medium">
              Auto-Zoom Active
            </span>
          </div>
        </motion.div>
      )}
    </>
  );
};
