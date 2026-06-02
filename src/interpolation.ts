/**
 * Pure interpolation math — no React, no three.js.
 *
 * A control grid is an `N×M` array of scalar handle values sampled over the
 * parameter domain `(u, v) ∈ [0, 1] × [0, 1]`. We interpolate between handles
 * with a Catmull-Rom spline: it passes exactly through every handle, is C1
 * continuous (smooth, no facets), and is local. Bicubic interpolation over the
 * grid is the separable application of the 1D spline first along v, then u.
 *
 * This module backs both the rendered meshes and the "copy as JS lambda"
 * export, so it is kept dependency-free and trivially serializable.
 */

export type Grid = number[][];

/** 1D Catmull-Rom basis through p1..p2, with neighbours p0 and p3. */
export function catmullRom(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number,
): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

/** Sample a 1D array of values at `x ∈ [0, 1]` with edge clamping. */
export function sampleArray1D(values: number[], x: number): number {
  const n = values.length;
  if (n === 0) return 0;
  if (n === 1) return values[0];

  const fx = Math.min(Math.max(x, 0), 1) * (n - 1);
  const i = Math.min(Math.floor(fx), n - 2);
  const t = fx - i;

  const at = (k: number) => values[Math.min(Math.max(k, 0), n - 1)];
  return catmullRom(at(i - 1), at(i), at(i + 1), at(i + 2), t);
}

/**
 * Bicubic sample of a grid at `(u, v) ∈ [0, 1]²`.
 * `grid[i]` is a row spanning v; `i` indexes u.
 */
export function sampleBicubic(grid: Grid, u: number, v: number): number {
  if (grid.length === 0) return 0;
  const colSamples = grid.map((row) => sampleArray1D(row, v));
  return sampleArray1D(colSamples, u);
}

/** Build a memo-friendly `(u, v) => value` evaluator bound to a grid. */
export function makeEvaluator(grid: Grid): (u: number, v: number) => number {
  return (u, v) => sampleBicubic(grid, u, v);
}
