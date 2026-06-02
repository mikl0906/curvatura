import { Grid } from "@react-three/drei";
import { useSurfaceStore } from "@/surface-store";
import { SurfaceMesh } from "./SurfaceMesh";
import { SurfaceHandles } from "./SurfaceHandles";
import { EditorCanvas } from "./EditorCanvas";

/** The assembled parametric surface (x(u,v), y(u,v), z(u,v)). Read-only. */
export function ResultCanvas() {
  const axes = useSurfaceStore((s) => s.axes);
  const samples = useSurfaceStore((s) => s.meshSamples);

  return (
    <EditorCanvas>
      <Grid
        rotation={[Math.PI / 2, 0, 0]}
        args={[6, 6]}
        cellSize={0.25}
        sectionSize={1}
        cellColor="#3a3a47"
        sectionColor="#52525b"
        fadeDistance={22}
        infiniteGrid={false}
      />
      <SurfaceMesh axes={axes} samples={samples} />
      <SurfaceHandles axes={axes} />
    </EditorCanvas>
  );
}
