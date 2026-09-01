import type { Preset } from "../../../state/types";

export const WINGED_PRESETS: Preset[] = [
  {
    id: "fly",
    rig: "winged",
    label: "Fly",
    sayings: ["flap and fly", "fly around"],
    mode: "parallel",
    loop: true,
    steps: [
      { primitive: "rotate", part: "wing-l", params: { from: -30, to: 30 }, durationMs: 400 },
      { primitive: "rotate", part: "wing-r", params: { from: 30, to: -30 }, durationMs: 400 },
      { primitive: "move", params: { dx: 120, dy: -40, path: "arc" }, durationMs: 3000 },
      { primitive: "wave", part: "tail", params: { angle: 10, cycles: 1 }, durationMs: 800 },
      { primitive: "tilt", params: { angle: 6, side: "both" }, durationMs: 3000 },
    ],
  },
  {
    id: "flap",
    rig: "winged",
    label: "Flap",
    sayings: ["flutter", "beat wings"],
    mode: "parallel",
    loop: true,
    steps: [
      { primitive: "rotate", part: "wing-l", params: { from: -42, to: 42 }, durationMs: 240 },
      { primitive: "rotate", part: "wing-r", params: { from: 42, to: -42 }, durationMs: 240 },
      { primitive: "bounce", params: { height: 10 }, durationMs: 240 },
    ],
  },
  {
    id: "glide",
    rig: "winged",
    label: "Glide",
    sayings: ["soar", "sail"],
    mode: "parallel",
    loop: true,
    steps: [
      { primitive: "rotate", part: "wing-l", params: { from: -8, to: 8 }, durationMs: 1500 },
      { primitive: "rotate", part: "wing-r", params: { from: 8, to: -8 }, durationMs: 1500 },
      { primitive: "move", params: { dx: 160, path: "arc" }, durationMs: 2600, ease: "ease-in-out" },
      { primitive: "tilt", params: { angle: 10, side: "both" }, durationMs: 2600 },
    ],
  },
];
