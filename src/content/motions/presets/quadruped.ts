import type { Preset, Step } from "../../../state/types";
import {
  bounce,
  danceVariants,
  flyVariants,
  jumpVariants,
  lean,
  many,
  move,
  nod,
  one,
  rot,
  swimVariants,
  wave,
} from "./shared";

/** Diagonal pairs swing together, like a real trot. */
const trot = (angle: number, ms: number): Step[] => [
  rot("leg-fl", -angle, angle, ms),
  rot("leg-br", -angle, angle, ms),
  rot("leg-fr", angle, -angle, ms),
  rot("leg-bl", angle, -angle, ms),
];

export const QUADRUPED_PRESETS: Preset[] = [
  one({
    id: "greet",
    rig: "quadruped",
    label: "Say hi",
    sayings: ["hi", "hello", "bye-bye", "wave"],
    mode: "parallel",
    loop: false,
    steps: [wave("leg-fl", 22, 4, 1400, -40), nod("head", 6, 700), wave("tail", 18, 2, 1400), bounce(4, 700)],
  }),
  many({ id: "walk", rig: "quadruped", label: "Walk", sayings: ["stroll", "march", "go"] }, [
    {
      id: "stroll",
      label: "Stroll",
      mode: "parallel",
      loop: true,
      steps: [
        ...trot(18, 600),
        bounce(5, 300),
        wave("tail", 15, 1, 600),
        rot("head", -4, 4, 1200),
        move(760, 0, "line", 4800),
      ],
    },
    {
      id: "march",
      label: "March",
      mode: "parallel",
      loop: true,
      steps: [
        ...trot(26, 420),
        bounce(9, 210),
        wave("tail", 20, 1, 420),
        rot("head", -6, 6, 840),
        move(760, 0, "line", 3360),
      ],
    },
  ]),
  one({
    id: "run",
    rig: "quadruped",
    label: "Run",
    sayings: ["dash", "sprint", "zoom", "chase"],
    mode: "parallel",
    loop: true,
    steps: [
      ...trot(32, 300),
      bounce(12, 300),
      lean(0, -6, 600),
      wave("tail", 12, 1, 300),
      move(1000, 0, "line", 2400),
    ],
  }),
  many(
    { id: "jump", rig: "quadruped", label: "Jump", sayings: ["hop", "leap", "pounce"] },
    jumpVariants([wave("tail", 20, 1, 600)]),
  ),
  one({
    id: "wag",
    rig: "quadruped",
    label: "Wag",
    sayings: ["wag tail", "happy tail"],
    mode: "parallel",
    loop: true,
    steps: [wave("tail", 28, 4, 1000), rot("ear-l", -6, 6, 500), rot("ear-r", 6, -6, 500)],
  }),
  many(
    { id: "swim", rig: "quadruped", label: "Swim", sayings: ["paddle", "doggy paddle", "go swimming"] },
    swimVariants({ rotate: 65 }, [...trot(28, 450), wave("tail", 20, 2, 900)]),
  ),
  many(
    { id: "fly", rig: "quadruped", label: "Fly", sayings: ["float", "soar", "fly up"] },
    flyVariants({ rotate: 18 }, [
      rot("leg-fl", -15, 10, 700),
      rot("leg-br", 10, -15, 700),
      wave("tail", 18, 1, 900),
      rot("head", -5, 5, 1400),
    ]),
  ),
  many(
    { id: "dance", rig: "quadruped", label: "Dance", sayings: ["boogie", "party", "groove"] },
    danceVariants([
      wave("tail", 30, 2, 840),
      nod("head", 8, 840),
      rot("leg-fl", -8, 8, 420),
      rot("leg-br", 8, -8, 420),
    ]),
  ),
];
