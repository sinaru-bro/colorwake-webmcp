import type { Preset } from "../../../state/types";

export const SWIMMER_PRESETS: Preset[] = [
  {
    id: "swim",
    rig: "swimmer",
    label: "Swim",
    sayings: ["paddle", "go swimming"],
    mode: "parallel",
    loop: true,
    steps: [
      { primitive: "wave", part: "tail-fin", params: { angle: 25, cycles: 2 }, durationMs: 800 },
      { primitive: "wave", part: "fin-l", params: { angle: 15, cycles: 2 }, durationMs: 800 },
      { primitive: "wave", part: "fin-top", params: { angle: 8, cycles: 1 }, durationMs: 800 },
      { primitive: "move", params: { dx: 40, dy: 10, path: "arc" }, durationMs: 2400 },
      { primitive: "tilt", params: { angle: 5, side: "both" }, durationMs: 2400 },
    ],
  },
  {
    id: "dive",
    rig: "swimmer",
    label: "Dive",
    sayings: ["go down", "plunge"],
    mode: "parallel",
    loop: false,
    steps: [
      { primitive: "move", params: { dy: 120, path: "arc" }, durationMs: 1600, ease: "ease-in-out" },
      { primitive: "rotate", params: { from: 0, to: 30 }, durationMs: 1600 },
      { primitive: "wave", part: "tail-fin", params: { angle: 30, cycles: 3 }, durationMs: 1600 },
    ],
  },
  {
    id: "leap",
    rig: "swimmer",
    label: "Leap",
    sayings: ["jump out", "splash"],
    mode: "parallel",
    loop: false,
    steps: [
      { primitive: "bounce", params: { height: 170, squash: 0.05 }, durationMs: 900, ease: "ease-out" },
      { primitive: "spin", params: { turns: 1 }, durationMs: 900 },
      { primitive: "wave", part: "fin-l", params: { angle: 20, cycles: 2 }, durationMs: 900 },
    ],
  },
];
