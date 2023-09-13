import { Mesh } from './Mesh'
import { RenderTarget } from './RenderTarget'
import { webgl } from './WebGL'
import { PlaneGeometry } from './geometry/PlaneGeometry'
import { Material } from './material/Material'
import { Uniforms } from './material/Uniform'
import { Texture } from './texture/Texture'

const defaultVertexShader = `#version 300 es
in vec3 position;
in vec2 uv;

out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4( position, 1.0 );
}
`

type Params = {
  vertexShader?: string
  fragmentShader: string
  uniforms: Uniforms
  resolutionRatio?: [number, number]
  texture?: Texture
  /* 正方形テクスチャーかどうか */
  rectangle?: boolean
}

export abstract class QuadPass {
  private mesh: Mesh
  private renderTarget: RenderTarget
  private recreateRenderTarget: (() => void) | null = null
  private viewportSize = { width: 0, height: 0 }

  constructor(private params: Params) {
    this.renderTarget = this.createRenederTarget()
    this.mesh = this.createMesh()

    const rectangle = params?.rectangle ?? false
    if (!rectangle) {
      this.addEvents()
    }
  }

  get size() {
    const ratio = this.params.resolutionRatio ?? [1, 1]
    const w = Math.trunc(webgl.size.width * ratio[0])
    const h = Math.trunc(webgl.size.height * ratio[1])

    if (this.params?.rectangle) {
      return { width: Math.max(w, h), height: Math.max(w, h) }
    } else {
      return { width: w, height: h }
    }
  }

  get texture() {
    return this.renderTarget.texture
  }

  get uniforms() {
    return this.mesh.material.uniforms
  }

  private createRenederTarget() {
    const { width, height } = this.size
    this.viewportSize = { width, height }
    const renderTarget = new RenderTarget(width, height, this.params.texture ?? new Texture())
    return renderTarget
  }

  private createMesh() {
    const { vertexShader, fragmentShader, uniforms } = this.params
    const geometry = new PlaneGeometry({ width: 2, height: 2 })
    const material = new Material({ vertexShader: vertexShader ?? defaultVertexShader, fragmentShader, uniforms })
    const mesh = new Mesh(geometry, material)
    return mesh
  }

  private addEvents() {
    window.addEventListener('resize', this.resize)
  }

  private resize = () => {
    if (!this.recreateRenderTarget) {
      this.recreateRenderTarget = () => {
        const { width, height } = this.size
        this.renderTarget.createFramebuffer(width, height)
        this.viewportSize = { width, height }
        this.recreateRenderTarget = null
      }
    }
  }

  unbindTextures() {
    this.mesh.material.unbindTextures()
  }

  render() {
    this.recreateRenderTarget?.()
    webgl.setRenderTarget(this.renderTarget)
    webgl.gl.viewport(0, 0, this.viewportSize.width, this.viewportSize.height)
    this.mesh.render()
  }

  dispose() {
    this.mesh.dispose()
    this.mesh.material.dispose()
    this.renderTarget.dispose()
    window.removeEventListener('resize', this.resize)
  }
}
