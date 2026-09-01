import { sketchById } from "../content/sketches/catalog";
import { ANCHORS, type Anchor, type Character, type Position, type StudioState } from "./types";

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

export function trayCount(s: StudioState): number {
  return s.characters.length;
}
