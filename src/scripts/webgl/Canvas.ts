import { Mesh } from './core/Mesh'
import { webgl } from './core/WebGL'
import { PlaneGeometry } from './core/geometry/PlaneGeometry'
import { Material } from './core/material/Material'
import screenFs from './shader/screenFs.glsl'
import screenVs from './shader/screenVs.glsl'
import { GrayScottBuffer } from './GrayScottBuffer'
import { CopyBuffer } from './CopyBuffer'
import { Texture } from './core/texture/Texture'

export class Canvas {
  private mesh!: Mesh
  private grayScottBuffer!: GrayScottBuffer
  private copyBuffer!: CopyBuffer
  private prevTime: number = 0
  private fps = document.querySelector<HTMLElement>('.home__fps')!
  private counter = 0

  constructor(canvas: HTMLCanvasElement) {
    Texture.LoadImages(['images/fill.jpg', 'images/start.jpg']).then((images) => {
      webgl.setup(canvas)
      webgl.background = [0.01, 0.04, 0.09, 1]
      this.createSimulationBuffer(images)
      this.mesh = this.createMesh()
      this.addEvents()
      webgl.animation(this.anime)
    })
  }

  private createSimulationBuffer(images: HTMLImageElement[]) {
    const fill = images.find((image) => image.src.includes('fill'))!
    const start = images.find((image) => image.src.includes('start'))!
    const fillTexture = new Texture().create(fill)
    const startTexture = new Texture().create(start)

    const resolutionRatio = 1600 / window.innerWidth
    this.grayScottBuffer = new GrayScottBuffer([resolutionRatio, resolutionRatio])
    this.copyBuffer = new CopyBuffer([resolutionRatio, resolutionRatio])

    this.grayScottBuffer.uniforms.tDiffuse = this.copyBuffer.texture
    this.grayScottBuffer.uniforms.tFill = fillTexture
    this.grayScottBuffer.uniforms.tStart = startTexture
    this.grayScottBuffer.uniforms.uCotainRatio = this.calcContainTextureRatio()

    this.copyBuffer.uniforms.tDiffuse = this.grayScottBuffer.texture
  }

  private createMesh() {
    const geometry = new PlaneGeometry({ width: 2, height: 2 })
    const material = new Material({
      vertexShader: screenVs,
      fragmentShader: screenFs,
      uniforms: {
        tDiffuse: { type: 't', value: this.copyBuffer.texture },
        uCotainRatio: { type: '2fv', value: this.calcContainTextureRatio() },
      },
    })
    const mesh = new Mesh(geometry, material)
    return mesh
  }

  private calcContainTextureRatio() {
    if (1 < webgl.size.aspect) {
      return [webgl.size.aspect, 1]
    } else {
      return [1, 1 / webgl.size.aspect]
    }
  }

  private addEvents() {
    window.addEventListener('resize', () => {
      this.grayScottBuffer.uniforms.uCotainRatio = this.calcContainTextureRatio()
      this.mesh.material.uniforms.uCotainRatio = this.calcContainTextureRatio()
    })
  }

  private anime = () => {
    // performance check
    const now = performance.now()
    if (this.counter % 10 === 0) {
      this.fps.innerText = ((1 / (now - this.prevTime)) * 1000).toFixed(0)
      this.counter = 0
    }
    this.prevTime = now
    this.counter++

    // simulation
    for (let i = 0; i < 15; i++) {
      this.copyBuffer.unbindTextures()
      this.grayScottBuffer.render()

      this.grayScottBuffer.unbindTextures()
      this.copyBuffer.render()
    }

    // draw screen
    this.copyBuffer.unbindTextures()
    webgl.setRenderTarget(null)
    this.mesh.render({ wire: false })
  }

  dispose() {
    this.grayScottBuffer.dispose()
    this.copyBuffer.dispose()
    webgl.dispose()
  }
}
