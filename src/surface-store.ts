import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Axes, Grid, PresetName, SurfaceStore } from "@/types";
import { makeEvaluator } from "@/interpolation";

/** Build an `n×n` grid by sampling `f(u, v)` with `u, v ∈ [0, 1]`. */
function makeGrid(n: number, f: (u: number, v: number) => number): Grid {
  const grid: Grid = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    const u = n === 1 ? 0 : i / (n - 1);
    for (let j = 0; j < n; j++) {
      const v = n === 1 ? 0 : j / (n - 1);
      row.push(f(u, v));
    }
    grid.push(row);
  }
  return grid;
}

// A preset defines all three coordinate fields. Most are a flat sheet in the XY
// plane (x ramps along u, y ramps along v) varying only z, so the starting
// surface stays recognizable; `stadium` instead reshapes the XY footprint.
type CoordFn = (u: number, v: number) => number;
type PresetFns = { x: CoordFn; y: CoordFn; z: CoordFn };

const rampU: CoordFn = (u) => u * 2 - 1;
const rampV: CoordFn = (_u, v) => v * 2 - 1;
const zero: CoordFn = () => 0;
const sheetXY = { x: rampU, y: rampV };

const PRESET_FNS: Record<PresetName, PresetFns> = {
  flat: { ...sheetXY, z: zero },
  dome: {
    ...sheetXY,
    z: (u, v) => {
      const r2 = (u * 2 - 1) ** 2 + (v * 2 - 1) ** 2;
      return Math.max(0, 1 - r2);
    },
  },
  saddle: {
    ...sheetXY,
    z: (u, v) => 0.8 * ((u * 2 - 1) ** 2 - (v * 2 - 1) ** 2),
  },
  ripple: {
    ...sheetXY,
    z: (u, v) => {
      const r = Math.hypot(u * 2 - 1, v * 2 - 1);
      return 0.35 * Math.cos(r * Math.PI * 2.5);
    },
  },
  stadium: {
    x: (u, v) => Math.sin(2 * Math.PI * (u - 0.5)) * Math.cos(1.5 * v - 0.5),
    y: (u, v) => -Math.cos(2 * Math.PI * (u - 0.5)) * Math.cos(1.5 * v - 0.5),
    z: (u, v) =>
      0.6 * Math.sin(2 * v) + v * 0.1 * Math.cos(4 * Math.PI * (u - 0.5)),
  },
};

function buildAxes(n: number, preset: PresetName): Axes {
  const fns = PRESET_FNS[preset];
  return {
    x: makeGrid(n, fns.x),
    y: makeGrid(n, fns.y),
    z: makeGrid(n, fns.z),
  };
}

const DEFAULT_RESOLUTION = 5;
const DEFAULT_MESH_SAMPLES = 32;

/** Resample a grid to a new resolution, preserving its interpolated shape. */
function resampleGrid(grid: Grid, n: number): Grid {
  const evaluate = makeEvaluator(grid);
  return makeGrid(n, evaluate);
}

export const useSurfaceStore = create<SurfaceStore>()(
  persist(
    (set) => ({
      axes: buildAxes(DEFAULT_RESOLUTION, "flat"),
      resolution: DEFAULT_RESOLUTION,
      meshSamples: DEFAULT_MESH_SAMPLES,
      hovered: null,

      setHandle: (axis, i, j, value) =>
        set((state) => {
          const next = state.axes[axis].map((row, ri) =>
            ri === i ? row.map((v, ci) => (ci === j ? value : v)) : row,
          );
          return { axes: { ...state.axes, [axis]: next } };
        }),

      setResolution: (n) =>
        set((state) => ({
          resolution: n,
          axes: {
            x: resampleGrid(state.axes.x, n),
            y: resampleGrid(state.axes.y, n),
            z: resampleGrid(state.axes.z, n),
          },
        })),

      setMeshSamples: (n) => set({ meshSamples: n }),

      setHovered: (cell) => set({ hovered: cell }),

      reset: () =>
        set((state) => ({ axes: buildAxes(state.resolution, "flat") })),

      loadPreset: (name) =>
        set((state) => ({ axes: buildAxes(state.resolution, name) })),
    }),
    {
      name: "surface",
      version: 1,
    },
  ),
);
