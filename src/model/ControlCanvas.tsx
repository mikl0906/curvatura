import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import type { Axis } from "@/surface-store";
import { useSurfaceStore } from "@/surface-store";
import { HeightFieldMesh } from "./HeightFieldMesh";
import { Handle } from "./Handle";

type ControlCanvasProps = {
  axis: Axis;
  color: string;
};

/**
 * Editable height field for one coordinate function. The `(u, v)` domain lies in
 * the XY ground plane; each handle's height is its value along +Z (Z-up).
 */
export function ControlCanvas({ axis, color }: ControlCanvasProps) {
  const grid = useSurfaceStore((s) => s.axes[axis]);
  const samples = useSurfaceStore((s) => s.meshSamples);
  const n = grid.length;

  const handles = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = (n === 1 ? 0 : i / (n - 1)) * 2 - 1;
      const y = (n === 1 ? 0 : j / (n - 1)) * 2 - 1;
      handles.push(
        <Handle
          key={`${i}-${j}`}
          axis={axis}
          i={i}
          j={j}
          position={[x, y, grid[i][j]]}
          color={color}
        />,
      );
    }
  }

  return (
    <Canvas camera={{ position: [3, -3, 2.4], fov: 50 }} dpr={[1, 2]}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, -2, 6]} intensity={1.1} />
      <Grid
        rotation={[Math.PI / 2, 0, 0]}
        args={[4, 4]}
        cellSize={0.25}
        sectionSize={1}
        cellColor="#3a3a47"
        sectionColor="#52525b"
        fadeDistance={14}
        infiniteGrid={false}
      />
      <axesHelper args={[1.4]} />
      <HeightFieldMesh grid={grid} samples={samples} color={color} />
      {handles}
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={2}
        maxDistance={12}
      />
    </Canvas>
  );
}
