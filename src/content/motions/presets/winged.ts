import type { Preset } from "../../../state/types";
import {
  bounce,
  danceVariants,
  flyVariants,
  lean,
  many,
  move,
  nod,
  one,
  rot,
  swimVariants,
  wave,
} from "./shared";

const flap = (angle: number, ms: number) => [
  rot("wing-l", -angle, angle, ms),
  rot("wing-r", angle, -angle, ms),
];

export const WINGED_PRESETS: Preset[] = [
  one({
    id: "greet",
    rig: "winged",
    label: "Say hi",
    sayings: ["hi", "hello", "bye-bye", "wave"],
    mode: "parallel",
    loop: false,
    steps: [wave("wing-r", 28, 4, 1400, -60), nod("head", 8, 700), wave("tail", 10, 1, 1400), bounce(4, 700)],
  }),
  many({ id: "walk", rig: "winged", label: "Walk", sayings: ["stroll", "march", "go"] }, [
    {
      id: "stroll",
      label: "Stroll",
      mode: "parallel",
      loop: true,
      steps: [
        nod("head", 6, 600),
        wave("tail", 12, 1, 600),
        ...flap(8, 600),
        bounce(5, 300),
        move(760, 0, "line", 4800),
      ],
    },
    {
      id: "march",
      label: "March",
      mode: "parallel",
      loop: true,
      steps: [
        nod("head", 8, 420),
        wave("tail", 16, 1, 420),
        ...flap(12, 420),
        bounce(9, 210),
        move(760, 0, "line", 3360),
      ],
    },
  ]),
  one({
    id: "run",
    rig: "winged",
    label: "Run",
    sayings: ["dash", "sprint", "zoom"],
    mode: "parallel",
    loop: true,
    steps: [
      ...flap(18, 300),
      bounce(10, 300),
      lean(0, -6, 600),
      wave("tail", 10, 1, 300),
      move(1000, 0, "line", 2400),
    ],
  }),
  many(
    { id: "fly", rig: "winged", label: "Fly", sayings: ["flap and fly", "fly around"] },
    flyVariants(undefined, [...flap(30, 400), wave("tail", 10, 1, 800)]),
  ),
  many(
    { id: "swim", rig: "winged", label: "Swim", sayings: ["paddle", "float like a duck"] },
    swimVariants(undefined, [...flap(12, 700), wave("tail", 12, 2, 900), rot("head", -4, 4, 1400)]),
  ),
  many(
    { id: "dance", rig: "winged", label: "Dance", sayings: ["boogie", "party", "groove"] },
    danceVariants([...flap(25, 420), wave("tail", 20, 2, 840), nod("head", 8, 840)]),
  ),
  one({
    id: "peck",
    rig: "winged",
    label: "Peck",
    sayings: ["eat", "nibble", "peck at seeds"],
    mode: "parallel",
    loop: 3,
    steps: [rot("head", 0, 25, 300), bounce(4, 300), wave("tail", 8, 1, 600)],
  }),
];
