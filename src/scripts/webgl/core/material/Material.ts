import { Uniform, Uniforms } from './Uniform'
import { webgl } from '../WebGL'

type Params = {
  vertexShader: string
  fragmentShader: string
  uniforms: Uniforms
}

export class Material {
  public uniforms: Object & { [name in string]: any } = {}

  private uniform: Uniform
  private program: WebGLProgram

  constructor(params: Params) {
    const vs = this.createShaderObject(params.vertexShader, webgl.gl.VERTEX_SHADER)
    const fs = this.createShaderObject(params.fragmentShader, webgl.gl.FRAGMENT_SHADER)
    this.program = this.createProgramObject(vs, fs)

    this.bindUniformTemplate(params.uniforms)
    Object.entries(params.uniforms).forEach(([name, { value }]) => (this.uniforms[name] = value))
    this.uniform = new Uniform(webgl.gl, this.program, params.uniforms)
  }

  /**
   * シェーダオブジェクトを生成する
   */
  private createShaderObject(shaderSource: string, type: number) {
    const gl = webgl.gl
    const shader = gl.createShader(type)
    if (!shader) throw new Error('cannot created shader')

    gl.shaderSource(shader, shaderSource)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'error')

    return shader
  }

  /**
   * プログラムオブジェクトを生成する
   */
  private createProgramObject(vs: WebGLShader, fs: WebGLShader) {
    const gl = webgl.gl
    const program = gl.createProgram()
    if (!program) throw new Error('cannot created program')

    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.deleteShader(vs)
    gl.deleteShader(fs)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'error')

    gl.useProgram(program)
    return program
  }

  private bindUniformTemplate(uniforms: Uniforms) {
    Object.bind(uniforms, {
      modelMatrix: { type: 'm4', value: null },
      viewMatrix: { type: 'm4', value: null },
      projectionMatrix: { type: 'm4', value: null },
      normalMatrix: { type: 'm4', value: null },
    })
  }

  getAttribLocation(name: string) {
    return webgl.gl.getAttribLocation(this.program, name)
  }

  enableProgram() {
    webgl.gl.useProgram(this.program)

    Object.entries(this.uniforms).forEach(([name, value]) => this.uniform.set(name, value))
    this.uniform.bindTextures()
  }

  unbindTextures() {
    webgl.gl.useProgram(this.program)
    this.uniform.bindTextures('unbind')
  }

  dispose() {
    webgl.gl.deleteProgram(this.program)
  }
}
