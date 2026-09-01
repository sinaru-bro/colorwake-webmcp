import type { Primitive } from "../../state/types";

export type PartClass = "arm" | "leg" | "head" | "other";

export const ROTATE_CAPS: Record<PartClass, { rotate: number; waveAngle: number; waveOffset: number }> = {
  arm: { rotate: 160, waveAngle: 60, waveOffset: 160 },
  leg: { rotate: 45, waveAngle: 30, waveOffset: 45 },
  head: { rotate: 30, waveAngle: 20, waveOffset: 30 },
  other: { rotate: 75, waveAngle: 45, waveOffset: 75 },
};

export function partClass(partId: string | undefined): PartClass | null {
  if (!partId) return null;
  if (/^(arm|wing|hand)(-|$)/.test(partId)) return "arm";
  if (/^(leg|foot)(-|$)/.test(partId)) return "leg";
  if (partId === "head" || /^ear(-|$)/.test(partId)) return "head";
  return "other";
}

export type ParamValue = number | string | boolean;

export interface ParamSpec {
  default: ParamValue;
  min?: number;
  max?: number;
  partMin?: number;
  partMax?: number;
  enum?: readonly string[];
  integer?: boolean;
}

export interface BuildContext {
  isPart: boolean;
  partClass: PartClass | null;
  speed: number;
}

/** One keyframe in viewBox units. Missing fields mean rest (0 / 1). */
export interface Frame {
  offset?: number;
  tx?: number;
  ty?: number;
  rotate?: number;
  sx?: number;
  sy?: number;
  opacity?: number;
}

export interface BuiltStep {
  unit: "viewBox";
  frames: Frame[];
  keyframes: Keyframe[];
  options: KeyframeEffectOptions;
  holds?: boolean;
}

export interface PrimitiveDef {
  id: Primitive;
  label: string;
  params: Record<string, ParamSpec>;
  defaultDurationMs: number;
  build(params: Record<string, ParamValue>, ctx: BuildContext): BuiltStep;
}

const REST: Frame = {};

/** Converts viewBox-unit frames to WAAPI keyframes; `scale` is the actor's px-per-viewBox-unit. */
export function toKeyframes(frames: Frame[], scale: number): Keyframe[] {
  return frames.map((f) => {
    const kf: Keyframe = {
      transform: `translate(${((f.tx ?? 0) * scale).toFixed(2)}px, ${((f.ty ?? 0) * scale).toFixed(2)}px) rotate(${f.rotate ?? 0}deg) scale(${f.sx ?? 1}, ${f.sy ?? 1})`,
    };
    if (f.offset !== undefined) kf.offset = f.offset;
    if (f.opacity !== undefined) kf.opacity = f.opacity;
    return kf;
  });
}

function built(frames: Frame[], holds = false): BuiltStep {
  const options: KeyframeEffectOptions = { composite: "accumulate" };
  if (holds) options.fill = "forwards";
  return { unit: "viewBox", frames, keyframes: toKeyframes(frames, 1), options, holds: holds || undefined };
}

function num(v: ParamValue): number {
  return typeof v === "number" ? v : Number(v);
}

function alternate(count: number, pos: Frame, neg: Frame): Frame[] {
  const frames: Frame[] = [REST];
  for (let i = 0; i < count; i++) frames.push(pos, neg);
  frames.push(REST);
  return frames;
}

