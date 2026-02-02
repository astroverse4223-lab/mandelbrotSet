// Fragment Shader - Mandelbrot & Julia Set with High-Quality Color Smoothing
precision highp float;

varying vec2 vUv;

// Uniforms
uniform vec2 u_center;        // Center point in complex plane (for low zoom)
uniform vec4 u_centerDP;      // Double-precision center (hi_x, lo_x, hi_y, lo_y)
uniform float u_zoom;         // Zoom level (larger = more zoomed in)
uniform bool u_useDP;         // Use double precision when zoom > 1e6
uniform int u_maxIterations;  // Maximum iterations
uniform int u_colorPalette;   // Color palette selector (0-3)
uniform bool u_isJulia;       // Toggle between Mandelbrot and Julia
uniform vec2 u_juliaC;        // Julia set constant
uniform vec2 u_resolution;    // Screen resolution
uniform float u_time;         // Animation time

// Color palettes
vec3 palette(float t, int paletteType) {
  if (paletteType == 0) {
    // Nebula - Purple/Pink cosmic theme
    vec3 a = vec3(0.5, 0.3, 0.6);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 0.7, 0.4);
    vec3 d = vec3(0.0, 0.15, 0.20);
    return a + b * cos(6.28318 * (c * t + d));
  } else if (paletteType == 1) {
    // Plasma - Electric blue/cyan/magenta
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(2.0, 1.0, 0.0);
    vec3 d = vec3(0.5, 0.20, 0.25);
    return a + b * cos(6.28318 * (c * t + d));
  } else if (paletteType == 2) {
    // Inferno - Hot fire colors
    vec3 a = vec3(0.0, 0.0, 0.0);
    vec3 b = vec3(0.5, 0.4, 0.2);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.0, 0.1, 0.2);
    return a + b * cos(6.28318 * (c * t + d));
  } else {
    // Arctic - Cool blue/cyan/white
    vec3 a = vec3(0.2, 0.3, 0.5);
    vec3 b = vec3(0.4, 0.5, 0.6);
    vec3 c = vec3(1.0, 1.0, 0.5);
    vec3 d = vec3(0.0, 0.1, 0.2);
    return a + b * cos(6.28318 * (c * t + d));
  }
}

// Double-precision emulation helpers for deep zoom
// Represents a number as vec2(high, low) for extended precision
// Total precision: ~15 decimal digits (vs 7 for single float)

// Add two double-precision numbers
vec2 ds_add(vec2 a, vec2 b) {
  float s = a.x + b.x;
  float v = s - a.x;
  float e = (a.x - (s - v)) + (b.x - v) + a.y + b.y;
  return vec2(s, e);
}

// Add regular float to double-precision number
vec2 ds_add(vec2 a, float b) {
  float s = a.x + b;
  float v = s - a.x;
  float e = (a.x - (s - v)) + (b - v) + a.y;
  return vec2(s, e);
}

// Multiply two double-precision numbers
vec2 ds_mul(vec2 a, vec2 b) {
  float c = 134217729.0; // 2^27 + 1
  float ahi = c * a.x - (c * a.x - a.x);
  float alo = a.x - ahi;
  float bhi = c * b.x - (c * b.x - b.x);
  float blo = b.x - bhi;
  
  float p = a.x * b.x;
  float e = ((ahi * bhi - p) + ahi * blo + alo * bhi + alo * blo) + a.x * b.y + a.y * b.x;
  
  return vec2(p, e);
}

// Multiply double-precision by regular float
vec2 ds_mul(vec2 a, float b) {
  float c = 134217729.0;
  float ahi = c * a.x - (c * a.x - a.x);
  float alo = a.x - ahi;
  float bhi = c * b - (c * b - b);
  float blo = b - bhi;
  
  float p = a.x * b;
  float e = ((ahi * bhi - p) + ahi * blo + alo * bhi + alo * blo) + a.y * b;
  
  return vec2(p, e);
}

// Convert float to double-precision
vec2 ds_set(float a) {
  return vec2(a, 0.0);
}

// Complex number squared using double precision
void complexSquareDP(vec2 zx, vec2 zy, out vec2 outX, out vec2 outY) {
  // z^2 = (x^2 - y^2) + i(2xy)
  vec2 xx = ds_mul(zx, zx);
  vec2 yy = ds_mul(zy, zy);
  vec2 xy = ds_mul(zx, zy);
  
  outX = ds_add(xx, ds_mul(yy, -1.0));
  outY = ds_mul(xy, 2.0);
}

