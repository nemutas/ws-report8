import { RenderTarget } from './RenderTarget'

class WebGL {
  private _gl?: WebGL2RenderingContext
  private _canvas?: HTMLCanvasElement
  private animeId?: number

  public time = { delta: 0, elapsed: 0 }
  private prevTime = 0

  setup(canvas: HTMLCanvasElement) {
    this._canvas = canvas
    this._gl = this.createContext()
    this.addEvents()
    this.resize()
    this.setDepth()
    this.background = [0, 0, 0, 1]
    this.clear()
  }

  private get canvas() {
    if (this._canvas) return this._canvas
    else throw new Error('HTMLCanvasElement is not defined')
  }

  get gl() {
    if (this._gl) return this._gl
    else throw new Error('WebGL2RenderingContext is not defined')
  }

  private createContext() {
    const gl = this.canvas.getContext('webgl2')
    if (gl) {
      gl.enable(gl.DEPTH_TEST)
      // gl.getExtension('OES_texture_float')
      gl.getExtension('EXT_color_buffer_float')
      // gl.enable(gl.BLEND)
      // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE)
      return gl
    } else {
      throw new Error('webgl2 not supported')
    }
  }

  private addEvents() {
    window.addEventListener('resize', this.resize)
  }

  private resize = () => {
    // this.canvas.width = window.innerWidth * window.devicePixelRatio
    // this.canvas.height = window.innerHeight * window.devicePixelRatio
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
  }

  private setDepth() {
    this.gl.clearDepth(1)
  }

  set background(color: [number, number, number, number]) {
    this.gl.clearColor(color[0], color[1], color[2], color[3])
    this.clear()
  }

  get size() {
    const { width, height } = this.canvas
    return { width, height, aspect: width / height }
  }

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
  }

  setRenderTarget(renderTarget: RenderTarget | null) {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, renderTarget?.framebuffer ?? null)
    this.clear()
  }

  animation(anime: () => void) {
    this.animeId = requestAnimationFrame(this.animation.bind(this, anime))

    const now = performance.now()
    this.time.delta = (now - this.prevTime) * 0.001
    this.time.elapsed += this.time.delta
    this.prevTime = now

    anime()
  }

  dispose() {
    window.removeEventListener('resize', this.resize)
    this.animeId && cancelAnimationFrame(this.animeId)
  }
}

export const webgl = new WebGL()
