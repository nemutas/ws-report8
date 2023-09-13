import { webgl } from '../WebGL'
import { Texture } from './Texture'

export type Precision = 'f32' | 'f16'

export class DataTexture extends Texture {
  private internalformat: number
  private type: number

  constructor(precision: Precision = 'f32') {
    super()

    const gl = webgl.gl
    this.internalformat = precision === 'f32' ? gl.RGBA32F : gl.RGBA16F
    this.type = precision === 'f32' ? gl.FLOAT : gl.HALF_FLOAT
  }

  createRenderTargetTexture(width: number, height: number) {
    this.dispose()

    const gl = webgl.gl
    this.setSize(width, height)

    const texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, this.internalformat, width, height, 0, gl.RGBA, this.type, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    this._texture = texture
    return this
  }

  create() {
    return this
  }
}
