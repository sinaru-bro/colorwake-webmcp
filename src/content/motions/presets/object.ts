import type { Preset } from "../../../state/types";

export const OBJECT_PRESETS: Preset[] = [
  {
    id: "launch",
    rig: "object",
    label: "Launch",
    sayings: ["blast off", "take off", "go up"],
    mode: "parallel",
    loop: false,
    steps: [
      { primitive: "shake", params: { amplitude: 5, cycles: 5 }, durationMs: 500 },
      {
        primitive: "move",
        params: { dy: -200, path: "line", hold: true },
        durationMs: 1200,
        ease: "ease-in",
        delayMs: 500,
      },
      { primitive: "scale", part: "accent-1", params: { from: 1, to: 1.5 }, durationMs: 300 },
      { primitive: "scale", part: "accent-1", params: { from: 1, to: 1.5 }, durationMs: 300, delayMs: 350 },
    ],
  },
  {
    id: "wobble",
    rig: "object",
    label: "Wobble",
    sayings: ["teeter", "rock"],
    mode: "parallel",
    loop: true,
    steps: [
      { primitive: "tilt", params: { angle: 12, side: "both" }, durationMs: 700 },
      { primitive: "rotate", part: "accent-1", params: { from: -10, to: 10 }, durationMs: 700 },
    ],
  },
  {
    id: "sparkle",
    rig: "object",
    label: "Sparkle",
    sayings: ["shine", "twinkle", "glow"],
    mode: "parallel",
    loop: true,
    steps: [
      { primitive: "fade", params: { to: 0.55, flicker: 2 }, durationMs: 600 },
      { primitive: "scale", params: { from: 1, to: 1.08 }, durationMs: 600 },
      { primitive: "scale", part: "accent-2", params: { from: 1, to: 1.3 }, durationMs: 300 },
    ],
  },
];
