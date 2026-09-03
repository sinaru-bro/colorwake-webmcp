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
