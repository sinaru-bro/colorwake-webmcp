import { isColored } from "./selectors";
import type { StudioState } from "./types";

/** The picture that should fly from the canvas onto the play screen when `prev` becomes `next`, or null. */
export function flyingCharacter(prev: StudioState, next: StudioState): string | null {
  if (prev.mode !== "color" || next.mode !== "play") return null;
  const id = prev.activeCharacterId;
  if (!id) return null;
  const character = next.characters.find((c) => c.id === id);
  return character && isColored(character) ? id : null;
}

/** The colored picture that leaves the canvas for My friends when `prev` becomes `next` (canvas emptied, still coloring), or null. */
export function stashedCharacter(prev: StudioState, next: StudioState): string | null {
  if (prev.mode !== "color" || next.mode !== "color") return null;
  const id = prev.activeCharacterId;
  if (!id || next.activeCharacterId !== null) return null;
  const character = next.characters.find((c) => c.id === id);
  return character && isColored(character) ? id : null;
}
