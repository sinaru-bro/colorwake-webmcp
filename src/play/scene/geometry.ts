import type { CSSProperties } from "react";
import { HORIZON } from "../../content/scenes";
import type { Position } from "../../state/types";

export const HORIZON_STYLE = { "--horizon": `${HORIZON * 100}%` } as CSSProperties;

export const W = 1600;
/** Height of the bands above the horizon (far, near, glow). */
export const ABOVE = 936;
/** Height of the ground band below the horizon. */
export const BELOW = 264;
/** Height of the foreground strip along the bottom edge. */
export const FRONT = 120;

export function bladeStrip(top: number, bottom: number, step = 40, salt = 0): string {
  const pts: string[] = [];
  for (let x = 0; x <= W; x += step) {
    const i = x / step + salt;
    const y = i % 2 ? top + ((i * 7) % 14) : top + 18 + ((i * 5) % 12);
    pts.push(`L${x} ${y}`);
  }
  return `M0 ${bottom} L0 ${top + 20} ${pts.join(" ")} L${W} ${bottom} Z`;
}

export interface StageSize {
  w: number;
  h: number;
}

/** Pixels per drawing unit for the bands above the horizon (they fit the stage with `meet`). */
export function bandScale(stage: StageSize): number {
  return Math.min(stage.w / W, (stage.h * HORIZON) / ABOVE);
}

/** A point in the place drawing (x, y = feet) as a stage position; without a stage, assumes the drawing spans the width. */
export function bandToStage(pt: { x: number; y: number }, stage: StageSize | null): Position {
  if (!stage || !stage.w || !stage.h) return { x: pt.x / W, y: HORIZON - ((ABOVE - pt.y) / ABOVE) * HORIZON };
  const s = bandScale(stage);
  const left = (stage.w - W * s) / 2;
  return { x: (left + pt.x * s) / stage.w, y: (stage.h * HORIZON - (ABOVE - pt.y) * s) / stage.h };
}
