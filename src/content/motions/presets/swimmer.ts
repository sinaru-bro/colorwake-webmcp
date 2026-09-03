import type { Preset } from "../../../state/types";
import { bounce, danceVariants, flyVariants, lean, many, move, nod, one, swimVariants, wave } from "./shared";

export const SWIMMER_PRESETS: Preset[] = [
  one({
    id: "greet",
    rig: "swimmer",
    label: "Say hi",
    sayings: ["hi", "hello", "bye-bye", "wave"],
    mode: "parallel",
    loop: false,
    steps: [wave("fin-l", 30, 4, 1400, -35), nod("head", 8, 700), bounce(5, 700)],
  }),
  many({ id: "walk", rig: "swimmer", label: "Walk", sayings: ["stroll", "march", "go"] }, [
    {
      id: "stroll",
      label: "Stroll",
      mode: "parallel",
      loop: true,
      steps: [
        wave("tail-fin", 20, 1, 600),
        wave("fin-l", 12, 1, 600),
        bounce(6, 300),
        nod("head", 4, 600),
        move(760, 0, "line", 4800),
      ],
    },
    {
      id: "march",
      label: "March",
      mode: "parallel",
      loop: true,
      steps: [
        wave("tail-fin", 28, 1, 420),
        wave("fin-l", 16, 1, 420),
        bounce(10, 210),
        nod("head", 6, 420),
        move(760, 0, "line", 3360),
      ],
    },
  ]),
  one({
    id: "run",
    rig: "swimmer",
    label: "Run",
    sayings: ["dash", "sprint", "zoom"],
    mode: "parallel",
    loop: true,
    steps: [
      wave("tail-fin", 35, 1, 300),
      wave("fin-l", 20, 1, 300),
      bounce(10, 300),
      lean(0, -6, 600),
      move(1000, 0, "line", 2400),
    ],
  }),
  many(
    { id: "swim", rig: "swimmer", label: "Swim", sayings: ["paddle", "go swimming"] },
    swimVariants(undefined, [
      wave("tail-fin", 25, 2, 800),
      wave("fin-l", 15, 2, 800),
      wave("fin-top", 8, 1, 800),
    ]),
  ),
  one({
    id: "dive",
    rig: "swimmer",
    label: "Dive",
    sayings: ["go down", "plunge"],
    mode: "parallel",
    loop: false,
    steps: [move(0, 300, "line", 1800), lean(0, 35, 1800), wave("tail-fin", 30, 3, 1800)],
  }),
  many(
    { id: "fly", rig: "swimmer", label: "Fly", sayings: ["float", "soar", "flying fish"] },
    flyVariants({ rotate: 20 }, [
      wave("tail-fin", 20, 2, 700),
      wave("fin-l", 25, 2, 700),
      wave("fin-r", 25, 2, 700),
    ]),
  ),
  many(
    { id: "dance", rig: "swimmer", label: "Dance", sayings: ["boogie", "party", "groove"] },
    danceVariants([
      wave("tail-fin", 35, 2, 840),
      wave("fin-l", 25, 2, 840),
      wave("fin-top", 12, 1, 840),
      nod("head", 6, 840),
    ]),
  ),
];
