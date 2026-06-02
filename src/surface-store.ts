import { create } from "zustand";
import type { Grid } from "@/interpolation";
import { makeEvaluator } from "@/interpolation";

export type Axis = "x" | "y" | "z";
export type Axes = Record<Axis, Grid>;
export type PresetName = "flat" | "dome" | "saddle" | "ripple";

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

// Base coordinate fields: x ramps along u, y ramps along v (a flat sheet in the
// XY plane). Presets vary only z so the starting surface stays recognizable.
const rampU = (u: number) => u * 2 - 1;
const rampV = (_u: number, v: number) => v * 2 - 1;

const PRESET_Z: Record<PresetName, (u: number, v: number) => number> = {
  flat: () => 0,
  dome: (u, v) => {
    const r2 = (u * 2 - 1) ** 2 + (v * 2 - 1) ** 2;
    return Math.max(0, 1 - r2);
  },
  saddle: (u, v) => 0.8 * ((u * 2 - 1) ** 2 - (v * 2 - 1) ** 2),
  ripple: (u, v) => {
    const r = Math.hypot(u * 2 - 1, v * 2 - 1);
    return 0.35 * Math.cos(r * Math.PI * 2.5);
  },
};

function buildAxes(n: number, preset: PresetName): Axes {
  return {
    x: makeGrid(n, (u) => rampU(u)),
    y: makeGrid(n, rampV),
    z: makeGrid(n, PRESET_Z[preset]),
  };
}

const DEFAULT_RESOLUTION = 5;
const DEFAULT_MESH_SAMPLES = 48;

/** Resample a grid to a new resolution, preserving its interpolated shape. */
function resampleGrid(grid: Grid, n: number): Grid {
  const evaluate = makeEvaluator(grid);
  return makeGrid(n, evaluate);
}

/** The grid cell currently highlighted, shared across every canvas. */
export type HoveredCell = { i: number; j: number };

type SurfaceState = {
  axes: Axes;
  resolution: number;
  meshSamples: number;
  hovered: HoveredCell | null;
  setHandle: (axis: Axis, i: number, j: number, value: number) => void;
  setResolution: (n: number) => void;
  setMeshSamples: (n: number) => void;
  setHovered: (cell: HoveredCell | null) => void;
  reset: () => void;
  loadPreset: (name: PresetName) => void;
};

export const useSurfaceStore = create<SurfaceState>((set) => ({
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

  reset: () => set((state) => ({ axes: buildAxes(state.resolution, "flat") })),

  loadPreset: (name) =>
    set((state) => ({ axes: buildAxes(state.resolution, name) })),
}));