// Complex number squared (regular precision)
vec2 complexSquare(vec2 z) {
  float x = z.x;
  float y = z.y;
  return vec2(x * x - y * y, 2.0 * x * y);
}

// Mandelbrot/Julia escape time algorithm with continuous coloring
float mandelbrot(vec2 c, vec2 z0) {
  vec2 z = z0;
  float smoothValue = 0.0;
  
  for (int i = 0; i < 2000; i++) {
    if (i >= u_maxIterations) break;
    
    // z = z^2 + c
    z = complexSquare(z) + c;
    
    float zMagnitudeSquared = dot(z, z);
    
    // Escape condition
    if (zMagnitudeSquared > 256.0) {
      // Continuous/smooth coloring using normalized iteration count
      // This eliminates banding artifacts
      float logZn = log(zMagnitudeSquared) / 2.0;
      float nu = log(logZn / log(2.0)) / log(2.0);
      smoothValue = float(i) + 1.0 - nu;
      return smoothValue;
    }
  }
  
  return -1.0; // Point is in the set
}

// Double-precision Mandelbrot for extreme zoom
float mandelbrotDP(vec2 cx, vec2 cy, vec2 z0x, vec2 z0y) {
  vec2 zx = z0x;
  vec2 zy = z0y;
  float smoothValue = 0.0;
  
  for (int i = 0; i < 2000; i++) {
    if (i >= u_maxIterations) break;
    
    // z = z^2 + c (using double precision)
    vec2 newZx, newZy;
    complexSquareDP(zx, zy, newZx, newZy);
    zx = ds_add(newZx, cx);
    zy = ds_add(newZy, cy);
    
    // Magnitude check (convert to single precision for this)
    float zMagnitudeSquared = zx.x * zx.x + zy.x * zy.x;
    
    // Escape condition
    if (zMagnitudeSquared > 256.0) {
      float logZn = log(zMagnitudeSquared) / 2.0;
      float nu = log(logZn / log(2.0)) / log(2.0);
      smoothValue = float(i) + 1.0 - nu;
      return smoothValue;
    }
  }
  
  return -1.0; // Point is in the set
}

void main() {
  // Convert screen coordinates to complex plane
  vec2 uv = vUv - 0.5;
  uv.x *= u_resolution.x / u_resolution.y; // Aspect ratio correction
  
  float iter;
  
  // Use double precision for extreme zoom (> 1 million)
  if (u_useDP) {
    // Double-precision path for deep zoom
    vec2 offset = uv / u_zoom;
    
    // Split center into double precision components
    vec2 cx = u_centerDP.xy; // (hi_x, lo_x)
    vec2 cy = u_centerDP.zw; // (hi_y, lo_y)
    
    // Add offset to center
    cx = ds_add(cx, offset.x);
    cy = ds_add(cy, offset.y);
    
    // Choose between Mandelbrot and Julia set
    if (u_isJulia) {
      // Julia set with double precision
      iter = mandelbrotDP(ds_set(u_juliaC.x), ds_set(u_juliaC.y), cx, cy);
    } else {
      // Mandelbrot set: z0 = 0, c = pixel position
      iter = mandelbrotDP(cx, cy, ds_set(0.0), ds_set(0.0));
    }
  } else {
    // Regular single-precision path for normal zoom
    vec2 c = u_center + uv / u_zoom;
    
    // Choose between Mandelbrot and Julia set
    if (u_isJulia) {
      // Julia set: z0 = c (pixel position), c = constant
      iter = mandelbrot(u_juliaC, c);
    } else {
      // Mandelbrot set: z0 = 0, c = pixel position
      iter = mandelbrot(c, vec2(0.0, 0.0));
    }
  }
  
  vec3 color;
  
  if (iter < 0.0) {
    // Point is in the set - render as black with subtle glow
    color = vec3(0.0, 0.0, 0.05);
  } else {
    // Point escaped - apply smooth color gradient
    float t = iter / float(u_maxIterations);
    
    // Add some animation to the colors based on time
    t = fract(t + u_time * 0.02);
    
    // Get color from selected palette
    color = palette(t, u_colorPalette);
    
    // Add subtle bloom/glow effect near the set boundary
    float glow = 1.0 / (1.0 + iter * 0.1);
    color += vec3(glow * 0.2, glow * 0.15, glow * 0.3);
    
    // Enhance contrast
    color = pow(color, vec3(0.8));
  }
  
  // Subtle vignette effect for cinematic feel
  vec2 vignetteUV = vUv - 0.5;
  float vignette = 1.0 - dot(vignetteUV, vignetteUV) * 0.3;
  color *= vignette;
  
  gl_FragColor = vec4(color, 1.0);
}
