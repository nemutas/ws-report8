import { Material } from '../material/Material'
import { webgl } from '../WebGL'

type Usage = 'STATIC_DRAW' | 'DYNAMIC_DRAW' | 'STREAM_DRAW'
type AttributeNames = 'position' | 'normal' | 'uv'
export type Attributes = { [name in AttributeNames]: { data: Float32Array; stride: number; usage?: Usage } }

export abstract class Geometry {
  private vao?: WebGLVertexArrayObject | null
  private vbo: { [name in string]: WebGLBuffer | null } = {}
  private ibo?: WebGLBuffer | null

  constructor(
    private attributes: Attributes,
    private indices?: Uint16Array,
  ) {}

  abstract draw(wire?: boolean): void

  createVAO(material: Material) {
    const gl = webgl.gl
    const vao = gl.createVertexArray()

    gl.bindVertexArray(vao)
    Object.entries(this.attributes).forEach(([name, v]) => {
      const location = material.getAttribLocation(name)
      if (0 <= location) {
        const vbo = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        gl.bufferData(gl.ARRAY_BUFFER, v.data, v.usage ? gl[v.usage] : gl.STATIC_DRAW)
        gl.enableVertexAttribArray(location)
        gl.vertexAttribPointer(location, v.stride, gl.FLOAT, false, 0, 0)
        this.vbo[name] = vbo
      }
    })
    if (this.indices) {
      const ibo = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW)
      this.ibo = ibo
    }
    gl.bindVertexArray(null)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

    this.vao = vao
  }

  enableBuffer() {
    this.vao && webgl.gl.bindVertexArray(this.vao)
  }

  dispose() {
    const gl = webgl.gl
    this.ibo && gl.deleteBuffer(this.ibo)
    Object.values(this.vbo).forEach((v) => {
      gl.deleteBuffer(v)
    })
    this.vao && gl.deleteVertexArray(this.vao)
  }
}
