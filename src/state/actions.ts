import { sketchById } from "../content/sketches/catalog";
import { newId } from "../lib/ids";
import { activeCharacter, coloredCharacters, isColored } from "./selectors";
import { getState, patch, replaceState, initialState } from "./store";
import {
  ANCHORS,
  LIMITS,
  type Character,
  type PlaceId,
  type Position,
  type Stroke,
  type StudioState,
  type TimeId,
  type ToolState,
  type WeatherId,
} from "./types";
import { ui } from "./ui";

export type ActionFailure = { ok: false; code: string };

const GROUND_Y = 0.78;
const AUTO_LAYOUT: Record<number, number[]> = {
  1: [0.5],
  2: [0.35, 0.65],
  3: [0.2, 0.5, 0.8],
};

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/** Seats on-stage friends in fixed ground slots; a hand-placed friend keeps its spot and its slot. */
function withAutoLayout(characters: Character[], cast: string[]): Character[] {
  const xs = AUTO_LAYOUT[Math.min(LIMITS.maxOnStage, cast.length)] ?? AUTO_LAYOUT[1];
  return characters.map((c) => {
    if (c.placement !== "auto" || !cast.includes(c.id)) return c;
    const x = xs[Math.min(cast.indexOf(c.id), xs.length - 1)];
    return { ...c, position: { x, y: GROUND_Y } };
  });
}

/** Adds a character to the play screen; when it is full, the longest-standing one steps off. */
function join(cast: string[], id: string): string[] {
  return cast.includes(id) ? cast : [...cast, id].slice(-LIMITS.maxOnStage);
}

/** Drops characters that no longer exist; an empty play screen gets the newest colored ones. */
function settleCast(cast: string[], characters: Character[]): string[] {
  const kept = cast.filter((id) => characters.some((c) => c.id === id && isColored(c)));
  if (kept.length > 0) return kept;
  return characters
    .filter(isColored)
    .slice(-LIMITS.maxOnStage)
    .map((c) => c.id);
}

/** State for a colored picture leaving the canvas: it joins the play screen. */
function stashed(st: StudioState, character: Character | null): { cast: string[]; characters: Character[] } {
  const cast = character && isColored(character) ? join(st.cast, character.id) : st.cast;
  return { cast, characters: withAutoLayout(st.characters, cast) };
}

function newCharacter(sketchId: string): Character {
  return {
    id: newId("c"),
    sketchId,
    paint: { fills: {}, strokes: [] },
    position: { ...ANCHORS.center },
    placement: "auto",
    scale: 1,
    createdAt: Date.now(),
  };
}

function snapshotForUndo(c: Character): void {
  ui.pushUndo(c.id, c.paint);
}

export type PickResult =
  | { ok: true; character: Character; replaced: boolean; switchedTo: "color" | null }
  | { ok: false; code: "unknown_sketch" | "tray_full" };

export function pickSketch(sketchId: string): PickResult {
  if (!sketchById(sketchId)) return { ok: false, code: "unknown_sketch" };
  const s = getState();
  const switchedTo = s.mode === "play" ? "color" : null;
  const active = activeCharacter(s);
  if (active && !isColored(active)) {
    const replaced = { ...active, sketchId, paint: { fills: {}, strokes: [] } };
    ui.clearUndo(active.id);
    patch((st) => ({
      mode: "color",
      characters: st.characters.map((c) => (c.id === active.id ? replaced : c)),
    }));
    return { ok: true, character: replaced, replaced: true, switchedTo };
  }
  if (s.characters.length >= LIMITS.maxCharacters) return { ok: false, code: "tray_full" };
  const created = newCharacter(sketchId);
  patch((st) => ({
    mode: "color",
    ...stashed({ ...st, characters: [...st.characters, created] }, active),
    activeCharacterId: created.id,
  }));
  return { ok: true, character: created, replaced: false, switchedTo };
}

export function fillRegion(regionId: string, color?: string): boolean {
  const s = getState();
  const active = activeCharacter(s);
  if (!active) return false;
  const next = color ?? s.tool.color;
  if (active.paint.fills[regionId] === next) return false;
  snapshotForUndo(active);
  patch((st) => ({
    characters: st.characters.map((c) =>
      c.id === active.id ? { ...c, paint: { ...c.paint, fills: { ...c.paint.fills, [regionId]: next } } } : c,
    ),
  }));
  return true;
}

export function addStroke(stroke: Omit<Stroke, "id">): boolean {
  const s = getState();
  const active = activeCharacter(s);
  if (!active || stroke.points.length < 2) return false;
  snapshotForUndo(active);
  const strokes = [...active.paint.strokes, { ...stroke, id: newId("s") }].slice(
    -LIMITS.maxStrokesPerCharacter,
  );
  patch((st) => ({
    characters: st.characters.map((c) => (c.id === active.id ? { ...c, paint: { ...c.paint, strokes } } : c)),
  }));
  return true;
}

export function undo(): boolean {
  const active = activeCharacter(getState());
  if (!active) return false;
  const paint = ui.popUndo(active.id);
  if (!paint) return false;
  patch((st) => ({ characters: st.characters.map((c) => (c.id === active.id ? { ...c, paint } : c)) }));
  return true;
}

export function setTool(update: Partial<ToolState>): ToolState {
  patch((st) => ({ tool: { ...st.tool, ...update } }));
  return getState().tool;
}

export type EnterPlayResult =
  | { ok: true; saved: string | null; dropped: string | null; already: boolean }
  | { ok: false; code: "not_colored_yet" };

