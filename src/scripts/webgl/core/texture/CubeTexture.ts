import { Options, Texture } from './Texture'
import { webgl } from '../WebGL'

type CubeTextureSet = { data: HTMLImageElement; target: number }[]

export class CubeTexture extends Texture {
  // ==================================================
  // static
  // ==================================================
  /**
   * ソースセットを生成する
   * @param images ファイル名が "px" | "py" | "pz" | "nx" | "ny" | "nz" の画像リソース群
   * @returns
   */
  static CreateDataSet(images: HTMLImageElement[]) {
    const gl = webgl.gl

    const faceNames = ['px', 'py', 'pz', 'nx', 'ny', 'nz']
    const dataSet: CubeTextureSet = []

    images.forEach((img) => {
      const fileName = img.src.split('/').at(-1)?.split('.')[0]
      if (!fileName || !faceNames.includes(fileName)) return

      let target: number = -1
      if (fileName === 'px') target = gl.TEXTURE_CUBE_MAP_POSITIVE_X
      else if (fileName === 'py') target = gl.TEXTURE_CUBE_MAP_POSITIVE_Y
      else if (fileName === 'pz') target = gl.TEXTURE_CUBE_MAP_POSITIVE_Z
      else if (fileName === 'nx') target = gl.TEXTURE_CUBE_MAP_NEGATIVE_X
      else if (fileName === 'ny') target = gl.TEXTURE_CUBE_MAP_NEGATIVE_Y
      else if (fileName === 'nz') target = gl.TEXTURE_CUBE_MAP_NEGATIVE_Z

      dataSet.push({ data: img, target })
    })

    return dataSet
  }

  // ==================================================
  // instance
  // ==================================================
  constructor(options?: Options) {
    super(options)
    this.textureTarget = webgl.gl.TEXTURE_CUBE_MAP
  }

  override create(dataSet: CubeTextureSet) {
    this.dispose()

    const gl = webgl.gl

    const texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)

    dataSet.forEach((data) => {
      gl.texImage2D(data.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data.data)
    })

    this.setParams(texture)
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)

    this._texture = texture
    return this
  }
}
