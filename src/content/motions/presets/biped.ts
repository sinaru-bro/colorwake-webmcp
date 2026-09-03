import type { Preset } from "../../../state/types";
import { bounce, danceVariants, flyVariants, many, move, nod, one, rot, swimVariants, wave } from "./shared";

const stride = (legs: number, arms: number, ms: number) => [
  rot("leg-l", -legs, legs, ms),
  rot("leg-r", legs, -legs, ms),
  rot("arm-l", arms, -arms, ms),
  rot("arm-r", -arms, arms, ms),
];

export const BIPED_PRESETS: Preset[] = [
  one({
    id: "greet",
    rig: "biped",
    label: "Say hi",
    sayings: ["hi", "hello", "bye-bye", "wave"],
    mode: "parallel",
    loop: false,
    steps: [wave("arm-r", 18, 4, 1400, -110), rot("head", -5, 5, 700), bounce(4, 700)],
  }),
  many(
    { id: "dance", rig: "biped", label: "Dance", sayings: ["boogie", "party", "groove"] },
    danceVariants([
      wave("arm-l", 25, 1, 840, 60),
      wave("arm-r", 25, 1, 840, -60),
      nod("head", 8, 840),
      rot("leg-l", -8, 8, 420),
    ]),
  ),
  many({ id: "walk", rig: "biped", label: "Walk", sayings: ["stroll", "march", "go"] }, [
    {
      id: "stroll",
      label: "Stroll",
      mode: "parallel",
      loop: true,
      steps: [...stride(20, 15, 520), bounce(5, 260), move(700, 0, "line", 4160)],
    },
    {
      id: "march",
      label: "March",
      mode: "parallel",
      loop: true,
      steps: [...stride(28, 22, 380), bounce(8, 190), move(700, 0, "line", 2660)],
    },
  ]),
  many(
    { id: "swim", rig: "biped", label: "Swim", sayings: ["paddle", "go swimming", "front crawl"] },
    swimVariants({ rotate: 80 }, [
      wave("arm-l", 40, 1, 700, 60),
      { ...wave("arm-r", 40, 1, 700, -60), delayMs: 350 },
      rot("leg-l", -15, 15, 350),
      rot("leg-r", 15, -15, 350),
    ]),
  ),
  many(
    { id: "fly", rig: "biped", label: "Fly", sayings: ["float", "soar", "superhero"] },
    flyVariants({ rotate: 70 }, [
      wave("arm-l", 5, 1, 900, 150),
      wave("arm-r", 5, 1, 900, -150),
      rot("leg-l", -6, 6, 700),
      rot("leg-r", 6, -6, 700),
    ]),
  ),
  one({
    id: "cheer",
    rig: "biped",
    label: "Cheer",
    sayings: ["hooray", "yay", "celebrate"],
    mode: "parallel",
    loop: 2,
    steps: [
      wave("arm-l", 15, 4, 1200, 150),
      wave("arm-r", 15, 4, 1200, -150),
      bounce(30, 600),
      rot("head", -6, 6, 600),
    ],
  }),
];
