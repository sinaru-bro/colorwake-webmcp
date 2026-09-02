import type { Motion, Pose, Preset, Step, Variant } from "../../../state/types";

type Path = "line" | "arc";

export const rot = (part: string, from: number, to: number, durationMs: number, delayMs?: number): Step => ({
  primitive: "rotate",
  part,
  params: { from, to },
  durationMs,
  ...(delayMs ? { delayMs } : {}),
});

export const wave = (part: string, angle: number, cycles: number, durationMs: number, offset = 0): Step => ({
  primitive: "wave",
  part,
  params: offset ? { angle, cycles, offset } : { angle, cycles },
  durationMs,
});

export const move = (dx: number, dy: number, path: Path, durationMs: number): Step => ({
  primitive: "move",
  params: { dx, dy, path },
  durationMs,
});

export const bounce = (height: number, durationMs: number, squash?: number): Step => ({
  primitive: "bounce",
  params: squash === undefined ? { height } : { height, squash },
  durationMs,
});

export const tilt = (angle: number, durationMs: number, side: "both" | "left" | "right" = "both"): Step => ({
  primitive: "tilt",
  params: { angle, side },
  durationMs,
});

/** A head (or other part) tilting both ways. */
export const nod = (part: string, angle: number, durationMs: number): Step => ({
  primitive: "tilt",
  part,
  params: { angle, side: "both" },
  durationMs,
});

export const lean = (from: number, to: number, durationMs: number): Step => ({
  primitive: "rotate",
  params: { from, to },
  durationMs,
});

export const scale = (from: number, to: number, durationMs: number, part?: string): Step => ({
  primitive: "scale",
  ...(part ? { part } : {}),
  params: { from, to },
  durationMs,
});

export const spin = (turns: number, durationMs: number): Step => ({
  primitive: "spin",
  params: { turns },
  durationMs,
});

export const fade = (to: number, durationMs: number, flicker?: number): Step => ({
  primitive: "fade",
  params: flicker === undefined ? { to } : { to, flicker },
  durationMs,
});

export const shake = (amplitude: number, cycles: number, durationMs: number, part?: string): Step => ({
  primitive: "shake",
  ...(part ? { part } : {}),
  params: { amplitude, cycles },
  durationMs,
});

type Base = Omit<Preset, "variants">;

/** A preset with a single way of doing it. */
export function one(p: Base & Motion): Preset {
  const { steps, mode, loop, pose, ...base } = p;
  return {
    ...base,
    variants: [{ id: "default", label: p.label, steps, mode, loop, ...(pose ? { pose } : {}) }],
  };
}

/** A preset the helper can vary. */
export function many(p: Base, variants: Variant[]): Preset {
  return { ...p, variants };
}

function loops(id: string, label: string, pose: Pose | undefined, steps: Step[]): Variant {
  return { id, label, mode: "parallel", loop: true, steps, ...(pose ? { pose } : {}) };
}

/** Flying: the body motion is shared; `limbs` (≤ 4 steps) is what this body type does with wings, arms or legs. */
export function flyVariants(pose: Pose | undefined, limbs: Step[]): Variant[] {
  return [
    loops("around", "Around", pose, [move(640, -320, "arc", 4400), tilt(8, 4400), bounce(6, 600), ...limbs]),
    loops("away", "Far away", pose, [
      move(700, -300, "arc", 5200),
      scale(1, 0.5, 5200),
      fade(0.7, 5200),
      ...limbs,
    ]),
    loops("high", "Up high", pose, [move(0, -640, "line", 3600), scale(1, 1.15, 3600), ...limbs]),
    loops("loop", "Loop-the-loop", pose, [move(560, -320, "arc", 4000), spin(1, 4000), ...limbs]),
  ];
}

/** Swimming: across the water or treading in place. `limbs` ≤ 5 steps. */
export function swimVariants(pose: Pose | undefined, limbs: Step[]): Variant[] {
  return [
    loops("across", "Across", pose, [move(720, 40, "line", 5600), tilt(4, 5600), bounce(6, 900), ...limbs]),
    loops("bob", "Bobbing", pose, [bounce(10, 1200), tilt(6, 2400), ...limbs]),
  ];
}

/** Dancing: four grooves with the same limb moves. `limbs` ≤ 4 steps. */
export function danceVariants(limbs: Step[]): Variant[] {
  return [
    loops("bop", "Bop", undefined, [bounce(14, 420), lean(-6, 6, 840), move(160, 0, "line", 1680), ...limbs]),
    loops("twist", "Twist", undefined, [lean(-12, 12, 600), scale(1, 1.06, 600), bounce(6, 300), ...limbs]),
    loops("hop", "Hop", undefined, [bounce(40, 480), move(120, 0, "arc", 960), ...limbs]),
    loops("spin", "Spin", undefined, [spin(1, 1000), bounce(20, 500), ...limbs]),
  ];
}

/** Jumping: a little hop or a big leap. `limbs` ≤ 6 steps. */
export function jumpVariants(limbs: Step[]): Variant[] {
  return [
    { id: "hop", label: "Hop", mode: "parallel", loop: 2, steps: [bounce(70, 600), ...limbs] },
    {
      id: "high",
      label: "Big jump",
      mode: "parallel",
      loop: 2,
      steps: [bounce(150, 860, 0.15), { ...shake(3, 2, 200), delayMs: 860 }, ...limbs],
    },
  ];
}
