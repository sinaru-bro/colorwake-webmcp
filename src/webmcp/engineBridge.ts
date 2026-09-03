import type { PlaceAction } from "../content/scenes/actions";
import type { PlayMode, Pose, Position, Step } from "../state/types";

export type PresetSource = "rig" | "universal" | "other";

export interface EnginePlayRequest {
  characterId: string;
  preset: string | null;
  presetSource: PresetSource | null;
  variant?: string | null;
  steps: Step[];
  mode: PlayMode;
  speed: number;
  /** true loops until stopped; "auto" loops for a few seconds, then ends. */
  loop: boolean | number | "auto";
  pose?: Pose | null;
  /** A prop action; `steps` are then its limb moves. */
  action?: PlaceAction | null;
  /** Called when a motion ends somewhere new — a path action or a held move — with where the friend now stands. */
  onSettle?: (position: Position) => void;
}

export type EnginePlayResult =
  | {
      ok: true;
      durationMs: number;
      skipped: string[];
      fallback: "wiggle" | null;
      /** The actor was not mounted yet; the motion starts once it is and durationMs is 0. */
      deferred?: boolean;
    }
  | { ok: false; code: string };

export interface EngineCurrent {
  preset: string | null;
  variant: string | null;
  action: string | null;
  loop: boolean;
}

export interface Engine {
  play(req: EnginePlayRequest): EnginePlayResult;
  stop(characterId: string): void;
  stopAll(): void;
  current(characterId: string): EngineCurrent | null;
  /** The play screen's size in pixels, once it has been laid out. */
  stageSize(): { w: number; h: number } | null;
}

const noopEngine: Engine = {
  play: () => ({ ok: true, durationMs: 0, skipped: [], fallback: null }),
  stop: () => undefined,
  stopAll: () => undefined,
  current: () => null,
  stageSize: () => null,
};

let engine: Engine = noopEngine;

export function setEngine(impl: Engine | null): void {
  engine = impl ?? noopEngine;
}

export function getEngine(): Engine {
  return engine;
}
