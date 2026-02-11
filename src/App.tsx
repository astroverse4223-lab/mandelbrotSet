import { useState, useCallback } from 'react';
import { MandelbrotRenderer } from './components/MandelbrotRenderer';
import { ControlPanel } from './components/ControlPanel';
import { HUD } from './components/HUD';
import { useUrlState } from './hooks/useUrlState';
import type { FractalState } from './types';

// Default state with stunning initial view
const DEFAULT_STATE: FractalState = {
  center: { x: -0.5, y: 0.0 },
  zoom: 1.0,
  maxIterations: 150,
  colorPalette: 0, // Nebula
  isJulia: false,
  juliaC: { x: -0.7, y: 0.27015 },
  autoZoom: false,
  animationSpeed: 3
};

function App() {
  const [state, setState] = useState<FractalState>(DEFAULT_STATE);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Sync state with URL parameters
  useUrlState(state, (updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  });

  // Update state handler
  const handleStateChange = useCallback((updates: Partial<FractalState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset to default view
  const handleReset = useCallback(() => {
    setState(DEFAULT_STATE);
    showNotificationMessage('Reset to default view');
  }, []);

  // Toggle fullscreen
  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      showNotificationMessage('Entered fullscreen');
    } else {
      document.exitFullscreen();
      showNotificationMessage('Exited fullscreen');
    }
  }, []);

  // Screenshot capture
  const handleScreenshot = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mandelbrot-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
      
      showNotificationMessage('Screenshot saved!');
    });
  }, []);

  // Share current view
  const handleShare = useCallback(() => {
    const url = window.location.href;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showNotificationMessage('URL copied to clipboard!');
      });
    } else {
      // Fallback for older browsers
      showNotificationMessage('Share URL: ' + url);
    }
  }, []);

  // Show temporary notification
  const showNotificationMessage = (message: string) => {
    setShowNotification(message);
    setTimeout(() => setShowNotification(null), 3000);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Mandelbrot Renderer */}
      <MandelbrotRenderer
        state={state}
        onStateChange={handleStateChange}
      />

      {/* HUD Overlay */}
      <HUD state={state} />

      {/* Control Panel */}
      <ControlPanel
        state={state}
        onStateChange={handleStateChange}
        onReset={handleReset}
        onFullscreen={handleFullscreen}
        onScreenshot={handleScreenshot}
        onShare={handleShare}
      />

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="glass rounded-full px-6 py-3 text-sm text-white font-medium">
            {showNotification}
          </div>
        </div>
      )}

      {/* Loading Indicator (optional) */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-0 pointer-events-none" />
    </div>
  );
}

export default App;
