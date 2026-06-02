import { useRef, useState } from "react";
import { DragControls } from "@react-three/drei";
import type { Axis } from "@/surface-store";
import { useSurfaceStore } from "@/surface-store";

const VALUE_LIMIT = 3;
const clamp = (x: number, min: number, max: number) =>
  Math.min(Math.max(x, min), max);

type HandleProps = {
  axis: Axis;
  i: number;
  j: number;
  position: [number, number, number];
  color: string;
};

/**
 * A draggable control point. Dragging edits only the handle's Z value (the
 * coordinate function's output); its `(u, v)` position in the ground plane is
 * fixed. drei's `DragControls` disables OrbitControls for the duration of the
 * drag automatically.
 *
 * With `autoTransform={false}` and an untouched (identity) group matrix, the
 * matrix passed to `onDrag` carries the Z translation as a delta from the grab
 * point, so the new value is `startValue + dz`.
 */
export function Handle({ axis, i, j, position, color }: HandleProps) {
  const setHandle = useSurfaceStore((s) => s.setHandle);
  const setHovered = useSurfaceStore((s) => s.setHovered);
  const highlighted = useSurfaceStore(
    (s) => s.hovered?.i === i && s.hovered?.j === j,
  );
  const startValue = useRef(position[2]);
  const [dragging, setDragging] = useState(false);

  return (
    <DragControls
      autoTransform={false}
      onHover={(h) => setHovered(h ? { i, j } : null)}
      onDragStart={() => {
        startValue.current = position[2];
        setDragging(true);
      }}
      onDrag={(matrix) => {
        const dz = matrix.elements[14];
        setHandle(
          axis,
          i,
          j,
          clamp(startValue.current + dz, -VALUE_LIMIT, VALUE_LIMIT),
        );
      }}
      onDragEnd={() => setDragging(false)}
    >
      <mesh position={position}>
        <sphereGeometry args={[0.05, 20, 20]} />
        <meshStandardMaterial
          color={dragging ? "#ffffff" : color}
          emissive={color}
          emissiveIntensity={highlighted || dragging ? 0.7 : 0.2}
        />
      </mesh>
    </DragControls>
  );
}