export const PRIMITIVES: Record<Primitive, PrimitiveDef> = {
  move: {
    id: "move",
    label: "Move",
    defaultDurationMs: 1200,
    params: {
      dx: { default: 0, min: -400, max: 400, partMin: -120, partMax: 120 },
      dy: { default: 0, min: -400, max: 400, partMin: -120, partMax: 120 },
      path: { default: "line", enum: ["line", "arc"] },
      hold: { default: false },
    },
    build(p) {
      const dx = num(p.dx);
      const dy = num(p.dy);
      const end: Frame = { tx: dx, ty: dy };
      const frames: Frame[] = [REST];
      if (p.path === "arc") frames.push({ tx: dx / 2, ty: dy / 2 - Math.hypot(dx, dy) * 0.3 });
      frames.push(end);
      if (p.hold === true) return built(frames, true);
      if (p.path === "arc") frames.push({ tx: dx / 2, ty: dy / 2 - Math.hypot(dx, dy) * 0.3 });
      frames.push(REST);
      return built(frames);
    },
  },
  rotate: {
    id: "rotate",
    label: "Rotate",
    defaultDurationMs: 800,
    params: {
      from: { default: -15, min: -180, max: 180 },
      to: { default: 15, min: -180, max: 180 },
    },
    build(p) {
      const from = num(p.from);
      const to = num(p.to);
      return built([{ rotate: from }, { rotate: to }, { rotate: from }]);
    },
  },
  scale: {
    id: "scale",
    label: "Scale",
    defaultDurationMs: 600,
    params: {
      from: { default: 1, min: 0.5, max: 2, partMin: 0.6, partMax: 1.6 },
      to: { default: 1.2, min: 0.5, max: 2, partMin: 0.6, partMax: 1.6 },
    },
    build(p) {
      const from = num(p.from);
      const to = num(p.to);
      return built([
        { sx: from, sy: from },
        { sx: to, sy: to },
        { sx: from, sy: from },
      ]);
    },
  },
  bounce: {
    id: "bounce",
    label: "Bounce",
    defaultDurationMs: 700,
    params: {
      height: { default: 40, min: 0, max: 200, partMin: 0, partMax: 60 },
      squash: { default: 0.1, min: 0, max: 0.3 },
    },
    build(p) {
      const h = num(p.height);
      const s = num(p.squash);
      return built([
        { offset: 0 },
        { offset: 0.5, ty: -h },
        { offset: 0.9, sx: 1 + s, sy: 1 - s },
        { offset: 1 },
      ]);
    },
  },
  shake: {
    id: "shake",
    label: "Shake",
    defaultDurationMs: 500,
    params: {
      amplitude: { default: 8, min: 0, max: 40, partMin: 0, partMax: 15 },
      axis: { default: "x", enum: ["x", "y"] },
      cycles: { default: 4, min: 1, max: 10, integer: true },
    },
    build(p) {
      const a = num(p.amplitude);
      const key = p.axis === "y" ? "ty" : "tx";
      return built(alternate(num(p.cycles), { [key]: a }, { [key]: -a }));
    },
  },
  spin: {
    id: "spin",
    label: "Spin",
    defaultDurationMs: 800,
    params: {
      turns: { default: 1, min: 1, max: 3, partMin: 1, partMax: 2, integer: true },
      direction: { default: "cw", enum: ["cw", "ccw"] },
    },
    build(p) {
      const sign = p.direction === "ccw" ? -1 : 1;
      return built([{ rotate: 0 }, { rotate: 360 * num(p.turns) * sign }]);
    },
  },
  flip: {
    id: "flip",
    label: "Flip",
    defaultDurationMs: 600,
    params: { axis: { default: "y", enum: ["y", "x"] } },
    build(p) {
      return p.axis === "x"
        ? built([{ sy: 1 }, { sy: -1 }, { sy: 1 }])
        : built([{ sx: 1 }, { sx: -1 }, { sx: 1 }]);
    },
  },
  tilt: {
    id: "tilt",
    label: "Tilt",
    defaultDurationMs: 700,
    params: {
      angle: { default: 12, min: 0, max: 45, partMin: 0, partMax: 30 },
      side: { default: "both", enum: ["both", "left", "right"] },
    },
    build(p) {
      const a = num(p.angle);
      if (p.side === "left") return built([REST, { rotate: -a }, REST]);
      if (p.side === "right") return built([REST, { rotate: a }, REST]);
      return built([REST, { rotate: a }, { rotate: -a }, REST]);
    },
  },
  fade: {
    id: "fade",
    label: "Fade",
    defaultDurationMs: 800,
    params: {
      to: { default: 0.2, min: 0, max: 1 },
      flicker: { default: 1, min: 1, max: 6, integer: true },
    },
    build(p) {
      const to = num(p.to);
      const frames: Frame[] = [{ opacity: 1 }];
      for (let i = 0; i < num(p.flicker); i++) frames.push({ opacity: to }, { opacity: 1 });
      return built(frames);
    },
  },
  wave: {
    id: "wave",
    label: "Wave",
    defaultDurationMs: 900,
    params: {
      angle: { default: 20, min: 0, max: 60 },
      cycles: { default: 3, min: 1, max: 8, integer: true },
      offset: { default: 0, min: -120, max: 120 },
    },
    build(p) {
      const a = num(p.angle);
      const off = num(p.offset);
      return built(alternate(num(p.cycles), { rotate: off + a }, { rotate: off - a }));
    },
  },
};
