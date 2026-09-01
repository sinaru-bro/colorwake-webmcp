import type { Preset } from "../../../state/types";

export const QUADRUPED_PRESETS: Preset[] = [
  {
    id: "walk",
    rig: "quadruped",
    label: "Walk",
    sayings: ["stroll", "march", "go"],
    mode: "parallel",
    loop: true,
    steps: [
      { primitive: "rotate", part: "leg-fl", params: { from: -18, to: 18 }, durationMs: 600 },
      { primitive: "rotate", part: "leg-br", params: { from: -18, to: 18 }, durationMs: 600 },
      { primitive: "rotate", part: "leg-fr", params: { from: 18, to: -18 }, durationMs: 600 },
      { primitive: "rotate", part: "leg-bl", params: { from: 18, to: -18 }, durationMs: 600 },
      { primitive: "bounce", params: { height: 6 }, durationMs: 600 },
      { primitive: "wave", part: "tail", params: { angle: 15, cycles: 1 }, durationMs: 600 },
      { primitive: "rotate", part: "head", params: { from: -4, to: 4 }, durationMs: 1200 },
    ],
  },
  {
    id: "jump",
    rig: "quadruped",
    label: "Jump",
    sayings: ["hop", "leap", "pounce"],
    mode: "sequence",
    loop: false,
    steps: [
      { primitive: "scale", params: { from: 1, to: 0.92 }, durationMs: 150, ease: "ease-in" },
      { primitive: "bounce", params: { height: 130, squash: 0.15 }, durationMs: 750 },
      { primitive: "shake", params: { amplitude: 3, cycles: 2 }, durationMs: 200 },
    ],
  },
  {
    id: "wag",
    rig: "quadruped",
    label: "Wag",
    sayings: ["wag tail", "happy tail"],
    mode: "parallel",
    loop: true,
    steps: [
      { primitive: "wave", part: "tail", params: { angle: 28, cycles: 4 }, durationMs: 1000 },
      { primitive: "rotate", part: "ear-l", params: { from: -6, to: 6 }, durationMs: 500 },
      { primitive: "rotate", part: "ear-r", params: { from: 6, to: -6 }, durationMs: 500 },
    ],
  },
];
