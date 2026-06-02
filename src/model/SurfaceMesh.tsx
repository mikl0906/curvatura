import * as THREE from "three";
import { useEffect, useMemo } from "react";
import type { Axes } from "@/types";
import { makeEvaluator } from "@/interpolation";
import { buildSurfaceGeometry } from "@/geometry";

type SurfaceMeshProps = {
  axes: Axes;
  samples: number;
};

/**
 * The assembled result surface: each `(u, v)` maps to the 3D point
 * `(x(u,v), y(u,v), z(u,v))`. Z is up by the app-wide convention.
 */
export function SurfaceMesh({ axes, samples }: SurfaceMeshProps) {
  const geometry = useMemo(() => {
    const evalX = makeEvaluator(axes.x);
    const evalY = makeEvaluator(axes.y);
    const evalZ = makeEvaluator(axes.z);
    return buildSurfaceGeometry(samples, (u, v) => [
      evalX(u, v),
      evalY(u, v),
      evalZ(u, v),
    ]);
  }, [axes, samples]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#aaa"
        side={THREE.DoubleSide}
        roughness={0.45}
        metalness={0.1}
        flatShading={false}
        wireframe={true}
      />
    </mesh>
  );
}
