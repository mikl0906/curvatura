# Curvatura

Parametrically build surfaces in 3D, right in the browser.

A surface in Curvatura is defined by three coordinate functions over a parameter domain `(u, v)`:

```
x(u, v),  y(u, v),  z(u, v)
```

You shape each function by **dragging point handles up and down** on its own grid, and watch the resulting surface take form in a fourth canvas.

## How it works

The interface has four canvases:

- **Three control canvases** — one each for **x**, **y**, and **z**. Each is a height-field grid over the `(u, v)` domain with draggable handles. Dragging a handle raises or lowers the value of that coordinate function at that point. Values between handles are smoothly **spline-interpolated**, so your fields stay continuous.
- **One result canvas** — renders the assembled surface by evaluating `(x(u,v), y(u,v), z(u,v))` across the domain, with orbit/zoom controls.

The app is **view-only** — there's no file to save or mesh to export. Instead, you can **copy the current `x`, `y`, and `z` functions as JavaScript lambdas** (`(u, v) => ...`) and paste them into your own code.

## Tech stack

- **React 19** + **TypeScript** + **Vite 8**
- **three.js** via **[@react-three/fiber](https://github.com/pmndrs/react-three-fiber)** and **[@react-three/drei](https://github.com/pmndrs/drei)** for the 3D canvases
- **[Zustand](https://github.com/pmndrs/zustand)** for surface/editor state
- **Tailwind CSS v4** + **[shadcn/ui](https://ui.shadcn.com/)** for the interface

## Getting started

```bash
npm install
npm run dev      # start the dev server (opens the browser)
```

## Scripts

| Command           | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with hot reload            |
| `npm run build`   | Type-check (`tsc -b`) and build for production       |
| `npm run preview` | Preview the production build locally                 |
| `npm run lint`    | Lint the codebase with ESLint                        |

## Project status

Early scaffold. The toolchain, theming, and UI foundation are in place; the surface-building canvases are under construction. See [CLAUDE.md](./CLAUDE.md) for the intended architecture.
