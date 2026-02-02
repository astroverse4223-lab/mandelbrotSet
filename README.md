# 🌌 Mandelbrot Set - Deep Zoom Explorer

A high-end, GPU-accelerated Mandelbrot Set visualization with infinite zoom, cinematic UI, and smooth animations. Built with React, Three.js, and WebGL shaders.

![Mandelbrot Set Explorer](https://img.shields.io/badge/WebGL-Accelerated-purple?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge)

## ✨ Features

### 🎨 Visual Experience
- **GPU-Accelerated Rendering** - Fragment shaders for high-performance fractal computation
- **Deep Zoom** - Infinite-feeling zoom with dynamic precision handling
- **Smooth Color Gradients** - Continuous coloring with normalized iteration count (no banding)
- **4 Premium Color Palettes** - Nebula, Plasma, Inferno, and Arctic themes
- **Cinematic UI** - Dark, futuristic glassmorphism design with subtle bloom effects
- **Smooth Animations** - Framer Motion powered UI transitions

### 🎮 Interactions
- **Cursor-Centered Zoom** - Scroll wheel zooms toward your mouse position
- **Smooth Pan** - Click and drag with inertial movement
- **Touch Support** - Pinch-to-zoom and touch-pan for mobile devices
- **Auto-Zoom Mode** - Cinematic automatic zoom with adjustable speed
- **60 FPS Performance** - Optimized rendering pipeline

### 🧮 Mathematical Features
- **Mandelbrot Set** - Classic fractal with escape-time algorithm
- **Julia Set** - Toggle to Julia mode with adjustable constants
- **Dynamic Iterations** - Automatically scales based on zoom depth (up to 2000 iterations)
- **High-Precision Math** - Double-precision emulation for extreme zoom levels

### 🛠️ Advanced Controls
- **Iteration Control** - Adjust quality vs performance
- **Color Palette Selector** - 4 stunning color schemes
- **Fractal Type Toggle** - Switch between Mandelbrot and Julia sets
- **Julia Constant Sliders** - Fine-tune Julia set parameters
- **Reset & Share** - Quick reset and shareable URL parameters
- **Screenshot Export** - Save your favorite views
- **Fullscreen Mode** - Immersive viewing experience

### 📊 Real-time HUD
- Live coordinates display (Real & Imaginary parts)
- Zoom depth indicator
- Current iteration count
- FPS counter
- Depth level indicator (Surface → Quantum)

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open automatically at `http://localhost:3000`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

## 🎯 Usage Guide

### Basic Controls

| Action | Control |
|--------|---------|
| **Zoom In/Out** | Mouse wheel or pinch |
| **Pan View** | Click and drag |
| **Mobile Pan** | Touch and drag |
| **Mobile Zoom** | Pinch gesture |
| **Reset View** | Click "Reset" button |
| **Fullscreen** | Click "Fullscreen" button |

### Advanced Features

**Auto-Zoom Mode**
1. Click "Start Auto-Zoom" in the control panel
2. Adjust speed with the slider (1-10)
3. Watch as the fractal automatically zooms into interesting regions

**Julia Set Exploration**
1. Click "Julia" in the Fractal Type section
2. Use the Real and Imaginary sliders to adjust the Julia constant
3. Discover unique fractal patterns

**Sharing Views**
1. Navigate to an interesting location
2. Click "Share" to copy the URL
3. Share the URL - it contains your exact view parameters

**Screenshot Export**
- Click "Save" to download the current view as a PNG image

## 🏗️ Architecture

### Tech Stack

- **React 18** - Component framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Three.js** - WebGL rendering
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth UI animations
- **Lucide React** - Beautiful icons

### Project Structure

```
mandelbrotset/
├── src/
│   ├── components/
│   │   ├── MandelbrotRenderer.tsx  # Main WebGL renderer
│   │   ├── ControlPanel.tsx        # UI controls
│   │   └── HUD.tsx                 # Heads-up display
│   ├── hooks/
│   │   └── useUrlState.ts          # URL state management
│   ├── shaders/
│   │   ├── mandelbrot.vert         # Vertex shader
│   │   └── mandelbrot.frag         # Fragment shader (main logic)
│   ├── types.ts                    # TypeScript definitions
│   ├── App.tsx                     # Root component
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### Key Components

**MandelbrotRenderer**
- Manages Three.js scene, camera, and renderer
- Handles all user interactions (zoom, pan, touch)
- Provides smooth camera transitions with easing
- Updates shader uniforms in real-time

**Shader System**
- `mandelbrot.vert` - Simple vertex shader (passthrough)
- `mandelbrot.frag` - Complex fragment shader containing:
  - Mandelbrot/Julia escape-time algorithm
  - Continuous coloring (smooth gradients)
  - 4 procedural color palettes
  - Vignette and glow effects
  - Precision helpers for deep zoom

**ControlPanel**
- Glassmorphism design with backdrop blur
- Collapsible sidebar
- Real-time control updates
- Animated state transitions

**HUD**
- Non-intrusive overlay
- Real-time coordinate display
- Performance metrics
- Keyboard shortcut hints

## 🎨 Customization

### Adding New Color Palettes

Edit [src/types.ts](src/types.ts):

```typescript
export const COLOR_PALETTES: ColorPaletteOption[] = [
  // ... existing palettes
  {
    name: 'custom',
    displayName: 'Custom Name',
    index: 4,
    preview: ['#color1', '#color2', '#color3']
  }
];
```

Then add the palette logic in [src/shaders/mandelbrot.frag](src/shaders/mandelbrot.frag):

```glsl
vec3 palette(float t, int paletteType) {
  // ... existing palettes
  if (paletteType == 4) {
    // Your custom palette math
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.0, 0.33, 0.67);
    return a + b * cos(6.28318 * (c * t + d));
  }
}
```

### Adjusting Performance

In [src/App.tsx](src/App.tsx), modify default iterations:

```typescript
const DEFAULT_STATE: FractalState = {
  maxIterations: 150,  // Lower = faster, Higher = more detail
  // ...
};
```

### Changing Initial View

```typescript
const DEFAULT_STATE: FractalState = {
  center: { x: -0.5, y: 0.0 },  // Complex plane coordinates
  zoom: 1.0,                     // Initial zoom level
  // ...
};
```

## 🧠 How It Works

### The Mandelbrot Set

The Mandelbrot set is defined by the iterative equation:

$$z_{n+1} = z_n^2 + c$$

Where:
- $z_0 = 0$
- $c$ is a complex number (pixel coordinate)
- Points that don't escape to infinity are in the set (colored black)
- Points that escape are colored based on iteration count

### Continuous Coloring

To avoid color banding, we use normalized iteration count:

$$\mu = n + 1 - \frac{\log(\log|z_n|)}{\log(2)}$$

This provides smooth, continuous color gradients even at high zoom levels.

### GPU Acceleration

The fragment shader runs in parallel for every pixel, computing thousands of iterations per frame at 60 FPS. This is thousands of times faster than CPU-based rendering.

### Precision Handling

At extreme zoom levels (>10^15), single precision floats lose accuracy. The shader uses:
- Double-precision emulation techniques
- Number splitting (high/low parts)
- Careful accumulation to minimize error

## 🎓 Educational Resources

- [Mandelbrot Set - Wikipedia](https://en.wikipedia.org/wiki/Mandelbrot_set)
- [Julia Set - Wikipedia](https://en.wikipedia.org/wiki/Julia_set)
- [Continuous Coloring](https://en.wikipedia.org/wiki/Plotting_algorithms_for_the_Mandelbrot_set#Continuous_(smooth)_coloring)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [Three.js Documentation](https://threejs.org/docs/)

## 🐛 Troubleshooting

**Low FPS / Performance Issues**
- Reduce max iterations in the control panel
- Disable auto-zoom mode
- Close other GPU-intensive applications
- Try a different browser (Chrome/Edge recommended)

**Blank Screen**
- Check browser console for errors
- Ensure WebGL is supported: visit [https://get.webgl.org/](https://get.webgl.org/)
- Update your graphics drivers

**Mobile Not Working**
- Ensure touch events are supported
- Try landscape orientation for better UI experience
- Some older mobile devices may have limited WebGL support

## 📝 License

MIT License - Feel free to use this project for learning, portfolios, or commercial applications.

## 🙏 Acknowledgments

- Inspired by the mathematical beauty of Benoit Mandelbrot's discoveries
- Color palette algorithms based on Inigo Quilez's work
- Built with modern web technologies for maximum performance

## 🚀 Future Enhancements

Potential features for future versions:
- [ ] Orbit trap coloring algorithms
- [ ] Buddhabrot rendering mode
- [ ] Distance estimation for 3D relief shading
- [ ] Animation recording (GIF/MP4 export)
- [ ] Perturbation theory for deeper zooms (10^100+)
- [ ] Custom color palette editor
- [ ] Location bookmarks
- [ ] Multi-fractal support (Burning Ship, etc.)

---

**Built with ❤️ using React, Three.js, and WebGL**

*Explore the infinite complexity of the Mandelbrot Set*
