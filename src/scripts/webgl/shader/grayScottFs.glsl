#version 300 es
precision highp float;

uniform sampler2D tDiffuse;
uniform sampler2D tFill;
uniform sampler2D tStart;
uniform vec2 uMouse;
uniform int uLeftClick;
uniform vec2 uCotainRatio;
uniform float uRandom;
uniform float uDu;
uniform float uDv;
uniform float uF;
uniform float uK;
uniform float uDt;
uniform float uDx;
uniform vec2 uPx;

in vec2 vUv;
out vec4 fragColor;

float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

void main() {
  vec2 centeredUv = vUv * 2.0 - 1.0;

  float noise = rand(vUv + uRandom) * 2.0 - 1.0;
  noise = noise * (1.0 - 0.82) + 0.82;

  vec2 leftUv   = texture(tDiffuse, vUv - vec2(uPx.x, 0.0)).xy;
  vec2 rightUv  = texture(tDiffuse, vUv + vec2(uPx.x, 0.0)).xy;
  vec2 topUv    = texture(tDiffuse, vUv - vec2(0.0, uPx.y)).xy;
  vec2 bottomUv = texture(tDiffuse, vUv + vec2(0.0, uPx.y)).xy;
  vec2 centerUv = texture(tDiffuse, vUv).xy;

  vec2 laplacian = (leftUv + rightUv + topUv + bottomUv - 4.0 * centerUv) / (uDx * uDx);

  float u = centerUv.x;
  float v = centerUv.y;
  float f = uF * noise;
  float k = uK;

  float dudt = uDu * laplacian.x - u * v * v + f * (1.0 - u);
  float dvdt = uDv * laplacian.y + u * v * v - (f + k) * v;

  u += uDt * dudt;
  v += uDt * dvdt;

  // mouse constraints  
  float dist = distance(uMouse * uCotainRatio, centeredUv);
  dist = smoothstep(0.02, 0.03, dist);
  if (dist < 1.0) { v = 0.5; }

  // start position
  vec2 uv = vUv;
  uv.y = 1.0 - uv.y;

  vec4 start = texture(tStart, uv);
  if (0.5 < start.r) {
    v += start.r;
    v = min(v, 0.3);
  }

  // logo bounding
  vec4 fill = texture(tFill, uv);

  // left click bounding expand
  float d = texture(tDiffuse, vUv).z;
  d += (1.0 - dist) * float(uLeftClick);
  d = min(d, 1.0);
  v *= min(fill.r + d, 1.0);

  // texture bounding
  float bounding = 1.0;
  if      (vUv.x < 0.01) { bounding = 0.0; }
  else if (0.99 < vUv.x) { bounding = 0.0; }
  else if (vUv.y < 0.01) { bounding = 0.0; }
  else if (0.99 < vUv.y) { bounding = 0.0; }
  v *= bounding;

  fragColor = vec4(u, v, d, dist);
}