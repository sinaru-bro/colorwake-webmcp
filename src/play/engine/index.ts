import { clampParams } from "../../content/motions/clamp";
import { PRIMITIVES, partClass, toKeyframes } from "../../content/motions/primitives";
import { FALLBACK_PRESET_ID, STOP_PRESET_ID, findPreset } from "../../content/motions/presets";
import { LIMITS, type PlayMode, type RigId, type Step } from "../../state/types";

export interface ActorHandle {
  root: HTMLElement;
  parts: Map<string, SVGGElement>;
  heightPx: number;
  rig: RigId;
}

export interface PlayRequest {
  characterId: string;
  preset?: string | null;
  steps?: Step[];
  mode: PlayMode;
  speed: number;
  loop: boolean | number;
}

export interface PlayOutcome {
  ok: true;
  durationMs: number;
  skipped: string[];
  fallback: "wiggle" | null;
  deferred: boolean;
}

export type PlayResult = PlayOutcome | { ok: false; code: "unknown_motion" | "no_motion" };

interface Running {
  animations: Animation[];
  preset: string | null;
  loop: boolean;
  cancelled: boolean;
}

const SKETCH_UNITS = 512;
const actors = new Map<string, ActorHandle>();
const running = new Map<string, Running>();
const pending = new Map<string, PlayRequest>();

export function registerActor(characterId: string, handle: ActorHandle): void {
  actors.set(characterId, handle);
  for (const part of handle.parts.values()) {
    const pivot = part.dataset.pivot ?? "";
    part.style.transformBox = "view-box";
    part.style.transformOrigin = pivot ? pivot.replace(/\s+/, "px ") + "px" : "center";
  }
  handle.root.style.transformOrigin = "50% 100%";
  const queued = pending.get(characterId);
  if (queued) {
    pending.delete(characterId);
    play(queued);
  }
}

export function updateActorHeight(characterId: string, heightPx: number): void {
  const handle = actors.get(characterId);
  if (handle) handle.heightPx = heightPx;
}

export function unregisterActor(characterId: string): void {
  stop(characterId);
  actors.delete(characterId);
}

export function stop(characterId: string): boolean {
  const entry = running.get(characterId);
  pending.delete(characterId);
  if (!entry) return false;
  entry.cancelled = true;
  for (const a of entry.animations) a.cancel();
  running.delete(characterId);
  return true;
}

export function stopAll(): void {
  for (const id of [...running.keys()]) stop(id);
  pending.clear();
}

export function current(characterId: string): { preset: string | null; loop: boolean } | null {
  const entry = running.get(characterId);
  return entry ? { preset: entry.preset, loop: entry.loop } : null;
}

interface Compiled {
  target: Element;
  keyframes: Keyframe[];
  options: KeyframeEffectOptions;
  span: number;
}

function compileSteps(
  steps: Step[],
  handle: ActorHandle,
  speed: number,
): { compiled: Compiled[]; skipped: string[] } {
  const compiled: Compiled[] = [];
  const skipped: string[] = [];
  const scale = handle.heightPx / SKETCH_UNITS;
  for (const step of steps.slice(0, LIMITS.maxSteps)) {
    const target = step.part ? handle.parts.get(step.part) : handle.root;
    if (!target) {
      if (step.part) skipped.push(step.part);
      continue;
    }
    const def = PRIMITIVES[step.primitive];
    const ctx = { isPart: Boolean(step.part), partClass: partClass(step.part), speed };
    const { params } = clampParams(step.primitive, step.params, ctx);
    const built = def.build(params, ctx);
    const duration = Math.min(
      LIMITS.durationMs.max,
      Math.max(LIMITS.durationMs.min, step.durationMs ?? def.defaultDurationMs),
    );
    const delay = Math.min(LIMITS.delayMs.max, Math.max(0, step.delayMs ?? 0));
    compiled.push({
      target,
      keyframes: toKeyframes(built.frames, step.part ? 1 : scale),
      options: { ...built.options, duration, delay, easing: step.ease ?? "ease-in-out" },
      span: delay + duration,
    });
  }
  return { compiled, skipped };
}

