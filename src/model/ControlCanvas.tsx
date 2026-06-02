import { Canvas } from "@react-three/fiber";
import {
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  OrthographicCamera,
} from "@react-three/drei";
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
      <axesHelper args={[0.5]} />
      <HeightFieldMesh grid={grid} samples={samples} color={color} />
      {handles}
      <OrthographicCamera
        makeDefault
        zoom={100}
        near={0.1}
        far={100}
        position={[-4, -6, 3]}
      />
      <OrbitControls makeDefault enablePan={false} minZoom={10} maxZoom={500} />
      <GizmoHelper
        alignment="bottom-right" // widget alignment within scene
        margin={[80, 80]} // widget margins (X, Y)
      >
        <GizmoViewport
          axisColors={["red", "green", "blue"]}
          labelColor="white"
        />
      </GizmoHelper>
    </Canvas>
  );
}
