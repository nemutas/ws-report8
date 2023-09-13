import { mat3 } from 'gl-matrix'
import { webgl } from '../WebGL'

type Wrap = 'CLAMP_TO_EDGE' | 'REPEAT' | 'MIRRORED_REPEAT'
type Filter = 'NEAREST' | 'LINEAR' | 'NEAREST_MIPMAP_NEAREST' | 'NEAREST_MIPMAP_LINEAR' | 'LINEAR_MIPMAP_NEAREST' | 'LINEAR_MIPMAP_LINEAR'

export type Options = {
  wrapS?: Wrap
  wrapT?: Wrap
  mipmap?: boolean
  magFilter?: Filter
  minFilter?: Filter
  flipY?: boolean
  coveredProjectionAspect?: number
}

export class Texture {
  // ==================================================
  // static
  // ==================================================
  private static ResolvePath(path: string) {
    const p = path.startsWith('/') ? path.substring(1) : path
    return import.meta.env.BASE_URL + p
  }

  static LoadImage(path: string) {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = this.ResolvePath(path)
      img.onload = () => resolve(img)
    }) as Promise<HTMLImageElement>
  }

  static async LoadImages(paths: string[]) {
    return await Promise.all(paths.map(async (path) => await this.LoadImage(path)))
  }

  // ==================================================
  // instance
  // ==================================================
  public textureTarget: number
  protected _texture: WebGLTexture | null = null
  private _wrapS: Wrap = 'CLAMP_TO_EDGE'
  private _wrapT: Wrap = 'CLAMP_TO_EDGE'
  private _mipmap: boolean = true
  private _magFilter: Filter = 'NEAREST'
  private _minFilter: Filter = 'NEAREST'
  private _size?: { width: number; height: number; aspect: number }
  private _transformUv = mat3.create()
  private flipYMatrix = mat3.create()
  private coveredScale = mat3.create()

  constructor(private options?: Options) {
    this.textureTarget = webgl.gl.TEXTURE_2D

    if (options) {
      this._wrapS = options.wrapS ?? this._wrapS
      this._wrapT = options.wrapT ?? this._wrapT
      this._mipmap = options.mipmap ?? this._mipmap
      this._magFilter = options.magFilter ?? this._magFilter
      this._minFilter = options.minFilter ?? this._minFilter
      options.flipY && (this.filpY = true)
    }
  }

  createRenderTargetTexture(width: number, height: number) {
    this.dispose()

    const gl = webgl.gl
    this.setSize(width, height)
    this.cover(this.options?.coveredProjectionAspect ?? null)

    const texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    this.setParams(texture)

    this._texture = texture
    return this
  }

  /**
   * create texture
   * @param source HTMLImageElement
   */
  create(source?: any) {
    if (source === undefined) throw new Error('Source is not assigned.')

    this.dispose()

    const gl = webgl.gl
    source && this.setSize(source.width, source.height)
    this.cover(this.options?.coveredProjectionAspect ?? null)

    const texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
    this.setParams(texture)
    gl.bindTexture(gl.TEXTURE_2D, null)

    this._texture = texture
    return this
  }

  protected setParams(texture: WebGLTexture | null) {
    if (!texture) return

    const gl = webgl.gl
    this._mipmap && gl.generateMipmap(this.textureTarget)
    gl.texParameteri(this.textureTarget, gl.TEXTURE_MIN_FILTER, this._mipmap ? gl[this._minFilter] : gl.NEAREST)
    gl.texParameteri(this.textureTarget, gl.TEXTURE_MAG_FILTER, this._mipmap ? gl[this._magFilter] : gl.NEAREST)
    gl.texParameteri(this.textureTarget, gl.TEXTURE_WRAP_S, gl[this._wrapS])
    gl.texParameteri(this.textureTarget, gl.TEXTURE_WRAP_T, gl[this._wrapT])
  }

  private resetParams() {
    const gl = webgl.gl
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(this.textureTarget, this.texture)
    this.setParams(this.texture)
    gl.bindTexture(this.textureTarget, null)
  }

  get texture() {
    if (this._texture) return this._texture
    else throw new Error('Texture is not defined.')
  }

  protected setSize(width: number, height: number) {
    this._size = { width, height, aspect: width / height }
  }

  get size() {
    if (this._size) return this._size
    else throw new Error('Texture Size is not defined.')
  }

  set wrapS(v: Wrap) {
    this._wrapS = v
    this.resetParams()
  }

  set wrapT(v: Wrap) {
    this._wrapT = v
    this.resetParams()
  }

  set mipmap(v: boolean) {
    this._mipmap = v
    this.resetParams()
  }

  set magFilter(v: Filter) {
    this._magFilter = v
    this.resetParams()
  }

  set minFilter(v: Filter) {
    this._minFilter = v
    this.resetParams()
  }

  set filpY(v: boolean) {
    if (v) {
      this.flipYMatrix = mat3.fromValues(1, 0, 0, 0, -1, 0, 0, 1, 1)
    } else {
      mat3.identity(this.flipYMatrix)
    }
  }

  cover(projectionAspect: number | null) {
    if (projectionAspect === null || !this._size) {
      mat3.identity(this.coveredScale)
    } else {
      const imageAspect = this._size.aspect
      const x = projectionAspect < imageAspect ? projectionAspect / imageAspect : 1
      const y = projectionAspect < imageAspect ? 1 : imageAspect / projectionAspect
      this.coveredScale = mat3.fromValues(x, 0, 0, 0, y, 0, 0, 0, 1)
    }
  }

  get transformUv() {
    // [P][C][M][F](UV)
    const plus = mat3.fromValues(1, 0, 0, 0, 1, 0, 0.5, 0.5, 1)
    const minus = mat3.fromValues(1, 0, 0, 0, 1, 0, -0.5, -0.5, 1)
    mat3.identity(this._transformUv)
    mat3.mul(this._transformUv, this._transformUv, plus)
    mat3.mul(this._transformUv, this._transformUv, this.coveredScale)
    mat3.mul(this._transformUv, this._transformUv, minus)
    mat3.mul(this._transformUv, this._transformUv, this.flipYMatrix)
    return this._transformUv
  }

  dispose() {
    this._texture && webgl.gl.deleteTexture(this._texture)
  }
}