function iterationsFor(loop: boolean | number, span: number, total: number): number {
  if (loop === true) return Infinity;
  const n = Math.min(LIMITS.loop.max, Math.max(1, Math.round(loop === false ? 1 : loop)));
  return Math.max(1, Math.round((total * n) / span));
}

export function play(req: PlayRequest): PlayResult {
  const handle = actors.get(req.characterId);
  if (!handle) {
    pending.set(req.characterId, req);
    return { ok: true, durationMs: 0, skipped: [], fallback: null, deferred: true };
  }
  if (req.preset === STOP_PRESET_ID) {
    stop(req.characterId);
    return { ok: true, durationMs: 0, skipped: [], fallback: null, deferred: false };
  }
  let steps = req.steps ?? [];
  let mode = req.mode;
  let loop = req.loop;
  let presetId: string | null = null;
  if (req.preset) {
    const found = findPreset(req.preset, handle.rig);
    if (!found) return { ok: false, code: "unknown_motion" };
    steps = found.preset.steps;
    mode = found.preset.mode;
    loop = req.loop ?? found.preset.loop;
    presetId = found.preset.id;
  }
  if (steps.length === 0) return { ok: false, code: "no_motion" };
  const speed = Math.min(LIMITS.speed.max, Math.max(LIMITS.speed.min, req.speed || 1));
  let { compiled, skipped } = compileSteps(steps, handle, speed);
  let fallback: "wiggle" | null = null;
  if (compiled.length === 0) {
    const wiggle = findPreset(FALLBACK_PRESET_ID, handle.rig);
    if (!wiggle) return { ok: false, code: "no_motion" };
    ({ compiled } = compileSteps(wiggle.preset.steps, handle, speed));
    mode = wiggle.preset.mode;
    fallback = "wiggle";
    presetId = presetId ?? FALLBACK_PRESET_ID;
  }
  stop(req.characterId);
  const entry: Running = { animations: [], preset: presetId, loop: loop === true, cancelled: false };
  running.set(req.characterId, entry);
  const total =
    mode === "sequence" ? compiled.reduce((s, c) => s + c.span, 0) : Math.max(...compiled.map((c) => c.span));

  if (mode === "parallel") {
    for (const c of compiled) {
      const anim = c.target.animate(c.keyframes, {
        ...c.options,
        iterations: iterationsFor(loop, c.span, total),
      });
      anim.playbackRate = speed;
      entry.animations.push(anim);
    }
  } else {
    const rounds =
      loop === true
        ? Infinity
        : Math.min(LIMITS.loop.max, Math.max(1, Math.round(loop === false ? 1 : loop)));
    const runSequence = async () => {
      for (let round = 0; round < rounds && !entry.cancelled; round++) {
        for (const c of compiled) {
          if (entry.cancelled) return;
          const anim = c.target.animate(c.keyframes, { ...c.options, iterations: 1 });
          anim.playbackRate = speed;
          entry.animations.push(anim);
          try {
            await anim.finished;
          } catch {
            return;
          }
        }
      }
      if (!entry.cancelled) running.delete(req.characterId);
    };
    void runSequence();
  }
  if (mode === "parallel" && loop !== true) {
    const longest = Math.max(
      ...entry.animations.map((a) => Number(a.effect?.getComputedTiming().endTime ?? 0)),
    );
    setTimeout(
      () => {
        if (running.get(req.characterId) === entry && !entry.cancelled) running.delete(req.characterId);
      },
      longest / speed + 50,
    );
  }
  return { ok: true, durationMs: Math.round(total / speed), skipped, fallback, deferred: false };
}

export const engine = { play, stop, stopAll, current };
