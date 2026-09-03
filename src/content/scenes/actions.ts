import type { Ease, PlaceId, Step } from "../../state/types";

/** A point in the place drawing's own units (1600 wide, 936 tall above the horizon; y = feet). */
export interface BandPoint {
  x: number;
  y: number;
}

/** One leg of a path: where the friend is at the end of it and how it gets there. */
export interface Waypoint extends BandPoint {
  durationMs: number;
  ease?: Ease;
  scale?: number;
  opacity?: number;
  /** Body angle in degrees, clockwise. */
  lean?: number;
}

/** Something a friend can do with a prop that is drawn in one place. */
export interface PlaceAction {
  id: string;
  place: PlaceId;
  label: string;
  sayings: string[];
  /** Caption after the friend's name, e.g. "is on the swing!" */
  caption: string;
  /** Where the friend goes first (feet). */
  at: BandPoint;
  /** Size while on the prop, relative to the friend's usual size. */
  scale?: number;
  /** A one-off path from `at`; the friend stays where it ends. */
  path?: Waypoint[];
  /** After the path, walk back to the spot the friend stood on before. */
  returnHome?: boolean;
  /** A back-and-forth swing about a point `pivotAbove` units above the feet, kept in step with a drawn prop. */
  pendulum?: { angle: number; pivotAbove: number; periodMs: number; sync?: string };
  /** Limb moves played alongside; parts a body lacks are skipped. */
  parts?: Step[];
  /** A drawn prop that reacts: a class added for a while. */
  prop?: { selector: string; className: string; atMs: number; forMs: number };
}

const legs = (angle: number, ms: number): Step[] => [
  { primitive: "rotate", part: "leg-l", params: { from: -angle, to: angle }, durationMs: ms },
  { primitive: "rotate", part: "leg-r", params: { from: angle, to: -angle }, durationMs: ms },
  { primitive: "rotate", part: "leg-fl", params: { from: -angle, to: angle }, durationMs: ms },
  { primitive: "rotate", part: "leg-br", params: { from: -angle, to: angle }, durationMs: ms },
  { primitive: "rotate", part: "wing-l", params: { from: -angle, to: angle }, durationMs: ms },
  { primitive: "rotate", part: "wing-r", params: { from: angle, to: -angle }, durationMs: ms },
  { primitive: "wave", part: "tail-fin", params: { angle, cycles: 2 }, durationMs: ms * 2 },
];

/** Walk up to a door, pop inside for a moment, come back out. */
function inside(
  place: PlaceId,
  at: BandPoint,
  sayings: string[],
  holdMs: number,
  prop?: PlaceAction["prop"],
): PlaceAction {
  return {
    id: prop ? "bus" : "inside",
    place,
    label: prop ? "Ride the bus" : "Go inside",
    sayings,
    caption: prop ? "rides the bus!" : "pops inside!",
    at,
    path: [
      { x: at.x, y: at.y - 40, durationMs: 700, ease: "ease-in", scale: 0.55, opacity: 0 },
      { x: at.x, y: at.y - 40, durationMs: holdMs, scale: 0.55, opacity: 0 },
      { x: at.x, y: at.y, durationMs: 600, ease: "ease-out", scale: 1, opacity: 1 },
    ],
    ...(prop ? { prop } : {}),
  };
}

export const PLACE_ACTIONS: PlaceAction[] = [
  {
    id: "swing",
    place: "playground",
    label: "Swing",
    sayings: ["ride the swing", "swing set", "push me"],
    caption: "is on the swing!",
    at: { x: 400, y: 858 },
    scale: 0.6,
    pendulum: { angle: 5, pivotAbove: 298, periodMs: 5200, sync: ".swing" },
    parts: legs(14, 1300),
  },
  {
    id: "slide",
    place: "playground",
    label: "Slide",
    sayings: ["go down the slide", "climb the ladder", "wheee"],
    caption: "zooms down the slide!",
    at: { x: 1150, y: 936 },
    scale: 0.6,
    path: [
      { x: 1150, y: 556, durationMs: 1500, ease: "ease-in-out" },
      { x: 1240, y: 556, durationMs: 350, ease: "ease-in-out" },
      { x: 1400, y: 740, durationMs: 550, ease: "ease-in", lean: -18 },
      { x: 1540, y: 926, durationMs: 380, ease: "ease-out", lean: -8 },
      { x: 1580, y: 936, durationMs: 260, ease: "ease-out" },
    ],
    returnHome: true,
    parts: legs(20, 400),
  },
  inside("school", { x: 1487, y: 936 }, ["ride the bus", "get on the bus", "school bus"], 2600, {
    selector: ".bus",
    className: "bus--go",
    atMs: 700,
    forMs: 2600,
  }),
  inside("school", { x: 500, y: 936 }, ["go in", "go to class", "into the school"], 1500),
  inside("home", { x: 390, y: 936 }, ["go in", "go home", "into the house"], 1500),
];

export function actionsAt(place: PlaceId | null): PlaceAction[] {
  return place ? PLACE_ACTIONS.filter((a) => a.place === place) : [];
}

/** The action for `id` here, or where else it can be done. */
export function findAction(
  id: string,
  place: PlaceId | null,
): { action: PlaceAction | null; here: boolean; places: PlaceId[] } {
  const matches = PLACE_ACTIONS.filter((a) => a.id === id);
  const here = matches.find((a) => a.place === place) ?? null;
  return {
    action: here ?? matches[0] ?? null,
    here: here !== null,
    places: [...new Set(matches.map((a) => a.place))],
  };
}
