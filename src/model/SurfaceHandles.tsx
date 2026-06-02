import type { ThreeEvent } from "@react-three/fiber";
import type { Axes } from "@/surface-store";
import { useSurfaceStore } from "@/surface-store";

type SurfaceHandlesProps = {
  axes: Axes;
  color?: string;
};

/**
 * One read-only control point. Subscribes only to its own cell's hover state so
 * highlighting a handle here (or in any control canvas) re-renders just this
 * sphere, not the whole surface.
 */
function SurfaceHandle({
  i,
  j,
  position,
  color,
}: {
  i: number;
  j: number;
  position: [number, number, number];
  color: string;
}) {
  const setHovered = useSurfaceStore((s) => s.setHovered);
  const highlighted = useSurfaceStore(
    (s) => s.hovered?.i === i && s.hovered?.j === j,
  );

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered({ i, j });
  };
  const onOut = () => setHovered(null);

  return (
    <mesh position={position} onPointerOver={onOver} onPointerOut={onOut}>
      <sphereGeometry args={[0.03, 20, 20]} />
      <meshStandardMaterial
        color={highlighted ? "#ffffff" : color}
        emissive={color}
        emissiveIntensity={highlighted ? 0.7 : 0.2}
      />
    </mesh>
  );
}

/**
 * Read-only control points on the assembled surface. Each grid position `(i, j)`
 * sits at the 3D point `(x[i][j], y[i][j], z[i][j])` — the same handles edited on
 * the control canvases, shown here where they land on the result surface. Unlike
 * {@link Handle} these carry no `DragControls`, so they cannot be moved, but they
 * share the same hover highlight across every canvas.
 */
export function SurfaceHandles({ axes, color = "#aaa" }: SurfaceHandlesProps) {
  const { x, y, z } = axes;
  const n = x.length;

  const handles = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      handles.push(
        <SurfaceHandle
          key={`${i}-${j}`}
          i={i}
          j={j}
          position={[x[i][j], y[i][j], z[i][j]]}
          color={color}
        />,
      );
    }
  }

  return <>{handles}</>;
}
