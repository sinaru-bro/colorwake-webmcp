import { sketchById } from "../content/sketches/catalog";
import { MAX_EFFECTS } from "../content/effects";
import { newId } from "../lib/ids";
import { activeCharacter, coloredCharacters, isColored } from "./selectors";
import { getState, patch, replaceState, initialState } from "./store";
import {
  ANCHORS,
  LIMITS,
  type ActiveEffect,
  type Character,
  type EffectId,
  type Intensity,
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
  4: [0.15, 0.38, 0.62, 0.85],
};

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function withAutoLayout(characters: Character[]): Character[] {
  const auto = characters.filter((c) => c.placement === "auto");
  const xs = AUTO_LAYOUT[Math.min(4, auto.length)] ?? AUTO_LAYOUT[4];
  let i = 0;
  return characters.map((c) => {
    if (c.placement !== "auto") return c;
    const x = xs[Math.min(i, xs.length - 1)];
    i += 1;
    return { ...c, position: { x, y: GROUND_Y } };
  });
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
    ui.setDoneSheet(false);
    return { ok: true, character: replaced, replaced: true, switchedTo };
  }
  if (s.characters.length >= LIMITS.maxCharacters) return { ok: false, code: "tray_full" };
  const created = newCharacter(sketchId);
  patch((st) => ({
    mode: "color",
    characters: withAutoLayout([...st.characters, created]),
    activeCharacterId: created.id,
  }));
  ui.setDoneSheet(false);
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
    patch(() => ({ mode: "play" }));
    ui.setDoneSheet(false);
    return { ok: true, saved: active.id, dropped: null, already: false };
  }
  if (coloredCharacters(s).length === 0) return { ok: false, code: "not_colored_yet" };
  const dropped = active?.id ?? null;
  patch((st) => ({
    mode: "play",
    characters: withAutoLayout(st.characters.filter((c) => c.id !== dropped)),
    activeCharacterId: coloredCharacters(st).at(-1)?.id ?? null,
  }));
  ui.setDoneSheet(false);
  return { ok: true, saved: null, dropped, already: false };
}

export type ColorAnotherResult = { ok: true; saved: string | null; already: boolean };

export function colorAnother(): ColorAnotherResult {
  const s = getState();
  const active = activeCharacter(s);
  if (s.mode === "color" && !active) return { ok: true, saved: null, already: true };
  const keep = active && isColored(active);
  patch((st) => ({
    mode: "color",
    characters: keep || !active ? st.characters : st.characters.filter((c) => c.id !== active.id),
    activeCharacterId: null,
  }));
  if (active && !keep) ui.clearUndo(active.id);
  ui.setDoneSheet(false);
  return { ok: true, saved: keep ? active.id : null, already: false };
}

export function selectCharacter(id: string): boolean {
  if (!getState().characters.some((c) => c.id === id)) return false;
  patch(() => ({ mode: "color", activeCharacterId: id }));
  return true;
}

export function removeCharacter(id: string): boolean {
  const s = getState();
  if (!s.characters.some((c) => c.id === id)) return false;
  ui.clearUndo(id);
  patch((st) => {
    const characters = withAutoLayout(st.characters.filter((c) => c.id !== id));
    const activeCharacterId =
      st.activeCharacterId === id ? (characters.at(-1)?.id ?? null) : st.activeCharacterId;
    return { characters, activeCharacterId };
  });
  return true;
}

export function resetAll(): void {
  ui.clearSkipped();
  ui.clearUndo();
  ui.setDoneSheet(false);
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
    return { scene, characters: withAutoLayout(characters) };
  });
  return getState().scene;
}

export function moveCharacter(id: string, position: Position): boolean {
  if (!getState().characters.some((c) => c.id === id)) return false;
  arrangeScene({ placements: [{ characterId: id, position }] });
  return true;
}

export type EffectResult =
  { ok: true; effects: ActiveEffect[]; updated: boolean } | { ok: false; code: "too_many_effects" };

export function setEffect(
  id: EffectId | "none",
  on = true,
  intensity: Intensity = "normal",
  target?: string,
): EffectResult {
  if (id === "none") {
    patch((st) => ({ scene: { ...st.scene, effects: [] } }));
    return { ok: true, effects: [], updated: false };
  }
  const current = getState().scene.effects;
  const idx = current.findIndex((e) => e.id === id && e.target === target);
  if (!on) {
    const effects = idx === -1 ? current : current.filter((_, i) => i !== idx);
    patch((st) => ({ scene: { ...st.scene, effects } }));
    return { ok: true, effects, updated: false };
  }
  if (idx !== -1) {
    const effects = current.map((e, i) => (i === idx ? { ...e, intensity } : e));
    patch((st) => ({ scene: { ...st.scene, effects } }));
    return { ok: true, effects, updated: true };
  }
  if (current.length >= MAX_EFFECTS) return { ok: false, code: "too_many_effects" };
  const effect: ActiveEffect = target ? { id, intensity, target } : { id, intensity };
  const effects = [...current, effect];
  patch((st) => ({ scene: { ...st.scene, effects } }));
  return { ok: true, effects, updated: false };
}

export function hydrate(state: StudioState): void {
  replaceState({ ...state, characters: withAutoLayout(state.characters) });
}

export function startFresh(): void {
  resetAll();
}
