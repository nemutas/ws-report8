import { QuadPass } from './core/QuadPass'
import { DataTexture } from './core/texture/DataTexture'
import fragmentShader from './shader/copyFs.glsl'

export class CopyBuffer extends QuadPass {
  constructor(resolutionRatio: [number, number]) {
    super({
      fragmentShader,
      resolutionRatio,
      texture: new DataTexture('f32'),
      uniforms: {
        tDiffuse: { type: 't', value: null },
      },
      rectangle: true,
    })
  }

  render() {
    super.render()
  }

  dispose() {
    super.dispose()
  }
}
