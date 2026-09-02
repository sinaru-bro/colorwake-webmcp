import type { Preset } from "../../../state/types";
import {
  bounce,
  danceVariants,
  flyVariants,
  many,
  move,
  nod,
  one,
  rot,
  swimVariants,
  tilt,
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
  many(
    { id: "fly", rig: "winged", label: "Fly", sayings: ["flap and fly", "fly around"] },
    flyVariants(undefined, [...flap(30, 400), wave("tail", 10, 1, 800)]),
  ),
  one({
    id: "flap",
    rig: "winged",
    label: "Flap",
    sayings: ["flutter", "beat wings"],
    mode: "parallel",
    loop: true,
    steps: [...flap(42, 240), bounce(10, 240)],
  }),
  one({
    id: "glide",
    rig: "winged",
    label: "Glide",
    sayings: ["soar", "sail"],
    mode: "parallel",
    loop: true,
    steps: [...flap(8, 1500), move(900, 0, "arc", 3600), tilt(10, 3600)],
  }),
  many(
    { id: "swim", rig: "winged", label: "Swim", sayings: ["paddle", "float like a duck"] },
    swimVariants(undefined, [...flap(12, 700), wave("tail", 12, 2, 900), rot("head", -4, 4, 1400)]),
  ),
  one({
    id: "hop",
    rig: "winged",
    label: "Hop",
    sayings: ["hop along", "bounce"],
    mode: "parallel",
    loop: true,
    steps: [bounce(40, 480), move(220, 0, "arc", 960), ...flap(20, 240), wave("tail", 12, 1, 480)],
  }),
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
