import { webgl } from './WebGL'
import { Texture } from './texture/Texture'

export class RenderTarget {
  private _framebuffer?: WebGLFramebuffer | null
  private _depthRenderbuffer?: WebGLRenderbuffer | null

  constructor(
    width: number,
    height: number,
    private _texture: Texture,
  ) {
    this.createFramebuffer(width, height)
  }

  createFramebuffer(width: number, height: number) {
    this.dispose()

    const gl = webgl.gl
    const framebuffer = gl.createFramebuffer()
    const depthRenderbuffer = gl.createRenderbuffer()

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    // depth buffer
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderbuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderbuffer)
    // texture
    this._texture.createRenderTargetTexture(width, height)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture.texture, 0)
    // unbind buffers
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    this._framebuffer = framebuffer
    this._depthRenderbuffer = depthRenderbuffer

    // console.log(webgl.gl.checkFramebufferStatus(gl.FRAMEBUFFER))
  }

  get framebuffer() {
    if (this._framebuffer) return this._framebuffer
    else throw new Error('RenderTarget: framebuffer is not defined.')
  }

  get texture() {
    if (this._texture) return this._texture
    else throw new Error('RenderTarget: texture is not defined.')
  }

  dispose() {
    const gl = webgl.gl

    this._framebuffer && gl.deleteFramebuffer(this._framebuffer)
    this._depthRenderbuffer && gl.deleteRenderbuffer(this._depthRenderbuffer)
    this._texture?.dispose()

    this._framebuffer = null
    this._depthRenderbuffer = null
  }
}
