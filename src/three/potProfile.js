import * as THREE from 'three'

// Shared revolved silhouettes (radius, height) for LatheGeometry.
// Clean UVs come for free → used by the kiln, glaze-painting and gallery blocks.
const SHAPES = {
  vase: [
    [0.0, -1.12],
    [0.46, -1.12],
    [0.52, -0.98],
    [0.6, -0.6],
    [0.72, -0.05],
    [0.8, 0.4],
    [0.76, 0.72],
    [0.66, 0.98],
    [0.62, 1.12],
  ],
  mug: [
    [0.0, -1.0],
    [0.52, -1.0],
    [0.58, -0.88],
    [0.6, -0.4],
    [0.62, 0.2],
    [0.63, 0.78],
    [0.61, 1.0],
    [0.57, 1.02],
  ],
  bowl: [
    [0.0, -0.62],
    [0.34, -0.64],
    [0.62, -0.5],
    [0.92, -0.1],
    [1.08, 0.34],
    [1.04, 0.44],
  ],
}

export const SHAPE_KEYS = Object.keys(SHAPES)

export function potGeometry(shape = 'vase', segments = 80) {
  const pts = (SHAPES[shape] || SHAPES.vase).map(([x, y]) => new THREE.Vector2(x, y))
  const g = new THREE.LatheGeometry(pts, segments)
  g.computeVertexNormals()
  return g
}
