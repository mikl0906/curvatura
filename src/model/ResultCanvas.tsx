import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import { useSurfaceStore } from "@/surfaceStore";
import { SurfaceMesh } from "./SurfaceMesh";

/** The assembled parametric surface (x(u,v), y(u,v), z(u,v)). Read-only. */
export function ResultCanvas() {
  const axes = useSurfaceStore((s) => s.axes);
  const samples = useSurfaceStore((s) => s.meshSamples);

  return (
    <Canvas camera={{ position: [3.2, -3.2, 2.6], fov: 50 }} dpr={[1, 2]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, -3, 8]} intensity={1.2} />
      <directionalLight position={[-4, 3, -2]} intensity={0.4} />
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
      <axesHelper args={[1.6]} />
      <SurfaceMesh axes={axes} samples={samples} />
      <OrbitControls makeDefault minDistance={2} maxDistance={16} />
    </Canvas>
  );
}
