import type { Preset } from "../../../state/types";

export const UNIVERSAL_PRESETS: Preset[] = [
  {
    id: "fly",
    rig: "any",
    label: "Fly",
    sayings: ["float", "soar", "fly up"],
    mode: "parallel",
    loop: true,
    steps: [
      { primitive: "move", params: { dy: -120, path: "arc" }, durationMs: 2400 },
      { primitive: "tilt", params: { angle: 8, side: "both" }, durationMs: 2400 },
      { primitive: "bounce", params: { height: 6 }, durationMs: 600 },
    ],
  },
  {
    id: "jump",
    rig: "any",
    label: "Jump",
    sayings: ["hop", "leap", "bounce"],
    mode: "sequence",
    loop: false,
    steps: [
      { primitive: "scale", params: { from: 1, to: 0.92 }, durationMs: 150, ease: "ease-in" },
      { primitive: "bounce", params: { height: 120, squash: 0.12 }, durationMs: 720 },
    ],
  },
  {
    id: "spin",
    rig: "any",
    label: "Spin",
    sayings: ["twirl", "turn around", "whirl"],
    mode: "parallel",
    loop: false,
    steps: [
      { primitive: "spin", params: { turns: 1, direction: "cw" }, durationMs: 800 },
      { primitive: "scale", params: { from: 1, to: 1.1 }, durationMs: 800 },
    ],
  },
  {
    id: "wiggle",
    rig: "any",
    label: "Wiggle",
    sayings: ["dance", "shimmy", "jiggle"],
    mode: "parallel",
    loop: true,
    steps: [
      { primitive: "rotate", params: { from: -6, to: 6 }, durationMs: 500 },
      { primitive: "scale", params: { from: 1, to: 1.06 }, durationMs: 500 },
    ],
  },
  {
    id: "grow",
    rig: "any",
    label: "Grow",
    sayings: ["get bigger", "big", "giant"],
    mode: "sequence",
    loop: false,
    steps: [{ primitive: "scale", params: { from: 1, to: 1.4 }, durationMs: 900, ease: "ease-in-out" }],
  },
  {
    id: "hide",
    rig: "any",
    label: "Hide",
    sayings: ["shrink", "peekaboo", "disappear"],
    mode: "parallel",
    loop: false,
    steps: [
      { primitive: "fade", params: { to: 0.15 }, durationMs: 700 },
      { primitive: "scale", params: { from: 1, to: 0.7 }, durationMs: 700 },
    ],
  },
  {
    id: "stop",
    rig: "any",
    label: "Stop",
    sayings: ["freeze", "stay still", "hold on"],
    mode: "parallel",
    loop: false,
    steps: [],
  },
];
