import * as THREE from "three";
import { useState, type ReactNode } from "react";
import { Check, Copy, Moon, RotateCcw, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import type { PresetName } from "@/surfaceStore";
import { useSurfaceStore } from "@/surfaceStore";
import { gridToLambdaString, surfaceToLambdaString } from "@/lambda-export";
import { ControlCanvas } from "./model/ControlCanvas";
import { ResultCanvas } from "./model/ResultCanvas";

// App-wide convention: Z is up on every canvas.
THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

const AXIS_COLOR = {
  x: "#ef4444",
  y: "#22c55e",
  z: "#3b82f6",
} as const;

const PRESETS: { name: PresetName; label: string }[] = [
  { name: "flat", label: "Flat" },
  { name: "dome", label: "Dome" },
  { name: "saddle", label: "Saddle" },
  { name: "ripple", label: "Ripple" },
];

function CopyButton({
  getText,
  children,
}: {
  getText: () => string;
  children: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };
  return (
    <Button variant="outline" size="xs" onClick={onClick}>
      {copied ? <Check /> : <Copy />}
      {copied ? "Copied!" : children}
    </Button>
  );
}

function Panel({
  label,
  color,
  action,
  children,
}: {
  label: string;
  color?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative flex flex-col overflow-hidden bg-background">
      <div className="flex h-9 shrink-0 items-center justify-between border-b px-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          {color && (
            <span
              className="size-2.5 rounded-full"
              style={{ background: color }}
            />
          )}
          {label}
        </span>
        {action}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}

export function EditorShell() {
  const axes = useSurfaceStore((s) => s.axes);
  const resolution = useSurfaceStore((s) => s.resolution);
  const setResolution = useSurfaceStore((s) => s.setResolution);
  const loadPreset = useSurfaceStore((s) => s.loadPreset);
  const reset = useSurfaceStore((s) => s.reset);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
        <h1 className="text-base font-semibold tracking-tight">Curvatura</h1>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          Parametric surface builder
        </span>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-1 md:flex">
            {PRESETS.map((p) => (
              <Button
                key={p.name}
                variant="ghost"
                size="xs"
                onClick={() => loadPreset(p.name)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <label className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
            Handles
            <input
              type="range"
              min={3}
              max={9}
              step={1}
              value={resolution}
              onChange={(e) => setResolution(Number(e.target.value))}
              className="accent-primary"
            />
            <span className="w-8 tabular-nums">
              {resolution}×{resolution}
            </span>
          </label>

          <Button variant="ghost" size="xs" onClick={reset}>
            <RotateCcw />
            Reset
          </Button>

          <CopyButton
            getText={() => surfaceToLambdaString(axes.x, axes.y, axes.z)}
          >
            Copy all
          </CopyButton>

          <ThemeToggle />
        </div>
      </header>

      <main
        className={cn(
          "grid min-h-0 flex-1 gap-px bg-border",
          "grid-cols-1 grid-rows-4 md:grid-cols-2 md:grid-rows-2",
        )}
      >
        {(["x", "y", "z"] as const).map((axis) => (
          <Panel
            key={axis}
            label={`${axis}(u, v)`}
            color={AXIS_COLOR[axis]}
            action={
              <CopyButton getText={() => gridToLambdaString(axes[axis])}>
                Copy
              </CopyButton>
            }
          >
            <ControlCanvas axis={axis} color={AXIS_COLOR[axis]} />
          </Panel>
        ))}

        <Panel label="Surface">
          <ResultCanvas />
        </Panel>
      </main>
    </div>
  );
}
