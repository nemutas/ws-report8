import { Texture } from '../texture/Texture'

export type UniformType = '1f' | '1i' | '2fv' | '3fv' | 'm3' | 'm4' | 't'
export type Uniforms = { [name in string]: { value: any; type: UniformType } }

export class Uniform {
  private uniforms: Object & { [name in string]: { location: WebGLUniformLocation | null; type: UniformType; texture?: Texture; unit?: number } } = {}
  private textureUnit = 0

  constructor(
    private gl: WebGL2RenderingContext,
    private program: WebGLProgram,
    uniforms: Uniforms,
  ) {
    uniforms && this.addAll(uniforms)
  }

  /**
   * uniformを追加する
   * @param name 一意な名前
   * @param type データ型
   * @param value 初期値
   */
  private add(name: string, type: UniformType, value?: any) {
    const gl = this.gl
    const location = gl.getUniformLocation(this.program, name)

    if (type === 't') {
      this.uniforms[name] = { location, type, texture: value, unit: this.textureUnit++ }
    } else {
      this.uniforms[name] = { location, type }
    }

    if (value) {
      this.set(name, value)
    }
  }

  private addAll(uniforms: { [name in string]: { value: any; type: UniformType } }) {
    Object.entries(uniforms).forEach(([name, v]) => {
      this.add(name, v.type, v.value)
    })
  }

  /**
   * uniformを設定する
   * @param name
   * @param value データ型に対応した値
   */
  set(name: string, value: any) {
    const gl = this.gl

    if (!this.uniforms.hasOwnProperty(name)) return

    const { location, type, texture, unit } = this.uniforms[name]
    if (!location) return

    gl.useProgram(this.program)

    switch (type) {
      case '1f':
        gl.uniform1f(location, value)
        break
      case '1i':
        gl.uniform1i(location, value)
        break
      case '2fv':
        gl.uniform2fv(location, value)
        break
      case '3fv':
        gl.uniform3fv(location, value)
        break
      case 'm3':
        gl.uniformMatrix3fv(location, false, value)
        break
      case 'm4':
        gl.uniformMatrix4fv(location, false, value)
        break
      case 't':
        if (value instanceof Texture) {
          this.uniforms[name].texture = value
        }
        gl.activeTexture(gl.TEXTURE0 + unit!)
        gl.bindTexture(texture?.textureTarget ?? gl.TEXTURE_2D, texture?.texture ?? null)
        gl.uniform1i(location, unit!)
        break
    }
  }

  bindTextures(mode: 'bind' | 'unbind' = 'bind') {
    Object.values(this.uniforms).forEach((uniform) => {
      if (uniform.type === 't' && uniform.texture) {
        this.gl.activeTexture(this.gl.TEXTURE0 + uniform.unit!)
        this.gl.bindTexture(uniform.texture!.textureTarget, mode === 'bind' ? uniform.texture!.texture : null)
      }
    })
  }
}
