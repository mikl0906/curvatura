/**
 * Emit the current control grids as self-contained JavaScript arrow functions.
 *
 * The generated strings embed the grid data and an inlined Catmull-Rom bicubic
 * evaluator that mirrors `interpolation.ts` exactly, so they are copy-paste
 * runnable with zero dependencies. This is the app's only output affordance.
 */

import type { Grid } from "./types";

/** Inlined helpers shared by every emitted lambda (matches interpolation.ts). */
const HELPERS =
  "const cr=(p0,p1,p2,p3,t)=>{const t2=t*t,t3=t2*t;" +
  "return 0.5*(2*p1+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3);};" +
  "const s1=(a,x)=>{const n=a.length;if(n===0)return 0;if(n===1)return a[0];" +
  "const fx=Math.min(Math.max(x,0),1)*(n-1),i=Math.min(Math.floor(fx),n-2),t=fx-i," +
  "at=k=>a[Math.min(Math.max(k,0),n-1)];return cr(at(i-1),at(i),at(i+1),at(i+2),t);};" +
  "const f=g=>(u,v)=>s1(g.map(r=>s1(r,v)),u);";

/** Round grid values to keep the emitted string compact and readable. */
function serializeGrid(grid: Grid): string {
  return JSON.stringify(grid.map((row) => row.map((n) => Math.round(n * 1e4) / 1e4)));
}

/** A single coordinate function: `(u, v) => number`. */
export function gridToLambdaString(grid: Grid): string {
  return `((g)=>{${HELPERS}return f(g);})(${serializeGrid(grid)})`;
}

/**
 * The full surface as three ready-to-paste declarations sharing one helper
 * preamble, so the result drops straight into a script:
 *
 *   const cr=…; const s1=…; const f=…;
 *   const x = f([...]);
 *   const y = f([...]);
 *   const z = f([...]);
 *
 * Each of `x`, `y`, `z` is a standalone `(u, v) => number`.
 */
export function surfaceToLambdaString(gx: Grid, gy: Grid, gz: Grid): string {
  return (
    `${HELPERS}\n` +
    `const x = f(${serializeGrid(gx)});\n` +
    `const y = f(${serializeGrid(gy)});\n` +
    `const z = f(${serializeGrid(gz)});`
  );
}
