#version 300 es
precision highp float;

uniform sampler2D tDiffuse;
uniform vec2 uCotainRatio;

in vec2 vUv;
out vec4 fragColor;

void main() {
  vec2 uv = (vUv - 0.5) * uCotainRatio + 0.5;
  vec4 sim = texture(tDiffuse, uv);
  float gray = 1.0 - smoothstep(0.3, 0.7, sim.r);
  // gray *= sim.a;
  gray *= 0.9;

  fragColor = vec4(vec3(gray), 1.0);
}