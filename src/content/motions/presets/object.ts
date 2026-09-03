import type { Preset } from "../../../state/types";
import {
  bounce,
  danceVariants,
  flyVariants,
  lean,
  many,
  move,
  one,
  rot,
  scale,
  shake,
  swimVariants,
  tilt,
  wave,
} from "./shared";

export const OBJECT_PRESETS: Preset[] = [
  one({
    id: "greet",
    rig: "object",
    label: "Say hi",
    sayings: ["hi", "hello", "bye-bye", "wave"],
    mode: "parallel",
    loop: 2,
    steps: [tilt(10, 700), bounce(5, 700), scale(1, 1.25, 350, "accent-1")],
  }),
  one({
    id: "launch",
    rig: "object",
    label: "Launch",
    sayings: ["blast off", "take off", "go up"],
    mode: "parallel",
    loop: false,
    steps: [
      shake(5, 5, 500),
      {
        primitive: "move",
        params: { dy: -900, path: "line", hold: true },
        durationMs: 1400,
        ease: "ease-in",
        delayMs: 500,
      },
      scale(1, 1.5, 300, "accent-1"),
      { ...scale(1, 1.5, 300, "accent-1"), delayMs: 350 },
    ],
  }),
  many({ id: "walk", rig: "object", label: "Walk", sayings: ["stroll", "march", "go"] }, [
    {
      id: "stroll",
      label: "Stroll",
      mode: "parallel",
      loop: true,
      steps: [tilt(8, 600), bounce(8, 300), wave("accent-2", 8, 1, 600), move(760, 0, "line", 4800)],
    },
    {
      id: "march",
      label: "March",
      mode: "parallel",
      loop: true,
      steps: [tilt(10, 420), bounce(12, 210), wave("accent-2", 10, 1, 420), move(760, 0, "line", 3360)],
    },
  ]),
  one({
    id: "run",
    rig: "object",
    label: "Run",
    sayings: ["dash", "sprint", "zoom"],
    mode: "parallel",
    loop: true,
    steps: [
      lean(0, -8, 600),
      shake(3, 2, 300),
      scale(1, 1.3, 300, "accent-1"),
      bounce(8, 300),
      move(1000, 0, "line", 2400),
    ],
  }),
  many(
    { id: "fly", rig: "object", label: "Fly", sayings: ["float", "soar", "fly up"] },
    flyVariants({ rotate: 90 }, [scale(1, 1.4, 300, "accent-1"), wave("accent-2", 6, 1, 900)]),
  ),
  many(
    { id: "swim", rig: "object", label: "Swim", sayings: ["paddle", "go swimming"] },
    swimVariants({ rotate: 80 }, [wave("accent-1", 20, 2, 800), scale(1, 1.15, 800, "accent-2")]),
  ),
  many(
    { id: "dance", rig: "object", label: "Dance", sayings: ["boogie", "party", "groove"] },
    danceVariants([rot("accent-1", -15, 15, 420), scale(1, 1.2, 840, "accent-2")]),
  ),
];
