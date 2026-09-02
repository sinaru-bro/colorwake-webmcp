import type { Facing } from "../../state/types";

/** Free travel from the actor's current spot, in viewBox units (all ≥ 0). */
export interface Room {
  left: number;
  right: number;
  up: number;
  down: number;
}

/** How the body is shown: mirrored or not, and leaning by a held pose angle. */
export interface Look {
  sx: 1 | -1;
  lean: number;
}

/** Horizontal travel shorter than this is a shuffle: the actor does not turn to face it. */
export const FACE_MIN_DX = 200;
/** Time the body takes to turn around. */
export const TURN_MS = 200;
/** Time the body takes to lie down into a pose, or to get back up. */
export const POSE_MS = 300;
/** The squeeze at the middle of a turn — the body is seen edge-on. */
const EDGE_SX = 0.06;
const EDGE_SY = 1.06;

/**
 * Keeps whole-actor travel on the stage. Presets (`mayFlip`) head for the roomier side when
 * their preferred side is short; explicit steps keep their direction and are only shortened.
 */
export function fitTravel(dx: number, dy: number, room: Room, mayFlip: boolean): { dx: number; dy: number } {
  let x = dx;
  if (mayFlip && x > 0 && x > room.right && room.left > room.right) x = -x;
  else if (mayFlip && x < 0 && -x > room.left && room.right > room.left) x = -x;
  x = x > 0 ? Math.min(x, room.right) : Math.max(x, -room.left);
  const y = dy < 0 ? Math.max(dy, -room.up) : Math.min(dy, room.down);
  return { dx: x, dy: y };
}

/** scaleX that makes a drawing with the given natural facing look toward `dir` (+1 = right). */
export function facingScale(faces: Facing, dir: 1 | -1): 1 | -1 {
  if (faces === "front") return 1;
  return (faces === "right") === dir > 0 ? 1 : -1;
}

/**
 * How a body looks while heading `dir` with a pose. Side-on drawings mirror to face the way
 * they go and keep the pose's own angle (the mirror flips it on screen); front-on drawings
 * never mirror, so the angle itself follows the direction.
 */
export function lookFor(faces: Facing, dir: 1 | -1, pose: number): Look {
  if (faces === "front") return { sx: 1, lean: pose * dir };
  return { sx: facingScale(faces, dir), lean: pose };
}

/** The transform for a look; the lean pivots `centerPx` above the feet. Always the same four functions so keyframes interpolate part by part. */
export function lookTransform(look: Look, centerPx: number, edge = false): string {
  const sx = edge ? EDGE_SX : look.sx;
  const sy = edge ? EDGE_SY : 1;
  const c = centerPx.toFixed(2);
  return `scale(${sx}, ${sy}) translate(0px, -${c}px) rotate(${look.lean}deg) translate(0px, ${c}px)`;
}

/** Keyframes for one change of look; mirroring passes through edge-on. */
export function turnFrames(from: Look, to: Look, centerPx: number): Keyframe[] {
  if (from.sx === to.sx)
    return [{ transform: lookTransform(from, centerPx) }, { transform: lookTransform(to, centerPx) }];
  const mid = { sx: from.sx, lean: (from.lean + to.lean) / 2 };
  return [
    { transform: lookTransform(from, centerPx), easing: "ease-in" },
    { transform: lookTransform(mid, centerPx, true), easing: "ease-out", offset: 0.5 },
    { transform: lookTransform(to, centerPx) },
  ];
}

/**
 * Look over one iteration of a travel step. A there-and-back step turns at the far end
 * (offset 0.5) and again just before the iteration ends, so loops stay continuous; `w` is the
 * turn length as a fraction of the iteration. `home` is null when the step does not come back.
 */
export function travelFacingFrames(there: Look, home: Look | null, w: number, centerPx: number): Keyframe[] {
  const T = lookTransform(there, centerPx);
  if (!home) return [{ transform: T }, { transform: T }];
  const H = lookTransform(home, centerPx);
  const M = lookTransform(
    { sx: there.sx, lean: (there.lean + home.lean) / 2 },
    centerPx,
    there.sx !== home.sx,
  );
  const h = w / 2;
  return [
    { offset: 0, transform: T },
    { offset: 0.5 - h, transform: T, easing: "ease-in" },
    { offset: 0.5, transform: M, easing: "ease-out" },
    { offset: 0.5 + h, transform: H },
    { offset: 1 - w, transform: H, easing: "ease-in" },
    { offset: 1 - h, transform: M, easing: "ease-out" },
    { offset: 1, transform: T },
  ];
}

/** Turn length as a fraction of a travel step, capped so short steps still mostly travel. */
export function turnFraction(durationMs: number): number {
  return Math.min(0.24, TURN_MS / durationMs);
}
