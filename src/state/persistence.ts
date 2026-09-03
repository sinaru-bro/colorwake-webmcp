import { PLACES, TIMES, WEATHERS } from "../content/scenes";
import { sketchById } from "../content/sketches/catalog";
import { isColored } from "./selectors";
import { studioStore } from "./store";
import { DEFAULT_TOOL, LIMITS, type Character, type Paint, type StudioState } from "./types";
import { ui } from "./ui";

export const STORAGE_KEY = "colorwake:studio:v1";
const SAVE_DELAY_MS = 300;

const STROKE_TOOLS = ["pen", "brush", "pencil"];
const STROKE_SIZES = ["s", "m", "l"];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isPaint(v: unknown): v is Paint {
  return (
    isRecord(v) &&
    isRecord(v.fills) &&
    Object.values(v.fills).every((c) => typeof c === "string") &&
    Array.isArray(v.strokes) &&
    v.strokes.every(
      (s: unknown) =>
        isRecord(s) &&
        typeof s.id === "string" &&
        typeof s.region === "string" &&
        typeof s.color === "string" &&
        STROKE_TOOLS.includes(s.tool as string) &&
        STROKE_SIZES.includes(s.size as string) &&
        Array.isArray(s.points) &&
        s.points.every((n) => typeof n === "number"),
    )
  );
}

/** A saved character must be fully renderable; a corrupt one is dropped rather than crash the studio. */
function isCharacter(v: unknown): v is Character {
  return (
    isRecord(v) &&
    typeof v.id === "string" &&
    typeof v.sketchId === "string" &&
    sketchById(v.sketchId) !== undefined &&
    isPaint(v.paint) &&
    isRecord(v.position) &&
    typeof v.position.x === "number" &&
    typeof v.position.y === "number" &&
    (v.placement === "auto" || v.placement === "manual") &&
    typeof v.scale === "number" &&
    typeof v.createdAt === "number"
  );
}

function isTool(v: unknown): v is StudioState["tool"] {
  return (
    isRecord(v) &&
    ["fill", ...STROKE_TOOLS].includes(v.tool as string) &&
    typeof v.color === "string" &&
    STROKE_SIZES.includes(v.size as string)
  );
}

export function parseSaved(raw: string | null): StudioState | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(data) || data.version !== 1 || !Array.isArray(data.characters)) return null;
  const characters = data.characters.filter(isCharacter);
  const mode = data.mode === "play" ? "play" : "color";
  const activeCharacterId =
    typeof data.activeCharacterId === "string" && characters.some((c) => c.id === data.activeCharacterId)
      ? data.activeCharacterId
      : null;
  const ids = new Set(characters.map((c) => c.id));
  const cast = Array.isArray(data.cast)
    ? data.cast.filter((id): id is string => typeof id === "string" && ids.has(id)).slice(-LIMITS.maxOnStage)
    : characters
        .filter(isColored)
        .slice(-LIMITS.maxOnStage)
        .map((c) => c.id);
  const savedScene = isRecord(data.scene) ? data.scene : {};
  const axis = <T extends string>(v: unknown, known: ReadonlyArray<{ id: string }>): T | null =>
    typeof v === "string" && known.some((k) => k.id === v) ? (v as T) : null;
  const scene: StudioState["scene"] = {
    place: axis(savedScene.place, PLACES),
    time: axis(savedScene.time, TIMES),
    weather: axis(savedScene.weather, WEATHERS),
  };
  return {
    version: 1,
    mode,
    characters,
    activeCharacterId,
    cast,
    tool: isTool(data.tool) ? data.tool : { ...DEFAULT_TOOL },
    scene,
    updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : Date.now(),
  };
}

export function loadSaved(): StudioState | null {
  try {
    return parseSaved(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function saveNow(state: StudioState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    ui.setStorageError(false);
    return true;
  } catch {
    ui.setStorageError(true);
    return false;
  }
}

export function startAutosave(): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const unsubscribe = studioStore.subscribe((state) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => saveNow(state), SAVE_DELAY_MS);
  });
  return () => {
    if (timer) clearTimeout(timer);
    unsubscribe();
  };
}
