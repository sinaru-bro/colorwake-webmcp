import { actionsAt } from "../content/scenes/actions";
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

function describeCharacter(c: Character, cast: string[]) {
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
    onStage: cast.includes(c.id),
    playing: playing
      ? playing.action
        ? { action: playing.action, loop: playing.loop }
        : {
            motion: playing.preset,
            ...(playing.variant ? { variant: playing.variant } : {}),
            loop: playing.loop,
          }
      : null,
  };
}

export function describeState(s: StudioState): Record<string, unknown> {
  const characters = s.characters.map((c) => describeCharacter(c, s.cast));
  const base = {
    mode: s.mode,
    characters,
    active: s.activeCharacterId,
    tray: { count: s.characters.length, capacity: LIMITS.maxCharacters },
    stage: { count: s.cast.length, capacity: LIMITS.maxOnStage },
    tool: s.tool,
    scene: s.scene,
    placeActions: actionsAt(s.scene.place).map((a) => a.id),
    nextQuestion: nextQuestion(s.scene),
  };
  if (characters.length === 0) {
    return { ...base, hint: "Nothing colored yet. Offer a sketch with list_sketches / pick_sketch." };
  }
  if (JSON.stringify(base).length <= STATE_SIZE_LIMIT) return base;
  const brief = characters.map(({ colors: _c, uncolored: _u, ...rest }) => rest);
  if (JSON.stringify({ ...base, characters: brief }).length <= STATE_SIZE_LIMIT) {
    return { ...base, characters: brief, truncated: true };
  }
  return {
    ...base,
    characters: brief.map((c) =>
      c.onStage
        ? c
        : { id: c.id, sketch: c.sketch, displayName: c.displayName, progress: c.progress, onStage: false },
    ),
    truncated: true,
  };
}