export function enterPlay(): EnterPlayResult {
  const s = getState();
  const active = activeCharacter(s);
  if (s.mode === "play") return { ok: true, saved: null, dropped: null, already: true };
  if (active && isColored(active)) {
    patch((st) => {
      const cast = settleCast(join(st.cast, active.id), st.characters);
      return { mode: "play", cast, characters: withAutoLayout(st.characters, cast) };
    });
    return { ok: true, saved: active.id, dropped: null, already: false };
  }
  if (coloredCharacters(s).length === 0) return { ok: false, code: "not_colored_yet" };
  const dropped = active?.id ?? null;
  if (dropped) ui.clearUndo(dropped);
  patch((st) => {
    const characters = st.characters.filter((c) => c.id !== dropped);
    const cast = settleCast(st.cast, characters);
    return {
      mode: "play",
      cast,
      characters: withAutoLayout(characters, cast),
      activeCharacterId: coloredCharacters(st).at(-1)?.id ?? null,
    };
  });
  return { ok: true, saved: null, dropped, already: false };
}

export type FinishResult = { ok: true; saved: string } | { ok: false; code: "not_colored_yet" };

/** Puts the colored picture on the canvas away in My friends and leaves the canvas empty. */
export function finishPicture(): FinishResult {
  const active = activeCharacter(getState());
  if (!active || !isColored(active)) return { ok: false, code: "not_colored_yet" };
  patch((st) => ({ mode: "color", ...stashed(st, active), activeCharacterId: null }));
  return { ok: true, saved: active.id };
}

export type ColorAnotherResult = { ok: true; saved: string | null; already: boolean };

export function colorAnother(): ColorAnotherResult {
  const s = getState();
  const active = activeCharacter(s);
  if (s.mode === "color" && !active) return { ok: true, saved: null, already: true };
  const keep = active && isColored(active);
  patch((st) => ({
    mode: "color",
    ...stashed(
      {
        ...st,
        characters: keep || !active ? st.characters : st.characters.filter((c) => c.id !== active.id),
      },
      active,
    ),
    activeCharacterId: null,
  }));
  if (active && !keep) ui.clearUndo(active.id);
  return { ok: true, saved: keep ? active.id : null, already: false };
}

/** Puts a picture from My friends back on the canvas; a blank picture left behind is dropped. */
export function selectCharacter(id: string): boolean {
  const s = getState();
  if (!s.characters.some((c) => c.id === id)) return false;
  const active = activeCharacter(s);
  const drop = active && active.id !== id && !isColored(active) ? active.id : null;
  if (drop) ui.clearUndo(drop);
  patch((st) => ({
    mode: "color",
    ...stashed({ ...st, characters: st.characters.filter((c) => c.id !== drop) }, active),
    activeCharacterId: id,
  }));
  return true;
}

/** Puts a friend on the play screen or takes it off; returns whether it is on now, or null if unknown. */
export function toggleOnStage(id: string): boolean | null {
  const s = getState();
  const character = s.characters.find((c) => c.id === id);
  if (!character || !isColored(character)) return null;
  const on = s.cast.includes(id);
  patch((st) => {
    const cast = on ? st.cast.filter((c) => c !== id) : join(st.cast, id);
    return { cast, characters: withAutoLayout(st.characters, cast) };
  });
  return !on;
}

/** Makes sure a friend is on the play screen; returns true when it had to step on. */
export function bringOnStage(id: string): boolean {
  if (getState().cast.includes(id)) return false;
  return toggleOnStage(id) === true;
}

export function removeCharacter(id: string): boolean {
  const s = getState();
  if (!s.characters.some((c) => c.id === id)) return false;
  ui.clearUndo(id);
  patch((st) => {
    const cast = st.cast.filter((c) => c !== id);
    const characters = withAutoLayout(
      st.characters.filter((c) => c.id !== id),
      cast,
    );
    const activeCharacterId =
      st.activeCharacterId === id ? (characters.at(-1)?.id ?? null) : st.activeCharacterId;
    return { cast, characters, activeCharacterId };
  });
  return true;
}

export function resetAll(): void {
  ui.clearUndo();
  replaceState(initialState());
}

export interface Placement {
  characterId: string;
  position: Position;
  scale?: number;
}

export interface SceneUpdate {
  place?: PlaceId;
  time?: TimeId;
  weather?: WeatherId;
  placements?: Placement[];
}

export function arrangeScene(update: SceneUpdate): StudioState["scene"] {
  patch((st) => {
    const scene = {
      ...st.scene,
      ...(update.place ? { place: update.place } : {}),
      ...(update.time ? { time: update.time } : {}),
      ...(update.weather ? { weather: update.weather } : {}),
    };
    const byId = new Map((update.placements ?? []).map((p) => [p.characterId, p]));
    let cast = st.cast;
    for (const id of byId.keys()) cast = join(cast, id);
    const characters = st.characters.map((c) => {
      const p = byId.get(c.id);
      if (!p) return c;
      const scale =
        p.scale === undefined ? c.scale : Math.min(LIMITS.scale.max, Math.max(LIMITS.scale.min, p.scale));
      return {
        ...c,
        position: { x: clamp01(p.position.x), y: clamp01(p.position.y) },
        placement: "manual" as const,
        scale,
      };
    });
    return { scene, cast, characters: withAutoLayout(characters, cast) };
  });
  return getState().scene;
}

export function moveCharacter(id: string, position: Position): boolean {
  if (!getState().characters.some((c) => c.id === id)) return false;
  arrangeScene({ placements: [{ characterId: id, position }] });
  return true;
}

export function hydrate(state: StudioState): void {
  replaceState({ ...state, characters: withAutoLayout(state.characters, state.cast) });
}
