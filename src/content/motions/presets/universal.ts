import type { Preset } from "../../../state/types";
import { fade, jumpVariants, lean, many, one, scale, spin } from "./shared";

export const UNIVERSAL_PRESETS: Preset[] = [
  many({ id: "jump", rig: "any", label: "Jump", sayings: ["hop", "leap", "bounce"] }, jumpVariants([])),
  one({
    id: "spin",
    rig: "any",
    label: "Spin",
    sayings: ["twirl", "turn around", "whirl"],
    mode: "parallel",
    loop: 2,
    steps: [{ ...spin(1, 800), params: { turns: 1, direction: "cw" } }, scale(1, 1.1, 800)],
  }),
  one({
    id: "wiggle",
    rig: "any",
    label: "Wiggle",
    sayings: ["dance", "shimmy", "jiggle"],
    mode: "parallel",
    loop: true,
    steps: [lean(-6, 6, 500), scale(1, 1.06, 500)],
  }),
  one({
    id: "grow",
    rig: "any",
    label: "Grow",
    sayings: ["get bigger", "big", "giant"],
    mode: "sequence",
    loop: false,
    steps: [{ ...scale(1, 1.4, 900), ease: "ease-in-out" }],
  }),
  one({
    id: "hide",
    rig: "any",
    label: "Hide",
    sayings: ["shrink", "peekaboo", "disappear"],
    mode: "parallel",
    loop: false,
    steps: [fade(0.15, 700), scale(1, 0.7, 700)],
  }),
  one({
    id: "stop",
    rig: "any",
    label: "Stop",
    sayings: ["freeze", "stay still", "hold on"],
    mode: "parallel",
    loop: false,
    steps: [],
  }),
];
