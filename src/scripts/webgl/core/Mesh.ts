import { mat4, vec3 } from 'gl-matrix'
import { Geometry } from './geometry/Geometry'
import { Material } from './material/Material'
import { Camera } from './camera/Camera'

export class Mesh {
  private translateMatrix = mat4.create()
  private rotateMatrix = mat4.create()
  private scaleMatrix = mat4.create()
  private modelMatrix = mat4.create()
  private modelMatrixInverse = mat4.create()
  private normalMatrix = mat4.create()

  constructor(
    public readonly geometry: Geometry,
    public readonly material: Material,
  ) {
    geometry.createVAO(material)
  }

  translate(x: number, y: number, z: number) {
    mat4.translate(this.translateMatrix, mat4.create(), [x, y, z])
  }

  rotate(axis: vec3, angle: number) {
    const normalizedAxis = vec3.create()
    vec3.normalize(normalizedAxis, axis)
    mat4.rotate(this.rotateMatrix, mat4.create(), angle, normalizedAxis)
  }

  scale(x: number, y: number, z: number) {
    mat4.scale(this.scaleMatrix, mat4.create(), [x, y, z])
  }

  updateModelMatrix() {
    // glMatrix（glsl）は列優先のmatrixなので、post-multiplyされる
    // [T][R][S](P)
    mat4.identity(this.modelMatrix)
    mat4.mul(this.modelMatrix, this.modelMatrix, this.translateMatrix)
    mat4.mul(this.modelMatrix, this.modelMatrix, this.rotateMatrix)
    mat4.mul(this.modelMatrix, this.modelMatrix, this.scaleMatrix)
    // normalMatrix = ([M]-1)T
    mat4.transpose(this.normalMatrix, mat4.invert(this.modelMatrixInverse, this.modelMatrix))
  }

  render(params?: { camera?: Camera; wire?: boolean }) {
    this.material.uniforms.modelMatrix = this.modelMatrix
    this.material.uniforms.normalMatrix = this.normalMatrix
    if (params?.camera) {
      this.material.uniforms.viewMatrix = params.camera.viewMatrix
      this.material.uniforms.projectionMatrix = params.camera.projectionMatrix
    }

    this.geometry.enableBuffer()
    this.material.enableProgram()
    this.geometry.draw(params?.wire)
  }

  dispose() {
    this.geometry.dispose()
  }
}
