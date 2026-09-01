import { sketchById } from "../content/sketches/catalog";
import {
  coloredRegions,
  displayName,
  dominantColors,
  isColored,
  nearestAnchor,
  nextQuestion,
  progress,
  regionColors,
} from "../state/selectors";
import { LIMITS, type Character, type StudioState } from "../state/types";
import { uiStore } from "../state/ui";
import { getEngine } from "./engineBridge";

export const STATE_SIZE_LIMIT = 1500;

export interface CharacterSummary {
  id: string;
  displayName: string;
  anchor: string;
}

export function summarize(c: Character): CharacterSummary {
  return { id: c.id, displayName: displayName(c), anchor: nearestAnchor(c.position) };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function describeCharacter(c: Character) {
  const sketch = sketchById(c.sketchId);
  const colors = regionColors(c);
  const done = coloredRegions(c);
  const uncolored = (sketch?.regions ?? []).map((r) => r.id).filter((id) => !done.has(id));
  const playing = getEngine().current(c.id);
  return {
    id: c.id,
    sketch: c.sketchId,
    title: sketch?.title ?? c.sketchId,
    displayName: displayName(c),
    rig: sketch?.rig ?? null,
    colored: isColored(c),
    progress: round(progress(c)),
    colors,
    uncolored,
    dominant: dominantColors(c),
    position: { x: round(c.position.x), y: round(c.position.y) },
    anchor: nearestAnchor(c.position),
    playing: playing ? { motion: playing.preset, loop: playing.loop } : null,
  };
}

export function describeState(s: StudioState): Record<string, unknown> {
  const characters = s.characters.map(describeCharacter);
  const base = {
    mode: s.mode,
    characters,
    active: s.activeCharacterId,
    tray: { count: s.characters.length, capacity: LIMITS.maxCharacters },
    tool: s.tool,
    scene: s.scene,
    nextQuestion: nextQuestion(s.scene, uiStore.getState().skipped),
  };
  if (characters.length === 0) {
    return { ...base, hint: "Nothing colored yet. Offer a sketch with list_sketches / pick_sketch." };
  }
  if (JSON.stringify(base).length <= STATE_SIZE_LIMIT) return base;
  return {
    ...base,
    characters: characters.map(({ colors: _c, uncolored: _u, ...rest }) => rest),
    truncated: true,
  };
}
