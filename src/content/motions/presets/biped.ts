import type { Preset } from "../../../state/types";

export const BIPED_PRESETS: Preset[] = [
  {
    id: "wave",
    rig: "biped",
    label: "Wave",
    sayings: ["hello", "say hi", "bye-bye"],
    mode: "parallel",
    loop: false,
    steps: [
      { primitive: "wave", part: "arm-r", params: { angle: 18, cycles: 4, offset: -110 }, durationMs: 1400 },
      { primitive: "rotate", part: "head", params: { from: -5, to: 5 }, durationMs: 700 },
      { primitive: "bounce", params: { height: 4 }, durationMs: 700 },
    ],
  },
  {
    id: "dance",
    rig: "biped",
    label: "Dance",
    sayings: ["boogie", "party", "groove"],
    mode: "parallel",
    loop: true,
    steps: [
      { primitive: "bounce", params: { height: 14 }, durationMs: 420 },
      { primitive: "wave", part: "arm-l", params: { angle: 25, cycles: 1, offset: 60 }, durationMs: 840 },
      { primitive: "wave", part: "arm-r", params: { angle: 25, cycles: 1, offset: -60 }, durationMs: 840 },
      { primitive: "rotate", params: { from: -6, to: 6 }, durationMs: 840 },
      { primitive: "tilt", part: "head", params: { angle: 8, side: "both" }, durationMs: 840 },
      { primitive: "rotate", part: "leg-l", params: { from: -8, to: 8 }, durationMs: 420 },
      { primitive: "rotate", part: "leg-r", params: { from: 8, to: -8 }, durationMs: 420 },
    ],
  },
  {
    id: "jump",
    rig: "biped",
    label: "Jump",
    sayings: ["hop", "leap", "hooray"],
    mode: "parallel",
    loop: false,
    steps: [
      { primitive: "bounce", params: { height: 110, squash: 0.12 }, durationMs: 720 },
      { primitive: "rotate", part: "arm-l", params: { from: 0, to: 150 }, durationMs: 720 },
      { primitive: "rotate", part: "arm-r", params: { from: 0, to: -150 }, durationMs: 720 },
    ],
  },
];
