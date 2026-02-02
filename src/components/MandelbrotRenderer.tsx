import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import vertexShader from '../shaders/mandelbrot.vert?raw';
import fragmentShader from '../shaders/mandelbrot.frag?raw';
import type { FractalState, InteractionState } from '../types';

interface MandelbrotRendererProps {
  state: FractalState;
  onStateChange: (updates: Partial<FractalState>) => void;
  onInteractionChange?: (interaction: Partial<InteractionState>) => void;
}

export const MandelbrotRenderer: React.FC<MandelbrotRendererProps> = ({
  state,
  onStateChange,
  onInteractionChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const animationFrameRef = useRef<number>(0);
  
  // Interaction state
  const interactionRef = useRef<InteractionState>({
    isDragging: false,
    lastMousePos: null,
    velocity: { x: 0, y: 0 },
    isPinching: false,
    lastPinchDistance: null
  });

  // View state with smooth transitions
  const viewRef = useRef({
    center: { ...state.center },
    zoom: state.zoom,
    targetCenter: { ...state.center },
    targetZoom: state.zoom
  });

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    // Renderer setup with high quality settings
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create shader material
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_center: { value: new THREE.Vector2(state.center.x, state.center.y) },
        u_centerDP: { value: new THREE.Vector4(state.center.x, 0, state.center.y, 0) },
        u_zoom: { value: state.zoom },
        u_useDP: { value: false },
        u_maxIterations: { value: state.maxIterations },
        u_colorPalette: { value: state.colorPalette },
        u_isJulia: { value: state.isJulia },
        u_juliaC: { value: new THREE.Vector2(state.juliaC.x, state.juliaC.y) },
        u_resolution: { value: new THREE.Vector2(width, height) },
        u_time: { value: 0 }
      }
    });
    materialRef.current = material;

    // Create fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation loop
    let lastTime = 0;
    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      // Update time uniform for color animation
      if (material.uniforms.u_time) {
        material.uniforms.u_time.value = time * 0.001;
      }

      // Smooth zoom/pan transitions with easing
      const lerpFactor = Math.min(deltaTime * 0.005, 1);
      const view = viewRef.current;

      view.center.x += (view.targetCenter.x - view.center.x) * lerpFactor;
      view.center.y += (view.targetCenter.y - view.center.y) * lerpFactor;
      view.zoom += (view.targetZoom - view.zoom) * lerpFactor;

      // Apply inertial velocity (for smooth drag release)
      const interaction = interactionRef.current;
      if (!interaction.isDragging && (Math.abs(interaction.velocity.x) > 0.01 || Math.abs(interaction.velocity.y) > 0.01)) {
        const aspect = width / height;
        view.targetCenter.x += interaction.velocity.x / view.zoom * aspect * 0.002;
        view.targetCenter.y -= interaction.velocity.y / view.zoom * 0.002;
        
        // Strong damping for quick stop
        interaction.velocity.x *= 0.85;
        interaction.velocity.y *= 0.85;
      } else if (!interaction.isDragging) {
        // Reset velocity when it gets too small
        interaction.velocity.x = 0;
        interaction.velocity.y = 0;
      }

      // Update shader uniforms
      material.uniforms.u_center.value.set(view.center.x, view.center.y);
      material.uniforms.u_zoom.value = view.zoom;
      
      // Enable double precision for extreme zoom (> 1 million)
      const useDP = view.zoom > 1000000;
      material.uniforms.u_useDP.value = useDP;
      
      if (useDP) {
        // Split coordinates into high and low parts for double precision
        // This gives us ~15 decimal digits instead of 7
        material.uniforms.u_centerDP.value.set(
          view.center.x,  // high part x
          0,              // low part x (for now, could be improved)
          view.center.y,  // high part y
          0               // low part y
        );
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      renderer.setSize(newWidth, newHeight);
      material.uniforms.u_resolution.value.set(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Update shader uniforms when state changes
  useEffect(() => {
    if (!materialRef.current) return;

    const material = materialRef.current;
    material.uniforms.u_maxIterations.value = state.maxIterations;
    material.uniforms.u_colorPalette.value = state.colorPalette;
    material.uniforms.u_isJulia.value = state.isJulia;
    material.uniforms.u_juliaC.value.set(state.juliaC.x, state.juliaC.y);

    viewRef.current.targetCenter = { ...state.center };
    viewRef.current.targetZoom = state.zoom;
  }, [state]);

  // Auto-zoom animation
  useEffect(() => {
    if (!state.autoZoom) return;

    const interval = setInterval(() => {
      const view = viewRef.current;
      const newZoom = view.targetZoom * (1 + state.animationSpeed * 0.01);
      
      // Dynamically adjust iterations based on zoom depth
      const iterationsNeeded = Math.min(
        2000,
        Math.max(100, Math.floor(100 + Math.log10(newZoom) * 50))
      );

      onStateChange({
        zoom: newZoom,
        maxIterations: iterationsNeeded
      });
    }, 50);

    return () => clearInterval(interval);
  }, [state.autoZoom, state.animationSpeed, onStateChange]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Get mouse position in normalized coordinates
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = -((e.clientY - rect.top) / rect.height - 0.5);
    const aspect = rect.width / rect.height;

    const view = viewRef.current;
    
    // Zoom factor
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = view.targetZoom * zoomFactor;

    // Calculate the point in the complex plane where mouse is pointing
    const worldX = view.targetCenter.x + (mouseX * aspect) / view.targetZoom;
    const worldY = view.targetCenter.y + mouseY / view.targetZoom;

    // Adjust center to keep the mouse point fixed
    const newCenter = {
      x: worldX - (mouseX * aspect) / newZoom,
      y: worldY - mouseY / newZoom
    };

    // Dynamically adjust iterations based on zoom
    const iterationsNeeded = Math.min(
      2000,
      Math.max(100, Math.floor(100 + Math.log10(newZoom) * 50))
    );

    onStateChange({
      center: newCenter,
      zoom: newZoom,
      maxIterations: iterationsNeeded
    });
  };

  // Mouse drag pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click

    const interaction = interactionRef.current;
    interaction.isDragging = true;
    interaction.lastMousePos = { x: e.clientX, y: e.clientY };
    interaction.velocity = { x: 0, y: 0 };
    
    onInteractionChange?.({ isDragging: true });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const interaction = interactionRef.current;
    if (!interaction.isDragging || !interaction.lastMousePos) return;

    const deltaX = e.clientX - interaction.lastMousePos.x;
    const deltaY = e.clientY - interaction.lastMousePos.y;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const aspect = rect.width / rect.height;
    const view = viewRef.current;

    // Update velocity for inertia
    interaction.velocity.x = deltaX;
    interaction.velocity.y = deltaY;

    // Update target center
    view.targetCenter.x -= (deltaX / rect.width) * aspect / view.targetZoom;
    view.targetCenter.y += (deltaY / rect.height) / view.targetZoom;

    interaction.lastMousePos = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    const interaction = interactionRef.current;
    interaction.isDragging = false;
    interaction.lastMousePos = null;
    
    onInteractionChange?.({ isDragging: false });
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - pan
      const touch = e.touches[0];
      const interaction = interactionRef.current;
      interaction.isDragging = true;
      interaction.lastMousePos = { x: touch.clientX, y: touch.clientY };
      interaction.velocity = { x: 0, y: 0 };
    } else if (e.touches.length === 2) {
      // Two touches - pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const interaction = interactionRef.current;
      interaction.isPinching = true;
      interaction.lastPinchDistance = distance;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const interaction = interactionRef.current;

    if (e.touches.length === 1 && interaction.isDragging && interaction.lastMousePos) {
      // Pan
      const touch = e.touches[0];
      const deltaX = touch.clientX - interaction.lastMousePos.x;
      const deltaY = touch.clientY - interaction.lastMousePos.y;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const aspect = rect.width / rect.height;
      const view = viewRef.current;

      view.targetCenter.x -= (deltaX / rect.width) * aspect / view.targetZoom;
      view.targetCenter.y += (deltaY / rect.height) / view.targetZoom;

      interaction.lastMousePos = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2 && interaction.isPinching && interaction.lastPinchDistance) {
      // Pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      const scale = distance / interaction.lastPinchDistance;
      const view = viewRef.current;
      const newZoom = view.targetZoom * scale;

      onStateChange({ zoom: newZoom });
      interaction.lastPinchDistance = distance;
    }
  };

  const handleTouchEnd = () => {
    const interaction = interactionRef.current;
    interaction.isDragging = false;
    interaction.isPinching = false;
    interaction.lastMousePos = null;
    interaction.lastPinchDistance = null;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 cursor-grab active:cursor-grabbing touch-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    />
  );
};
