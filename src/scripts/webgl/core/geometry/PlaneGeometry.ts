import { Attributes, Geometry } from './Geometry'
import { webgl } from '../WebGL'

type Params = {
  width: number
  height: number
  widthSegments?: number
  heightSegments?: number
}

export class PlaneGeometry extends Geometry {
  // ==================================================
  // static
  // ==================================================

  private static CreateAttributes(params: Params): Attributes {
    const { width, height, widthSegments = 1, heightSegments = 1 } = params

    const [w2, h2] = [width / 2, height / 2]
    const [dw, dh] = [width / widthSegments, height / heightSegments]

    const positions: number[] = []
    const normals: number[] = []
    const uvs: number[] = []

    for (let ih = heightSegments; 0 <= ih; ih--) {
      for (let iw = 0; iw <= widthSegments; iw++) {
        positions.push(iw * dw - w2, ih * dh - h2, 0)
        normals.push(0, 0, 1)
        uvs.push(iw / widthSegments, ih / heightSegments)
      }
    }

    return {
      position: { data: Float32Array.from(positions), stride: 3 },
      normal: { data: Float32Array.from(normals), stride: 3 },
      uv: { data: Float32Array.from(uvs), stride: 2 },
    }
  }

  private static CreateIndices(params: Params) {
    const { widthSegments = 1, heightSegments = 1 } = params

    const indices: number[] = []

    let row = 0

    for (let i = 0; i < widthSegments * heightSegments; i++) {
      const col = i % widthSegments
      const offset = row * (widthSegments + 1)

      const lt = col + offset
      const rt = lt + 1
      const lb = lt + (widthSegments + 1)
      const rb = lb + 1

      indices.push(lt, lb, rt)
      indices.push(rt, lb, rb)

      if ((i + 1) % widthSegments === 0) row++
    }

    return Uint16Array.from(indices)
  }

  // ==================================================
  // instance
  // ==================================================
  constructor(private params: Params) {
    super(PlaneGeometry.CreateAttributes(params), PlaneGeometry.CreateIndices(params))
  }

  draw(wire?: boolean) {
    const segments = (this.params.widthSegments ?? 1) * (this.params.heightSegments ?? 1)
    webgl.gl.drawElements(wire ? webgl.gl.LINES : webgl.gl.TRIANGLES, 6 * segments, webgl.gl.UNSIGNED_SHORT, 0)
  }
}
