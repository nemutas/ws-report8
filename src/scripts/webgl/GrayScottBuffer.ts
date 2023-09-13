import { mouse2d } from './Mouse2D'
import { QuadPass } from './core/QuadPass'
import { DataTexture } from './core/texture/DataTexture'
import fragmentShader from './shader/grayScottFs.glsl'

export class GrayScottBuffer extends QuadPass {
  constructor(resolutionRatio: [number, number]) {
    super({
      fragmentShader,
      resolutionRatio,
      texture: new DataTexture('f32'),
      uniforms: {
        tDiffuse: { type: 't', value: null },
        tFill: { type: 't', value: null },
        tStart: { type: 't', value: null },
        uMouse: { type: '2fv', value: null },
        uLeftClick: { type: '1i', value: 0 },
        uCotainRatio: { type: '2fv', value: null },
        uRandom: { type: '1f', value: Math.random() },
        uDu: { type: '1f', value: 2e-5 },
        uDv: { type: '1f', value: 1e-5 },
        uF: { type: '1f', value: 0.04 },
        uK: { type: '1f', value: 0.06 },
        uDt: { type: '1f', value: 1 },
        uDx: { type: '1f', value: 0.01 },
        uPx: { type: '2fv', value: null },
      },
      rectangle: true,
    })

    this.uniforms.uPx = [1 / this.size.width, 1 / this.size.height]
  }

  render() {
    this.uniforms.uMouse = mouse2d.posArray
    this.uniforms.uLeftClick = mouse2d.isLeftClick ? 1 : 0
    super.render()
  }

  dispose() {
    super.dispose()
  }
}
