import type { Axis } from "@/types";
import { useSurfaceStore } from "@/surface-store";
import { HeightFieldMesh } from "./HeightFieldMesh";
import { Handle } from "./Handle";
import { EditorCanvas } from "./EditorCanvas";

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
    <EditorCanvas>
      <HeightFieldMesh grid={grid} samples={samples} color={color} />
      {handles}
    </EditorCanvas>
  );
}
