import * as THREE from "three";
import { useState, type ReactNode } from "react";
import { Check, Copy, Moon, RotateCcw, Shapes, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import type { PresetName } from "@/surface-store";
import { useSurfaceStore } from "@/surface-store";
import { gridToLambdaString, surfaceToLambdaString } from "@/lambda-export";
import { ControlCanvas } from "./model/ControlCanvas";
import { ResultCanvas } from "./model/ResultCanvas";
import { Slider } from "./components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./components/ui/popover";
import GithubIcon from "./components/Github";

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
    <Button variant="outline" size="sm" onClick={onClick}>
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
      <div className="flex shrink-0 items-center justify-between border-b p-2 h-10">
        <span className="flex items-center gap-2 font-medium text-sm">
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
      size="icon-sm"
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
  const [presetsOpen, setPresetsOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b p-2">
        <div className="flex justify-between items-center gap-2">
          <h1 className="font-semibold tracking-tight">Curvatura</h1>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Parametric surface builder
          </span>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw />
              Reset
            </Button>

            <CopyButton
              getText={() => surfaceToLambdaString(axes.x, axes.y, axes.z)}
            >
              Copy all
            </CopyButton>

            <label className="hidden text-sm items-center gap-2 text-muted-foreground lg:flex">
              Handles
              <Slider
                min={3}
                max={15}
                step={1}
                value={[resolution]}
                onValueChange={(value) => setResolution(value[0])}
                className="w-32"
              />
              <span className="w-8">
                {resolution}×{resolution}
              </span>
            </label>

            <Popover open={presetsOpen} onOpenChange={setPresetsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Shapes />
                  Presets
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56">
                <PopoverHeader>
                  <PopoverTitle>Presets</PopoverTitle>
                  <PopoverDescription>
                    Start from an example surface.
                  </PopoverDescription>
                </PopoverHeader>
                <div className="grid grid-cols-2 gap-1">
                  {PRESETS.map((p) => (
                    <Button
                      key={p.name}
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        loadPreset(p.name);
                        setPresetsOpen(false);
                      }}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" asChild aria-label="GitHub">
            <a
              href="https://github.com/mikl0906/curvatura"
              target="_blank"
              rel="noreferrer noopener"
            >
              <GithubIcon />
            </a>
          </Button>
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
