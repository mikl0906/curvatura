# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Curvatura is a web app for **parametrically building surfaces in 3D**. A surface is defined by three coordinate functions over a parameter domain `(u, v)`:

```
x(u, v),  y(u, v),  z(u, v)
```

The user edits each coordinate function independently by dragging point handles up and down on a **height-field grid** laid over the `(u, v)` domain. There are four canvases:

- Three **control canvases** — one each for `x`, `y`, `z`. Each shows a grid of draggable handles; the handle at grid position `(i, j)` sets the value of that coordinate function at the sampled `(u, v)`. Dragging is the only edit; it moves the value up/down.
- One **result canvas** — renders the assembled surface by evaluating `(x(u,v), y(u,v), z(u,v))` across the domain.

Values between handles are **bicubic/spline interpolated**, so the height fields (and the resulting surface) are smooth, not faceted.

The app is **view-only** — there is no mesh export or saved-file persistence. The one output affordance is **copying the current `x`/`y`/`z` functions as JavaScript lambda expressions** (e.g. `(u, v) => ...`) that reproduce the interpolated field, so a user can paste them elsewhere.

> **Status:** the repo is currently a scaffold. `src/App.tsx` is empty and the three.js / react-three-fiber dependencies are installed but not yet wired up. The sections below describe the **target architecture** — follow them when building features.

## Commands

```bash
npm run dev      # Vite dev server, opens the browser (--open)
npm run build    # tsc -b (type-check, project references) then vite build
npm run lint     # eslint over the repo
npm run preview  # serve the production build locally
```

There is no test runner configured yet. `npm run build` is the type-check gate — it runs `tsc -b` across the project references before bundling, so a build failure usually means a type error, not a bundler error.

## Stack & conventions

- **Vite 8 + React 19 + TypeScript** (strict-ish: `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `verbatimModuleSyntax`). Because of `verbatimModuleSyntax`, **type-only imports must use `import type`**.
- **three.js** via **@react-three/fiber** (declarative R3F components) and **@react-three/drei** (helpers — `OrbitControls`, `Grid`, drag controls, etc.). Prefer R3F/drei components over imperative three.js where one exists.
- **Tailwind CSS v4** — configured through the Vite plugin (`@tailwindcss/vite`), no `tailwind.config.js`. Theme tokens live as CSS variables in `src/index.css` (`@theme inline` + `:root`/`.dark` blocks). Add colors/radii there, not in a JS config.
- **shadcn/ui** (`radix-nova` style, `neutral` base, lucide icons). Components are generated into `src/components/ui/` and owned by this repo — edit them directly. Add new ones with `npx shadcn@latest add <name>`; config is `components.json`.
- **Path alias `@/` → `src/`** (set in both `vite.config.ts` and the tsconfigs). Import as `@/components/...`, `@/lib/utils`.
- **`cn()`** from `@/lib/utils` (clsx + tailwind-merge) is the standard className combiner.
- **Theming** is handled by `ThemeProvider` (`src/components/theme-provider.tsx`), which toggles a `dark`/`light` class on `<html>` and persists to `localStorage` under `vite-ui-theme`. `useTheme()` reads/sets it.

## Target architecture

When implementing the surface builder, organize it around these layers. Keep the **math/evaluation layer free of React and three.js** so it can be unit-reasoned about and reused by the lambda-export feature.

1. **State — Zustand store.** Use a Zustand store as the single source of truth for the three control grids (the handle values for `x`, `y`, `z`) and editor settings (grid resolution, domain bounds, etc.). Zustand is the chosen approach because it avoids the re-render churn that React context causes inside an R3F render loop — components subscribe to slices and the result canvas can read values without forcing the editors to re-render. **Note: `zustand` is not yet a dependency — add it (`npm i zustand`) when wiring this up.**

2. **Math layer (plain TS, no React/three).** A grid of handle values plus a bicubic/spline interpolator that produces a continuous `(u, v) => value` function for one coordinate. The result surface evaluator samples all three at a mesh resolution to produce vertex positions. This same interpolation code backs the **"copy as JS lambda"** export, so keep it pure and serializable to a standalone arrow-function string.

3. **Control canvas (R3F).** A reusable component rendering one height-field grid with draggable handles (drei drag controls / raycasting), wired to one coordinate slice of the store. Instantiated three times (x, y, z). Dragging updates the store; the rendered surface reads from it.

4. **Result canvas (R3F).** Subscribes to all three grids, rebuilds the parametric mesh `(x(u,v), y(u,v), z(u,v))` via the math layer, and displays it with camera controls. Watch performance: rebuild geometry from a memoized evaluator and update buffer attributes rather than recreating meshes on every drag frame.

5. **UI shell (shadcn).** Layout for the four canvases, theme toggle, resolution/domain controls, and the copy-as-lambda action.
