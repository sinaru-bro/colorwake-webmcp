import { sketchById } from "../content/sketches/catalog";
import { isColored } from "./selectors";
import { studioStore } from "./store";
import { LIMITS, type StudioState } from "./types";
import { ui } from "./ui";

export const STORAGE_KEY = "colorwake:studio:v1";
const SAVE_DELAY_MS = 300;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
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
  const characters = data.characters.filter(
    (c: unknown): c is StudioState["characters"][number] =>
      isRecord(c) &&
      typeof c.sketchId === "string" &&
      sketchById(c.sketchId) !== undefined &&
      isRecord(c.paint),
  );
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
  const savedScene = isRecord(data.scene) ? data.scene : null;
  const tool = isRecord(data.tool) ? (data.tool as unknown as StudioState["tool"]) : null;
  if (!savedScene || !tool) return null;
  const axis = <T extends string>(v: unknown): T | null => (typeof v === "string" ? (v as T) : null);
  const scene: StudioState["scene"] = {
    place: axis(savedScene.place),
    time: axis(savedScene.time),
    weather: axis(savedScene.weather),
  };
  return {
    version: 1,
    mode,
    characters,
    activeCharacterId,
    cast,
    tool,
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
