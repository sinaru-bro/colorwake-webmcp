import type { PlayMode, Step } from "../state/types";

export type PresetSource = "rig" | "universal" | "other";

export interface EnginePlayRequest {
  characterId: string;
  preset: string | null;
  presetSource: PresetSource | null;
  steps: Step[];
  mode: PlayMode;
  speed: number;
  loop: boolean | number;
}

export type EnginePlayResult =
  | { ok: true; durationMs: number; skipped: string[]; fallback: "wiggle" | null }
  | { ok: false; code: string };

export interface EngineCurrent {
  preset: string | null;
  loop: boolean;
}

export interface Engine {
  play(req: EnginePlayRequest): EnginePlayResult;
  stop(characterId: string): void;
  stopAll(): void;
  current(characterId: string): EngineCurrent | null;
}

const noopEngine: Engine = {
  play: () => ({ ok: true, durationMs: 0, skipped: [], fallback: null }),
  stop: () => undefined,
  stopAll: () => undefined,
  current: () => null,
};

let engine: Engine = noopEngine;

export function setEngine(impl: Engine | null): void {
  engine = impl ?? noopEngine;
}

export function getEngine(): Engine {
  return engine;
}
