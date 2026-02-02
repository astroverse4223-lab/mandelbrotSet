import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Maximize, Share2, RotateCcw } from 'lucide-react';
import type { FractalState } from '../types';
import { COLOR_PALETTES } from '../types';

interface ControlPanelProps {
  state: FractalState;
  onStateChange: (updates: Partial<FractalState>) => void;
  onReset: () => void;
  onFullscreen: () => void;
  onScreenshot: () => void;
  onShare: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  state,
  onStateChange,
  onReset,
  onFullscreen,
  onScreenshot,
  onShare
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-20">
      {/* Collapse/Expand Button - Always visible */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-12 top-1/2 -translate-y-1/2 glass-light rounded-l-2xl p-3 hover:bg-white/10 transition-colors"
        aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
      >
        {isCollapsed ? (
          <ChevronLeft className="w-5 h-5 text-gray-300" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-300" />
        )}
      </motion.button>

      {/* Main Control Panel */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 20 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-2xl p-6 w-80 space-y-6 backdrop-blur-xl"
          >
            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-display font-semibold text-gray-300 mb-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onReset}
                  className="glass-light rounded-lg px-4 py-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm">Reset</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onFullscreen}
                  className="glass-light rounded-lg px-4 py-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                >
                  <Maximize className="w-4 h-4" />
                  <span className="text-sm">Fullscreen</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onScreenshot}
                  className="glass-light rounded-lg px-4 py-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Save</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onShare}
                  className="glass-light rounded-lg px-4 py-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Share</span>
                </motion.button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>

            {/* Fractal Type Toggle */}
            <div>
              <h3 className="text-sm font-display font-semibold text-gray-300 mb-3">
                Fractal Type
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStateChange({ isJulia: false })}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    !state.isJulia
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white glow'
                      : 'glass-light hover:bg-white/10 text-gray-300'
                  }`}
                >
                  Mandelbrot
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStateChange({ isJulia: true })}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    state.isJulia
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white glow'
                      : 'glass-light hover:bg-white/10 text-gray-300'
                  }`}
                >
                  Julia
                </motion.button>
              </div>
            </div>

            {/* Julia Constant (shown only when Julia is active) */}
            <AnimatePresence>
              {state.isJulia && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h3 className="text-sm font-display font-semibold text-gray-300 mb-3">
                    Julia Constant
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">
                        Real: {state.juliaC.x.toFixed(3)}
                      </label>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.01"
                        value={state.juliaC.x}
                        onChange={(e) =>
                          onStateChange({
                            juliaC: { ...state.juliaC, x: parseFloat(e.target.value) }
                          })
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">
                        Imaginary: {state.juliaC.y.toFixed(3)}
                      </label>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.01"
                        value={state.juliaC.y}
                        onChange={(e) =>
                          onStateChange({
                            juliaC: { ...state.juliaC, y: parseFloat(e.target.value) }
                          })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Iterations Slider */}
            <div>
              <h3 className="text-sm font-display font-semibold text-gray-300 mb-3">
                Iterations
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Quality</span>
                  <span className="text-orange-300 font-medium">
                    {state.maxIterations}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="50"
                  value={state.maxIterations}
                  onChange={(e) =>
                    onStateChange({ maxIterations: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Fast</span>
                  <span>Detailed</span>
                </div>
              </div>
            </div>

            {/* Color Palette Selector */}
            <div>
              <h3 className="text-sm font-display font-semibold text-gray-300 mb-3">
                Color Palette
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_PALETTES.map((palette) => (
                  <motion.button
                    key={palette.name}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onStateChange({ colorPalette: palette.index })}
                    className={`rounded-lg p-3 transition-all ${
                      state.colorPalette === palette.index
                        ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-black'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${palette.preview[0]}, ${palette.preview[1]}, ${palette.preview[2]})`
                    }}
                  >
                    <span className="text-xs font-medium text-white drop-shadow-lg">
                      {palette.displayName}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Auto-Zoom Controls */}
            <div>
              <h3 className="text-sm font-display font-semibold text-gray-300 mb-3">
                Auto-Zoom
              </h3>
              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStateChange({ autoZoom: !state.autoZoom })}
                  className={`w-full rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    state.autoZoom
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white glow'
                      : 'glass-light hover:bg-white/10 text-gray-300'
                  }`}
                >
                  {state.autoZoom ? 'Stop Auto-Zoom' : 'Start Auto-Zoom'}
                </motion.button>
                
                {state.autoZoom && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="text-xs text-gray-400 mb-1 block">
                      Speed: {state.animationSpeed}%
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={state.animationSpeed}
                      onChange={(e) =>
                        onStateChange({ animationSpeed: parseInt(e.target.value) })
                      }
                      className="w-full"
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
