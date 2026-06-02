/**
 * Shared app types. Kept dependency-free (no React, three.js, or zustand) so the
 * math layer and the lambda export can import from here without pulling in UI.
 */

/**
 * A control grid: an `N×M` array of scalar handle values sampled over the
 * parameter domain `(u, v) ∈ [0, 1] × [0, 1]`. `grid[i]` is a row spanning v;
 * `i` indexes u.
 */
export type Grid = number[][];

/** One of the three coordinate functions of a surface. */
export type Axis = "x" | "y" | "z";

/** The three control grids that together define a parametric surface. */
export type Axes = Record<Axis, Grid>;

/** Built-in starting surfaces. */
export type PresetName = "flat" | "dome" | "saddle" | "ripple";

/** The grid cell currently highlighted, shared across every canvas. */
export type HoveredCell = { i: number; j: number };

/** Zustand store: the single source of truth for the three grids and settings. */
export type SurfaceStore = {
  axes: Axes;
  resolution: number; // Number of handles in grid row
  meshSamples: number; // Density of the final mesh
  hovered: HoveredCell | null;
  setHandle: (axis: Axis, i: number, j: number, value: number) => void;
  setResolution: (n: number) => void;
  setMeshSamples: (n: number) => void;
  setHovered: (cell: HoveredCell | null) => void;
  reset: () => void;
  loadPreset: (name: PresetName) => void;
};
