import { PLACES, TIMES, WEATHERS } from "../content/scenes";
import { sketchById } from "../content/sketches/catalog";
import {
  ANCHORS,
  type Anchor,
  type Character,
  type Paint,
  type Position,
  type Scene,
  type SceneAxis,
  type Sketch,
  type StudioState,
} from "./types";

export function activeCharacter(s: StudioState): Character | null {
  return s.characters.find((c) => c.id === s.activeCharacterId) ?? null;
}

export function coloredRegions(c: Character): Set<string> {
  const regions = new Set(Object.keys(c.paint.fills));
  for (const stroke of c.paint.strokes) regions.add(stroke.region);
  return regions;
}

export function progress(c: Character): number {
  const sketch = sketchById(c.sketchId);
  if (!sketch || sketch.regions.length === 0) return 0;
  const known = new Set(sketch.regions.map((r) => r.id));
  let n = 0;
  for (const id of coloredRegions(c)) if (known.has(id)) n += 1;
  return n / sketch.regions.length;
}

export function isColored(c: Character): boolean {
  return coloredRegions(c).size > 0;
}

export function coloredCharacters(s: StudioState): Character[] {
  return s.characters.filter(isColored);
}

export function regionColors(c: Character): Record<string, string> {
  const colors: Record<string, string> = { ...c.paint.fills };
  for (const stroke of c.paint.strokes) colors[stroke.region] = stroke.color;
  return colors;
}

export function dominantColors(c: Character, limit = 2): string[] {
  const counts = new Map<string, number>();
  for (const color of Object.values(regionColors(c))) counts.set(color, (counts.get(color) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([color]) => color);
}

export function displayName(c: Character): string {
  const title = sketchById(c.sketchId)?.title ?? c.sketchId;
  const [top] = dominantColors(c, 1);
  return (top ? `${top} ${title}` : title).toLowerCase();
}

export type CharacterLookup =
  { kind: "found"; character: Character } | { kind: "ambiguous"; candidates: Character[] } | { kind: "none" };

export function findCharacter(s: StudioState, ref: string): CharacterLookup {
  const byId = s.characters.find((c) => c.id === ref);
  if (byId) return { kind: "found", character: byId };
  const bySketch = s.characters.filter((c) => c.sketchId === ref);
  if (bySketch.length === 1) return { kind: "found", character: bySketch[0] };
  if (bySketch.length > 1) return { kind: "ambiguous", candidates: bySketch };
  return { kind: "none" };
}

export function nearestAnchor(p: Position): Anchor {
  let best: Anchor = "center";
  let bestD = Infinity;
  for (const [name, a] of Object.entries(ANCHORS) as [Anchor, Position][]) {
    const d = (a.x - p.x) ** 2 + (a.y - p.y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = name;
    }
  }
  return best;
}

/** Pictures newest first; the reverse keeps same-moment pictures newest-first through the stable sort. */
export function newestFirst(characters: Character[]): Character[] {
  return [...characters].reverse().sort((a, b) => b.createdAt - a.createdAt);
}

/** The two newest pictures that still have a sketch, front first, for the stacked thumbnails. */
export function newestStack(characters: Character[]): { id: string; sketch: Sketch; paint: Paint }[] {
  return newestFirst(characters)
    .slice(0, 2)
    .flatMap((c) => {
      const sketch = sketchById(c.sketchId);
      return sketch ? [{ id: c.id, sketch, paint: c.paint }] : [];
    });
}

/** Characters on the play screen, in creation order. */
export function castCharacters(s: StudioState): Character[] {
  return s.characters.filter((c) => s.cast.includes(c.id));
}

export interface SceneQuestion {
  axis: SceneAxis;
  ask: string;
  options: string[];
}

const QUESTIONS: Array<{ axis: SceneAxis; ask: string; options: () => string[] }> = [
  { axis: "place", ask: "Where are we?", options: () => PLACES.map((p) => p.id) },
  { axis: "time", ask: "Is it day or night?", options: () => TIMES.map((t) => t.id) },
  { axis: "weather", ask: "What's the weather?", options: () => WEATHERS.map((w) => w.id) },
];

/** The first scene axis still unset, shared by the on-screen guide and tool results. */
export function nextQuestion(scene: Scene): SceneQuestion | null {
  for (const q of QUESTIONS) {
    if (scene[q.axis] === null) return { axis: q.axis, ask: q.ask, options: q.options() };
  }
  return null;
}
