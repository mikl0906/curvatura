import * as THREE from "three";

/**
 * Build an indexed, smooth-shaded surface geometry by sampling `posFn(u, v)`
 * over an `samples × samples` grid with `u, v ∈ [0, 1]`. Used for both the
 * per-axis height fields and the assembled result surface.
 */
export function buildSurfaceGeometry(
  samples: number,
  posFn: (u: number, v: number) => [number, number, number],
): THREE.BufferGeometry {
  const n = Math.max(2, samples);
  const positions = new Float32Array(n * n * 3);

  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    for (let j = 0; j < n; j++) {
      const v = j / (n - 1);
      const [x, y, z] = posFn(u, v);
      const k = (i * n + j) * 3;
      positions[k] = x;
      positions[k + 1] = y;
      positions[k + 2] = z;
    }
  }

  const indices: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1; j++) {
      const a = i * n + j;
      const b = i * n + j + 1;
      const c = (i + 1) * n + j;
      const d = (i + 1) * n + j + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
