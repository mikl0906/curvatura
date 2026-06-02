import {
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  OrthographicCamera,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";

export function EditorCanvas({ children }: { children: ReactNode }) {
  return (
    <Canvas>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, -3, 8]} intensity={1.2} />
      <directionalLight position={[-4, 3, -2]} intensity={0.4} />
      <axesHelper args={[0.5]} />
      <OrthographicCamera
        makeDefault
        zoom={150}
        near={0.1}
        far={100}
        position={[-4, -6, 3]}
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        minZoom={50}
        maxZoom={500}
        zoomSpeed={2}
        dampingFactor={0.2}
      />
      <GizmoHelper
        alignment="bottom-right" // widget alignment within scene
        margin={[80, 80]} // widget margins (X, Y)
      >
        <GizmoViewport
          axisColors={["red", "green", "blue"]}
          labelColor="white"
        />
      </GizmoHelper>
      {children}
    </Canvas>
  );
}
