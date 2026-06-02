import * as THREE from "three";
import { useEffect, useMemo } from "react";
import type { Grid } from "@/interpolation";
import { makeEvaluator } from "@/interpolation";
import { buildSurfaceGeometry } from "@/geometry";

type HeightFieldMeshProps = {
  grid: Grid;
  samples: number;
  color: string;
};

/**
 * The interpolated height field for one coordinate. The `(u, v)` domain lies in
 * the XY ground plane (mapped to `[-1, 1]`) and the value rises along +Z.
 */
export function HeightFieldMesh({
  grid,
  samples,
  color,
}: HeightFieldMeshProps) {
  const geometry = useMemo(() => {
    const evaluate = makeEvaluator(grid);
    return buildSurfaceGeometry(samples, (u, v) => [
      u * 2 - 1,
      v * 2 - 1,
      evaluate(u, v),
    ]);
  }, [grid, samples]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.7}
        side={THREE.DoubleSide}
        roughness={0.6}
        metalness={0.05}
      />
    </mesh>
  );
}
